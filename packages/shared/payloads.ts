import { Player, RoomState } from './types';

export interface JoinRoomPayload {
  roomCode: string;
  nickname: string;
  playerToken: string; // Token from localStorage for reconnects
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

// State broadcast to all players
export interface PublicRoomState {
  roomCode: string;
  state: RoomState;
  players: Player[]; // Nickname, color, score, connection status, etc.
  hostId: string;
  currentTurnPlayerId: string | null;
  turnStartTime: number | null; // For 15s timer sync
  roundNumber: number; // 1 or 2
  strokes: DrawStrokePayload[]; // All strokes on the canvas so far
  category: string | null; // e.g. "Animal". Available to all.
  votes: Record<string, string>; // Map of voterId -> votedPlayerId
  fakeArtistCaught: boolean | null;
  winner: 'FA' | 'ARTISTS' | null;
  secretWord: string | null; // Only revealed at END
}

// Sent privately to each socket
export interface RoleAssignmentPayload {
  isFakeArtist: boolean;
  secretWord: string | null; // Null if FA
  playerId: string;
}
