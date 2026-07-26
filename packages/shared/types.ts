export interface Player {
  id: string;
  nickname: string;
  color: string;
  isHost: boolean;
  isConnected: boolean;
  isReady: boolean;
  isFakeArtist?: boolean;
}

export enum RoomState {
  LOBBY = 'LOBBY',
  DRAWING = 'DRAWING',
  VOTING = 'VOTING',
  GUESSING = 'GUESSING',
  END = 'END',
}
