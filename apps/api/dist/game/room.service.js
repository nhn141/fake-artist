"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RoomService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("shared");
const words_1 = require("./words");
const MAX_PLAYERS = 10;
const MIN_PLAYERS = 4;
const TURN_TIME_MS = 18000;
const COLORS = [
    '#ef4444',
    '#3b82f6',
    '#22c55e',
    '#eab308',
    '#a855f7',
    '#ec4899',
    '#f97316',
    '#14b8a6',
    '#6366f1',
    '#84cc16',
];
let RoomService = RoomService_1 = class RoomService {
    logger = new common_1.Logger(RoomService_1.name);
    rooms = new Map();
    server;
    setServer(server) {
        this.server = server;
    }
    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        do {
            code = '';
            for (let i = 0; i < 4; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (this.rooms.has(code));
        return code;
    }
    createRoom() {
        const code = this.generateRoomCode();
        this.rooms.set(code, {
            code,
            state: shared_1.RoomState.LOBBY,
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
    getRoom(code) {
        return this.rooms.get(code.toUpperCase());
    }
    joinRoom(code, nickname, playerToken, socketId) {
        const room = this.getRoom(code);
        if (!room) {
            throw new Error('Room not found');
        }
        const trimmedName = nickname.trim();
        if (!trimmedName)
            throw new Error('Nickname cannot be empty');
        let existingPlayer = room.players.find(p => p.token === playerToken);
        if (existingPlayer) {
            existingPlayer.socketId = socketId;
            return { room, playerId: existingPlayer.id, isNew: false };
        }
        if (room.players.some(p => p.nickname.toLowerCase() === trimmedName.toLowerCase())) {
            throw new Error('Nickname already taken');
        }
        if (room.state !== shared_1.RoomState.LOBBY && room.state !== shared_1.RoomState.END) {
            throw new Error('Cannot join game in progress');
        }
        if (room.players.length >= MAX_PLAYERS) {
            throw new Error('Room is full');
        }
        const playerId = Math.random().toString(36).substring(2, 9);
        const color = COLORS[room.players.length % COLORS.length];
        const newPlayer = {
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
    leaveRoom(socketId) {
        for (const [code, room] of this.rooms.entries()) {
            const player = room.players.find(p => p.socketId === socketId);
            if (player) {
                player.socketId = null;
                if (room.players.every(p => p.socketId === null)) {
                    if (room.turnTimer)
                        clearTimeout(room.turnTimer);
                    this.rooms.delete(code);
                }
                else {
                    if (room.hostId === player.id && room.state === shared_1.RoomState.LOBBY) {
                        const nextPlayer = room.players.find(p => p.socketId !== null);
                        if (nextPlayer)
                            room.hostId = nextPlayer.id;
                    }
                    this.broadcastRoomState(room);
                }
            }
        }
    }
    setReady(code, playerId, isReady) {
        const room = this.getRoom(code);
        if (!room || room.state !== shared_1.RoomState.LOBBY)
            return;
        const player = room.players.find(p => p.id === playerId);
        if (player) {
            player.isReady = isReady;
            this.broadcastRoomState(room);
        }
    }
    startGame(code, playerId) {
        const room = this.getRoom(code);
        if (!room)
            return;
        if (room.hostId !== playerId)
            throw new Error('Only host can start game');
        const { category, word } = (0, words_1.getRandomCategoryAndWord)();
        room.category = category;
        room.secretWord = word;
        const faIndex = Math.floor(Math.random() * room.players.length);
        room.fakeArtistId = room.players[faIndex].id;
        room.turnOrder = [...room.players.map(p => p.id)].sort(() => Math.random() - 0.5);
        room.state = shared_1.RoomState.DRAWING;
        room.strokes = [];
        room.votes = {};
        room.winner = null;
        room.fakeArtistCaught = null;
        room.guessedWord = null;
        room.currentRound = 1;
        room.currentTurnIndex = 0;
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
    startTurn(room) {
        if (room.turnTimer)
            clearTimeout(room.turnTimer);
        room.turnStartTime = Date.now();
        room.turnTimer = setTimeout(() => {
            this.advanceTurn(room.code);
        }, TURN_TIME_MS);
        this.broadcastRoomState(room);
    }
    advanceTurn(code) {
        const room = this.getRoom(code);
        if (!room)
            return;
        if (room.turnTimer)
            clearTimeout(room.turnTimer);
        room.currentTurnIndex++;
        if (room.currentTurnIndex >= room.turnOrder.length) {
            room.currentRound++;
            room.currentTurnIndex = 0;
            if (room.currentRound > 2) {
                room.state = shared_1.RoomState.VOTING;
                room.currentRound = 2;
                room.currentTurnIndex = 0;
                room.turnStartTime = null;
                this.broadcastRoomState(room);
                return;
            }
        }
        this.startTurn(room);
    }
    addStroke(code, playerId, stroke) {
        const room = this.getRoom(code);
        if (!room || room.state !== shared_1.RoomState.DRAWING)
            return;
        const currentTurnPlayerId = room.turnOrder[room.currentTurnIndex];
        if (currentTurnPlayerId !== playerId)
            throw new Error('Not your turn');
        room.strokes.push(stroke);
        this.advanceTurn(code);
    }
    vote(code, voterId, votedId) {
        const room = this.getRoom(code);
        if (!room || room.state !== shared_1.RoomState.VOTING)
            return;
        room.votes[voterId] = votedId;
        if (Object.keys(room.votes).length === room.players.length) {
            this.tallyVotes(room);
        }
        else {
            this.broadcastRoomState(room);
        }
    }
    tallyVotes(room) {
        const voteCounts = {};
        for (const v of Object.values(room.votes)) {
            voteCounts[v] = (voteCounts[v] || 0) + 1;
        }
        let maxVotes = 0;
        let mostVotedIds = [];
        for (const [id, count] of Object.entries(voteCounts)) {
            if (count > maxVotes) {
                maxVotes = count;
                mostVotedIds = [id];
            }
            else if (count === maxVotes) {
                mostVotedIds.push(id);
            }
        }
        if (mostVotedIds.includes(room.fakeArtistId)) {
            room.fakeArtistCaught = true;
            room.state = shared_1.RoomState.GUESSING;
        }
        else {
            room.fakeArtistCaught = false;
            room.winner = 'FA';
            room.state = shared_1.RoomState.END;
        }
        this.broadcastRoomState(room);
    }
    guessWord(code, playerId, guess) {
        const room = this.getRoom(code);
        if (!room || room.state !== shared_1.RoomState.GUESSING)
            return;
        if (room.fakeArtistId !== playerId)
            throw new Error('Only FA can guess');
        const isCorrect = guess.trim().toLowerCase() === room.secretWord?.toLowerCase();
        room.guessedWord = guess;
        if (isCorrect) {
            room.winner = 'FA';
        }
        else {
            room.winner = 'ARTISTS';
        }
        room.state = shared_1.RoomState.END;
        this.broadcastRoomState(room);
    }
    playAgain(code, playerId) {
        const room = this.getRoom(code);
        if (!room || room.state !== shared_1.RoomState.END)
            return;
        if (room.hostId !== playerId)
            throw new Error('Only host can reset game');
        room.state = shared_1.RoomState.LOBBY;
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
    getPublicState(room) {
        const currentTurnPlayerId = room.state === shared_1.RoomState.DRAWING
            ? room.turnOrder[room.currentTurnIndex]
            : null;
        const isEnd = room.state === shared_1.RoomState.END;
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
            secretWord: isEnd ? room.secretWord : null,
            guessedWord: isEnd ? room.guessedWord : null,
            players: room.players.map(p => ({
                id: p.id,
                nickname: p.nickname,
                color: p.color,
                isHost: p.id === room.hostId,
                isConnected: p.socketId !== null,
                isReady: p.isReady,
                isFakeArtist: isEnd ? (p.id === room.fakeArtistId) : undefined
            })),
        };
    }
    broadcastRoomState(room) {
        if (!this.server)
            return;
        const publicState = this.getPublicState(room);
        this.server.to(room.code).emit('ROOM_STATE_UPDATE', publicState);
    }
};
exports.RoomService = RoomService;
exports.RoomService = RoomService = RoomService_1 = __decorate([
    (0, common_1.Injectable)()
], RoomService);
//# sourceMappingURL=room.service.js.map