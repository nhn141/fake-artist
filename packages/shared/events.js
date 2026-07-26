"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerEvents = exports.ClientEvents = void 0;
var ClientEvents;
(function (ClientEvents) {
    ClientEvents["JOIN_ROOM"] = "JOIN_ROOM";
    ClientEvents["START_GAME"] = "START_GAME";
    ClientEvents["DRAW_STROKE"] = "DRAW_STROKE";
    ClientEvents["UNDO_STROKE"] = "UNDO_STROKE";
    ClientEvents["END_TURN"] = "END_TURN";
    ClientEvents["VOTE_FAKE_ARTIST"] = "VOTE_FAKE_ARTIST";
    ClientEvents["GUESS_WORD"] = "GUESS_WORD";
    ClientEvents["PLAY_AGAIN"] = "PLAY_AGAIN";
    ClientEvents["SEND_EMOJI"] = "SEND_EMOJI";
    ClientEvents["SET_READY"] = "SET_READY";
})(ClientEvents || (exports.ClientEvents = ClientEvents = {}));
var ServerEvents;
(function (ServerEvents) {
    ServerEvents["ROOM_STATE_UPDATE"] = "ROOM_STATE_UPDATE";
    ServerEvents["ROLE_ASSIGNMENT"] = "ROLE_ASSIGNMENT";
    ServerEvents["RECEIVE_EMOJI"] = "RECEIVE_EMOJI";
    ServerEvents["ERROR"] = "ERROR";
})(ServerEvents || (exports.ServerEvents = ServerEvents = {}));
