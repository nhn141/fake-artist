import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';
import type { JoinRoomPayload, DrawStrokePayload } from 'shared';
export declare class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly roomService;
    server: Server;
    private readonly logger;
    constructor(roomService: RoomService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleCreateRoom(client: Socket): {
        roomCode: string;
    };
    handleJoinRoom(client: Socket, payload: JoinRoomPayload): {
        success: boolean;
        playerId: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        playerId?: undefined;
    };
    handleStartGame(client: Socket, payload: {
        roomCode: string;
        playerId: string;
    }): void;
    handleDrawStroke(client: Socket, payload: {
        roomCode: string;
        playerId: string;
        stroke: DrawStrokePayload;
    }): void;
    handleVote(client: Socket, payload: {
        roomCode: string;
        voterId: string;
        votedId: string;
    }): void;
    handleGuess(client: Socket, payload: {
        roomCode: string;
        playerId: string;
        guess: string;
    }): void;
    handlePlayAgain(client: Socket, payload: {
        roomCode: string;
        playerId: string;
    }): void;
}
