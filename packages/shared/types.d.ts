export interface Player {
    id: string;
    nickname: string;
    color: string;
    isHost: boolean;
    isConnected: boolean;
}
export declare enum RoomState {
    LOBBY = "LOBBY",
    DRAWING = "DRAWING",
    VOTING = "VOTING",
    GUESSING = "GUESSING",
    END = "END"
}
