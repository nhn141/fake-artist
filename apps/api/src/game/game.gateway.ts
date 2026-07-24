import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';
import type { 
  JoinRoomPayload, 
  DrawStrokePayload,
  VotePayload,
  GuessWordPayload
} from 'shared';
import { ClientEvents, ServerEvents } from 'shared';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);

  constructor(private readonly roomService: RoomService) {}

  afterInit(server: Server) {
    this.roomService.setServer(server);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.roomService.leaveRoom(client.id);
  }

  @SubscribeMessage('CREATE_ROOM')
  handleCreateRoom(@ConnectedSocket() client: Socket) {
    const code = this.roomService.createRoom();
    return { roomCode: code };
  }

  @SubscribeMessage(ClientEvents.JOIN_ROOM)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    try {
      const { room, playerId, isNew } = this.roomService.joinRoom(
        payload.roomCode,
        payload.nickname,
        payload.playerToken,
        client.id,
      );

      client.join(room.code);
      
      this.roomService.broadcastRoomState(room);

      // If reconnecting and FA, resend role assignment
      if (!isNew && room.state !== 'LOBBY' && room.state !== 'END') {
        const isFA = playerId === room.fakeArtistId;
        client.emit(ServerEvents.ROLE_ASSIGNMENT, {
          isFakeArtist: isFA,
          secretWord: isFA ? null : room.secretWord,
          playerId,
        });
      }

      return { success: true, playerId };
    } catch (error: any) {
      client.emit(ServerEvents.ERROR, { message: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage(ClientEvents.START_GAME)
  handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomCode: string; playerId: string },
  ) {
    try {
      this.roomService.startGame(payload.roomCode, payload.playerId);
    } catch (error: any) {
      client.emit(ServerEvents.ERROR, { message: error.message });
    }
  }

  @SubscribeMessage(ClientEvents.DRAW_STROKE)
  handleDrawStroke(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomCode: string; playerId: string; stroke: DrawStrokePayload },
  ) {
    try {
      this.roomService.addStroke(payload.roomCode, payload.playerId, payload.stroke);
    } catch (error: any) {
      client.emit(ServerEvents.ERROR, { message: error.message });
    }
  }

  @SubscribeMessage(ClientEvents.VOTE_FAKE_ARTIST)
  handleVote(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomCode: string; voterId: string; votedId: string },
  ) {
    try {
      this.roomService.vote(payload.roomCode, payload.voterId, payload.votedId);
    } catch (error: any) {
      client.emit(ServerEvents.ERROR, { message: error.message });
    }
  }

  @SubscribeMessage(ClientEvents.GUESS_WORD)
  handleGuess(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomCode: string; playerId: string; guess: string },
  ) {
    try {
      this.roomService.guessWord(payload.roomCode, payload.playerId, payload.guess);
    } catch (error: any) {
      client.emit(ServerEvents.ERROR, { message: error.message });
    }
  }

  @SubscribeMessage(ClientEvents.PLAY_AGAIN)
  handlePlayAgain(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomCode: string; playerId: string },
  ) {
    try {
      this.roomService.playAgain(payload.roomCode, payload.playerId);
    } catch (error: any) {
      client.emit(ServerEvents.ERROR, { message: error.message });
    }
  }
}
