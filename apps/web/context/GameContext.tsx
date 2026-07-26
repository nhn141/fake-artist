'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  PublicRoomState, 
  RoleAssignmentPayload,
  ClientEvents,
  ServerEvents,
  DrawStrokePayload,
  EmojiPayload
} from 'shared';

export interface FloatingEmoji {
  id: number;
  emoji: string;
  playerId: string;
  x: number;
}

interface GameContextType {
  socket: Socket | null;
  roomState: PublicRoomState | null;
  playerId: string | null;
  playerToken: string | null;
  role: RoleAssignmentPayload | null;
  error: string | null;
  emojis: FloatingEmoji[];
  
  createRoom: () => void;
  joinRoom: (code: string, nickname: string) => void;
  startGame: () => void;
  drawStroke: (stroke: DrawStrokePayload) => void;
  vote: (votedId: string) => void;
  guessWord: (guess: string) => void;
  playAgain: () => void;
  sendEmoji: (emoji: string) => void;
  setReady: (isReady: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomState, setRoomState] = useState<PublicRoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerToken, setPlayerToken] = useState<string | null>(null);
  const [role, setRole] = useState<RoleAssignmentPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);

  useEffect(() => {
    // Generate token if not exists
    let token = sessionStorage.getItem('fake_artist_token');
    if (!token) {
      token = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('fake_artist_token', token);
    }
    setPlayerToken(token);

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
    setSocket(newSocket);

    newSocket.on(ServerEvents.ROOM_STATE_UPDATE, (state: PublicRoomState) => {
      setRoomState(state);
      setError(null);
    });

    newSocket.on(ServerEvents.ROLE_ASSIGNMENT, (payload: RoleAssignmentPayload) => {
      setRole(payload);
    });

    newSocket.on(ServerEvents.ERROR, (payload: { message: string }) => {
      setError(payload.message);
    });

    newSocket.on(ServerEvents.RECEIVE_EMOJI, (payload: EmojiPayload) => {
      const id = Date.now() + Math.random();
      const x = 10 + Math.random() * 80; // random horizontal pos (10% to 90%)
      const newEmoji = { id, emoji: payload.emoji, playerId: payload.playerId, x };
      
      setEmojis(prev => [...prev, newEmoji]);
      
      // Auto remove after 2.5s (animation duration)
      setTimeout(() => {
        setEmojis(prev => prev.filter(e => e.id !== id));
      }, 2500);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const createRoom = () => {
    if (!socket) return;
    socket.emit('CREATE_ROOM', {}, (res: { roomCode: string }) => {
      const nickname = sessionStorage.getItem('fake_artist_nickname') || 'Host';
      joinRoom(res.roomCode, nickname);
    });
  };

  const joinRoom = (code: string, nickname: string) => {
    if (!socket || !playerToken) return;
    sessionStorage.setItem('fake_artist_nickname', nickname);
    
    socket.emit(ClientEvents.JOIN_ROOM, {
      roomCode: code,
      nickname,
      playerToken
    }, (res: { success: boolean, playerId?: string, error?: string }) => {
      if (res.success && res.playerId) {
        setPlayerId(res.playerId);
      } else {
        setError(res.error || 'Failed to join');
      }
    });
  };

  const startGame = () => {
    if (!socket || !roomState || !playerId) return;
    socket.emit(ClientEvents.START_GAME, { roomCode: roomState.roomCode, playerId });
  };

  const drawStroke = (stroke: DrawStrokePayload) => {
    if (!socket || !roomState || !playerId) return;
    socket.emit(ClientEvents.DRAW_STROKE, { roomCode: roomState.roomCode, playerId, stroke });
  };

  const vote = (votedId: string) => {
    if (!socket || !roomState || !playerId) return;
    socket.emit(ClientEvents.VOTE_FAKE_ARTIST, { roomCode: roomState.roomCode, voterId: playerId, votedId });
  };

  const guessWord = (guess: string) => {
    if (!socket || !roomState || !playerId) return;
    socket.emit(ClientEvents.GUESS_WORD, { roomCode: roomState.roomCode, playerId, guess });
  };

  const playAgain = () => {
    if (!socket || !roomState || !playerId) return;
    socket.emit(ClientEvents.PLAY_AGAIN, { roomCode: roomState.roomCode, playerId });
  };

  const setReady = (isReady: boolean) => {
    if (!socket || !roomState || !playerId) return;
    socket.emit(ClientEvents.SET_READY, { roomCode: roomState.roomCode, playerId, isReady });
  };

  const sendEmoji = (emoji: string) => {
    if (!socket || !roomState || !playerId) return;
    socket.emit(ClientEvents.SEND_EMOJI, { roomCode: roomState.roomCode, playerId, emoji });
  };

  return (
    <GameContext.Provider value={{
      socket, roomState, playerId, playerToken, role, error, emojis,
      createRoom, joinRoom, startGame, drawStroke, vote, guessWord, playAgain, sendEmoji, setReady
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
