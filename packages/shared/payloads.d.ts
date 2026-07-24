import { Player, RoomState } from './types';
export interface JoinRoomPayload {
    roomCode: string;
    nickname: string;
    playerToken: string;
}
export interface JoinRoomResponse {
    playerId: string;
    playerToken: string;
}
export interface StrokePoint {
    x: number;
    y: number;
}
export interface DrawStrokePayload {
    points: StrokePoint[];
    color: string;
}
export interface VotePayload {
    votedPlayerId: string;
}
export interface GuessWordPayload {
    guess: string;
}
export interface PublicRoomState {
    roomCode: string;
    state: RoomState;
    players: Player[];
    hostId: string;
    currentTurnPlayerId: string | null;
    turnStartTime: number | null;
    roundNumber: number;
    strokes: DrawStrokePayload[];
    category: string | null;
    votes: Record<string, string>;
    fakeArtistCaught: boolean | null;
    winner: 'FA' | 'ARTISTS' | null;
    secretWord: string | null;
}
export interface RoleAssignmentPayload {
    isFakeArtist: boolean;
    secretWord: string | null;
    playerId: string;
}
