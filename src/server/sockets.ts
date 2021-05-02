/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { deserialize, serialize } from "class-transformer";
import { Server, Socket } from "socket.io";
import { v4 as uuidV4 } from "uuid";
import Move from "../shared/chess/move";
import Person, { PersonRole } from "../shared/chess/person";
import {
  CHECKMATE_EVENT,
  ERROR_EVENT,
  GAME_UPDATE_EVENT,
  JoinGameData,
  JOIN_GAME_EVENT,
  MAKE_MOVE_EVENT,
  READY_EVENT,
  USER_ID_EVENT,
} from "../shared/events";
import state from "./state";
import { validateJoinGameData } from "./validation";

export default function registerSocketListeners(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log("User connected");
    state.socketInfo.set(socket, {});

    function error(message: string, disconnect = false) {
      socket.emit(ERROR_EVENT, message);
      if (disconnect) socket.disconnect();
    }

    function emitGameUpdate(gameId: string) {
      const gameJson = serialize(state.games[gameId]);
      io.to(gameId).emit(GAME_UPDATE_EVENT, gameJson);
    }

    socket.on(JOIN_GAME_EVENT, (data: JoinGameData) => {
      console.log("received join game event: ", data);

      const validationResult = validateJoinGameData(data);
      if (!validationResult.valid) {
        error(validationResult.errorMessage);
        return;
      }

      const game = state.games[data.gameId];

      const userId = uuidV4();
      console.log(`Generating user id... ${userId}`);

      game.people.set(userId, new Person(data.name, data.role, data.side));
      console.log("game.people:", game.people);

      socket.join(data.gameId);
      emitGameUpdate(data.gameId);
      socket.emit(USER_ID_EVENT, userId);
      socket.emit(READY_EVENT);
      state.socketInfo.get(socket)!.userId = userId;
    });

    socket.on(MAKE_MOVE_EVENT, (data: string) => {
      const userId = state.socketInfo.get(socket)!.userId!;
      const gameId = findGamePersonIsIn(userId);
      if (!gameId) {
        error("Cannot find game with player");
        return;
      }

      const game = state.games[gameId];
      const person = game.people.get(userId)!;
      const move = deserialize(Move, data);

      if (
        !game.board.checkMove(move) ||
        person.role != PersonRole.Player ||
        person.side != game.board.currentSide
      ) {
        error("Illegal move");
        return;
      }

      game.board.move(move);
      emitGameUpdate(gameId);

      // Check checkmate
      if (game.board.checkCheckmate(game.board.currentSide)) {
        console.log(`🔥 ${game.board.currentSide} got checkmated!`);
        socket.emit(CHECKMATE_EVENT, game.board.currentSide);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");

      const userId = state.socketInfo.get(socket)!.userId;

      if (!userId) return;

      const gameId = findGamePersonIsIn(userId);
      if (!gameId) return;

      state.games[gameId].people.delete(userId);

      emitGameUpdate(gameId);

      // TODO: Delete games after 24 hours
    });
  });

  function findGamePersonIsIn(personId: string): string | null {
    for (const gameId in state.games) {
      if (state.games[gameId].people.has(personId)) {
        return gameId;
      }
    }

    return null;
  }
}
