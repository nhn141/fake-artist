"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GameGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const room_service_1 = require("./room.service");
const shared_1 = require("shared");
const common_1 = require("@nestjs/common");
let GameGateway = GameGateway_1 = class GameGateway {
    roomService;
    server;
    logger = new common_1.Logger(GameGateway_1.name);
    constructor(roomService) {
        this.roomService = roomService;
    }
    afterInit(server) {
        this.roomService.setServer(server);
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.roomService.leaveRoom(client.id);
    }
    handleCreateRoom(client) {
        const code = this.roomService.createRoom();
        return { roomCode: code };
    }
    handleJoinRoom(client, payload) {
        try {
            const { room, playerId, isNew } = this.roomService.joinRoom(payload.roomCode, payload.nickname, payload.playerToken, client.id);
            client.join(room.code);
            this.roomService.broadcastRoomState(room);
            if (!isNew && room.state !== 'LOBBY' && room.state !== 'END') {
                const isFA = playerId === room.fakeArtistId;
                client.emit(shared_1.ServerEvents.ROLE_ASSIGNMENT, {
                    isFakeArtist: isFA,
                    secretWord: isFA ? null : room.secretWord,
                    playerId,
                });
            }
            return { success: true, playerId };
        }
        catch (error) {
            client.emit(shared_1.ServerEvents.ERROR, { message: error.message });
            return { success: false, error: error.message };
        }
    }
    handleStartGame(client, payload) {
        try {
            this.roomService.startGame(payload.roomCode, payload.playerId);
        }
        catch (error) {
            client.emit(shared_1.ServerEvents.ERROR, { message: error.message });
        }
    }
    handleDrawStroke(client, payload) {
        try {
            this.roomService.addStroke(payload.roomCode, payload.playerId, payload.stroke);
        }
        catch (error) {
            client.emit(shared_1.ServerEvents.ERROR, { message: error.message });
        }
    }
    handleVote(client, payload) {
        try {
            this.roomService.vote(payload.roomCode, payload.voterId, payload.votedId);
        }
        catch (error) {
            client.emit(shared_1.ServerEvents.ERROR, { message: error.message });
        }
    }
    handleGuess(client, payload) {
        try {
            this.roomService.guessWord(payload.roomCode, payload.playerId, payload.guess);
        }
        catch (error) {
            client.emit(shared_1.ServerEvents.ERROR, { message: error.message });
        }
    }
    handlePlayAgain(client, payload) {
        try {
            this.roomService.playAgain(payload.roomCode, payload.playerId);
        }
        catch (error) {
            client.emit(shared_1.ServerEvents.ERROR, { message: error.message });
        }
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('CREATE_ROOM'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleCreateRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(shared_1.ClientEvents.JOIN_ROOM),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(shared_1.ClientEvents.START_GAME),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleStartGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(shared_1.ClientEvents.DRAW_STROKE),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleDrawStroke", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(shared_1.ClientEvents.VOTE_FAKE_ARTIST),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleVote", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(shared_1.ClientEvents.GUESS_WORD),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleGuess", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(shared_1.ClientEvents.PLAY_AGAIN),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handlePlayAgain", null);
exports.GameGateway = GameGateway = GameGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [room_service_1.RoomService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map