import { RoomState, PublicRoomState, DrawStrokePayload } from 'shared';
import { Server } from 'socket.io';
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
export declare class RoomService {
    private readonly logger;
    private rooms;
    private server;
    setServer(server: Server): void;
    generateRoomCode(): string;
    createRoom(): string;
    getRoom(code: string): InternalRoom | undefined;
    joinRoom(code: string, nickname: string, playerToken: string, socketId: string): {
        room: InternalRoom;
        playerId: string;
        isNew: boolean;
    };
    leaveRoom(socketId: string): void;
    setReady(code: string, playerId: string, isReady: boolean): void;
    startGame(code: string, playerId: string): void;
    private startTurn;
    advanceTurn(code: string): void;
    addStroke(code: string, playerId: string, stroke: DrawStrokePayload): void;
    vote(code: string, voterId: string, votedId: string): void;
    private tallyVotes;
    guessWord(code: string, playerId: string, guess: string): void;
    playAgain(code: string, playerId: string): void;
    getPublicState(room: InternalRoom): PublicRoomState;
    broadcastRoomState(room: InternalRoom): void;
}
