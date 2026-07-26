import { Injectable, Logger } from '@nestjs/common';
import { 
  RoomState, 
  Player, 
  PublicRoomState, 
  DrawStrokePayload 
} from 'shared';
import { getRandomCategoryAndWord } from './words';
import { Server } from 'socket.io';

const MAX_PLAYERS = 10;
const MIN_PLAYERS = 4;
const TURN_TIME_MS = 18000; // 15s + 3s grace period

export interface InternalPlayer {
  id: string;
  token: string;
  nickname: string;
  color: string;
  socketId: string | null;
  isReady: boolean;
}

export interface InternalRoom {
  code: string;
  state: RoomState;
  players: InternalPlayer[];
  hostId: string;
  
  secretWord: string | null;
  category: string | null;
  fakeArtistId: string | null;
  
  turnOrder: string[];
  currentTurnIndex: number;
  currentRound: number;
  
  turnTimer: NodeJS.Timeout | null;
  turnStartTime: number | null;
  
  strokes: DrawStrokePayload[];
  votes: Record<string, string>;
  
  winner: 'FA' | 'ARTISTS' | null;
  fakeArtistCaught: boolean | null;
  guessedWord: string | null;
}

const COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#a855f7', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#84cc16', // lime
];

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);
  
  // roomCode -> InternalRoom
  private rooms = new Map<string, InternalRoom>();
  
  // server instance for broadcasting
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0,O,1,I
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(): string {
    const code = this.generateRoomCode();
    this.rooms.set(code, {
      code,
      state: RoomState.LOBBY,
      players: [],
      hostId: '',
      secretWord: null,
      category: null,
      fakeArtistId: null,
      turnOrder: [],
      currentTurnIndex: 0,
      currentRound: 1,
      turnTimer: null,
      turnStartTime: null,
      strokes: [],
      votes: {},
      winner: null,
      fakeArtistCaught: null,
      guessedWord: null,
    });
    return code;
  }

  getRoom(code: string): InternalRoom | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  joinRoom(code: string, nickname: string, playerToken: string, socketId: string): { room: InternalRoom, playerId: string, isNew: boolean } {
    const room = this.getRoom(code);
    if (!room) {
      throw new Error('Room not found');
    }

    const trimmedName = nickname.trim();
    if (!trimmedName) throw new Error('Nickname cannot be empty');

    // Check if player reconnecting
    let existingPlayer = room.players.find(p => p.token === playerToken);
    
    if (existingPlayer) {
      existingPlayer.socketId = socketId;
      return { room, playerId: existingPlayer.id, isNew: false };
    }

    // Name conflict check (case-insensitive)
    if (room.players.some(p => p.nickname.toLowerCase() === trimmedName.toLowerCase())) {
      throw new Error('Nickname already taken');
    }

    if (room.state !== RoomState.LOBBY && room.state !== RoomState.END) {
      throw new Error('Cannot join game in progress');
    }

    if (room.players.length >= MAX_PLAYERS) {
      throw new Error('Room is full');
    }

    const playerId = Math.random().toString(36).substring(2, 9);
    const color = COLORS[room.players.length % COLORS.length];

    const newPlayer: InternalPlayer = {
      id: playerId,
      token: playerToken,
      nickname: trimmedName,
      color,
      socketId,
      isReady: false,
    };

    if (room.players.length === 0) {
      room.hostId = playerId;
    }

    room.players.push(newPlayer);
    
    return { room, playerId, isNew: true };
  }

  leaveRoom(socketId: string) {
    for (const [code, room] of this.rooms.entries()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        player.socketId = null;
        
        // If everyone left, delete room
        if (room.players.every(p => p.socketId === null)) {
          if (room.turnTimer) clearTimeout(room.turnTimer);
          this.rooms.delete(code);
        } else {
          // Reassign host if host left
          if (room.hostId === player.id && room.state === RoomState.LOBBY) {
            const nextPlayer = room.players.find(p => p.socketId !== null);
            if (nextPlayer) room.hostId = nextPlayer.id;
          }
          this.broadcastRoomState(room);
        }
      }
    }
  }

  setReady(code: string, playerId: string, isReady: boolean) {
    const room = this.getRoom(code);
    if (!room || room.state !== RoomState.LOBBY) return;
    
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.isReady = isReady;
      this.broadcastRoomState(room);
    }
  }

  startGame(code: string, playerId: string) {
    const room = this.getRoom(code);
    if (!room) return;
    if (room.hostId !== playerId) throw new Error('Only host can start game');
    // if (room.players.length < MIN_PLAYERS) throw new Error(`Need at least ${MIN_PLAYERS} players`); // Relaxed for testing

    const { category, word } = getRandomCategoryAndWord();
    room.category = category;
    room.secretWord = word;
    
    // Assign FA
    const faIndex = Math.floor(Math.random() * room.players.length);
    room.fakeArtistId = room.players[faIndex].id;

    // Determine turn order (shuffle)
    room.turnOrder = [...room.players.map(p => p.id)].sort(() => Math.random() - 0.5);
    
    // Reset state
    room.state = RoomState.DRAWING;
    room.strokes = [];
    room.votes = {};
    room.winner = null;
    room.fakeArtistCaught = null;
    room.guessedWord = null;
    room.currentRound = 1;
    room.currentTurnIndex = 0;

    // Send private role info to everyone
    for (const p of room.players) {
      if (p.socketId) {
        const isFA = p.id === room.fakeArtistId;
        this.server.to(p.socketId).emit('ROLE_ASSIGNMENT', {
          isFakeArtist: isFA,
          secretWord: isFA ? null : room.secretWord,
          playerId: p.id
        });
      }
    }

    this.startTurn(room);
  }

  private startTurn(room: InternalRoom) {
    if (room.turnTimer) clearTimeout(room.turnTimer);
    
    room.turnStartTime = Date.now();
    
    room.turnTimer = setTimeout(() => {
      this.advanceTurn(room.code);
    }, TURN_TIME_MS);

    this.broadcastRoomState(room);
  }

  advanceTurn(code: string) {
    const room = this.getRoom(code);
    if (!room) return;
    
    if (room.turnTimer) clearTimeout(room.turnTimer);
    
    room.currentTurnIndex++;
    if (room.currentTurnIndex >= room.turnOrder.length) {
      // Round over
      room.currentRound++;
      room.currentTurnIndex = 0;
      
      if (room.currentRound > 2) {
        // Game drawing phase over -> voting
        room.state = RoomState.VOTING;
        room.currentRound = 2; // Keep at 2 for UI
        room.currentTurnIndex = 0;
        room.turnStartTime = null;
        this.broadcastRoomState(room);
        return;
      }
    }
    
    this.startTurn(room);
  }

  addStroke(code: string, playerId: string, stroke: DrawStrokePayload) {
    const room = this.getRoom(code);
    if (!room || room.state !== RoomState.DRAWING) return;
    
    const currentTurnPlayerId = room.turnOrder[room.currentTurnIndex];
    if (currentTurnPlayerId !== playerId) throw new Error('Not your turn');

    room.strokes.push(stroke);
    
    // Auto advance when stroke submitted
    this.advanceTurn(code);
  }

  vote(code: string, voterId: string, votedId: string) {
    const room = this.getRoom(code);
    if (!room || room.state !== RoomState.VOTING) return;
    
    room.votes[voterId] = votedId;
    
    // Check if everyone voted
    if (Object.keys(room.votes).length === room.players.length) {
      this.tallyVotes(room);
    } else {
      this.broadcastRoomState(room);
    }
  }

  private tallyVotes(room: InternalRoom) {
    const voteCounts: Record<string, number> = {};
    for (const v of Object.values(room.votes)) {
      voteCounts[v] = (voteCounts[v] || 0) + 1;
    }
    
    let maxVotes = 0;
    let mostVotedIds: string[] = [];
    
    for (const [id, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedIds = [id];
      } else if (count === maxVotes) {
        mostVotedIds.push(id);
      }
    }

    // FA caught if they are among the most voted (or solely most voted)
    if (mostVotedIds.includes(room.fakeArtistId!)) {
      room.fakeArtistCaught = true;
      room.state = RoomState.GUESSING;
    } else {
      room.fakeArtistCaught = false;
      room.winner = 'FA';
      room.state = RoomState.END;
    }
    
    this.broadcastRoomState(room);
  }

  guessWord(code: string, playerId: string, guess: string) {
    const room = this.getRoom(code);
    if (!room || room.state !== RoomState.GUESSING) return;
    if (room.fakeArtistId !== playerId) throw new Error('Only FA can guess');

    const isCorrect = guess.trim().toLowerCase() === room.secretWord?.toLowerCase();
    
    room.guessedWord = guess;
    
    if (isCorrect) {
      room.winner = 'FA';
    } else {
      room.winner = 'ARTISTS';
    }
    
    room.state = RoomState.END;
    this.broadcastRoomState(room);
  }

  playAgain(code: string, playerId: string) {
    const room = this.getRoom(code);
    if (!room || room.state !== RoomState.END) return;
    if (room.hostId !== playerId) throw new Error('Only host can reset game');

    room.state = RoomState.LOBBY;
    room.secretWord = null;
    room.category = null;
    room.fakeArtistId = null;
    room.turnOrder = [];
    room.players.forEach(p => p.isReady = false);
    room.strokes = [];
    room.votes = {};
    room.winner = null;
    room.fakeArtistCaught = null;
    room.guessedWord = null;
    room.turnTimer = null;
    
    this.broadcastRoomState(room);
  }

  getPublicState(room: InternalRoom): PublicRoomState {
    const currentTurnPlayerId = room.state === RoomState.DRAWING 
      ? room.turnOrder[room.currentTurnIndex] 
      : null;
      
    const isEnd = room.state === RoomState.END;

    return {
      roomCode: room.code,
      state: room.state,
      hostId: room.hostId,
      currentTurnPlayerId,
      turnStartTime: room.turnStartTime,
      roundNumber: room.currentRound,
      strokes: room.strokes,
      category: room.category,
      votes: room.votes,
      fakeArtistCaught: room.fakeArtistCaught,
      winner: room.winner,
      secretWord: isEnd ? room.secretWord : null, // Only reveal at END
      guessedWord: isEnd ? room.guessedWord : null,
      players: room.players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        color: p.color,
        isHost: p.id === room.hostId,
        isConnected: p.socketId !== null,
        isReady: p.isReady,
        isFakeArtist: isEnd ? (p.id === room.fakeArtistId) : undefined // Only reveal FA at end in public state
      })),
    };
  }

  broadcastRoomState(room: InternalRoom) {
    if (!this.server) return;
    const publicState = this.getPublicState(room);
    this.server.to(room.code).emit('ROOM_STATE_UPDATE', publicState);
  }
}
