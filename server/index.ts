import { deserialize, serialize } from "class-transformer";
import cors from "cors";
import express from "express";
import http from "http";
import morgan from "morgan";
import "reflect-metadata";
import { Server, Socket } from "socket.io";
import { v4 as uuidV4 } from "uuid";
import Game from "../shared/chess/game";
import Move from "../shared/chess/move";
import Person, { PersonRole } from "../shared/chess/person";
import { ERROR_EVENT, GAME_UPDATE_EVENT, JoinGameData, JOIN_GAME_EVENT, MAKE_MOVE_EVENT, USER_ID_EVENT } from "../shared/events";
import CreateGame from "../shared/models/create-game";
import GameInfo from "../shared/models/game-info";
import State from "./state";

const app = express();
app.use(morgan("dev"));
app.use(cors({ origin: "http://localhost:8080" }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  }
});

const state: State = {
  games: {}
};

/**
 * Endpoint: /api/gameInfo
 * Type: GET
 * Parameters: gameId
 * Returns: GameInfo (json)
 */
app.get("/api/gameInfo", (req, res) => {

  const gameId = req.params.gameId;
  if (!gameId) throw "No game id specified";

  const game = state.games[gameId];
  if (!game) throw `No game with ${gameId} specified`;

  const info: GameInfo = {
    availableRoles: game.availableRoles,
    numPlayers: game.players.length,
  };

  res.json(info);
});

/**
 * Endpoint: /api/createGame
 * Type: GET
 * Parameters: none
 * Returns: CreateGame (json)
 */
app.get("/api/createGame", (_req, res) => {

  const gameId = uuidV4();
  state.games[gameId] = new Game();

  const data: CreateGame = {
    gameId
  };

  res.json(data);
});

app.get("/api/testing/state", (_req, res) => {
  res.json(state);
});

io.on("connection", (socket: Socket) => {
  console.log("User connected");


  function error(message: string) {
    socket.emit(ERROR_EVENT, message);
  }

  socket.on(JOIN_GAME_EVENT, (data: JoinGameData) => {
    console.log("received join game event: ", data);

    const game = state.games[data.gameId];

    // Check if game exists
    if (!game) {
      error(`No game with ${data.gameId} exists`);
      return;
    }

    // Check user id
    if (data.userId) {
      if (!game.people.has(data.userId)) {
        error(`No person with id ${data.userId} exists in game ${data.gameId}`);
        return;
      }
    }

    // Check if role is valid
    if (data.role == PersonRole.Player) {
      if (!data.side) {
        error("data.role == PlayerRole.Player but no side is specified");
        return;
      }

      const numPlayersAlreadyInGame = game.players.length;

      if (numPlayersAlreadyInGame == 2) {
        error(`Game already has 2 players`);
        return;
      } else if (numPlayersAlreadyInGame == 1) {
        if (game.players[0].side == data.side) {
          error(`Game already has player on side ${data.side}`);
          return;
        }
      }

    }
    
    const userId = uuidV4();

    game.people.set(userId, new Person(data.name, data.role, data.side));
    socket.join(data.gameId);
    socket.emit(USER_ID_EVENT, userId);
    (socket as any).userId = userId; // TODO: add this to .d.ts

  });

  socket.on(MAKE_MOVE_EVENT, (data: string) => {
    const gameId = findGamePersonIsIn(socket.id);
    if (!gameId) {
      error("Cannot find game with player");
      return;
    }
    const game = state.games[gameId];

    const move = deserialize(Move, data);
    // TODO: Check if its actually his turn and if he's spectator or not
    if (game.board.checkMove(move)) {
      game.board.move(move);

      const gameJson = serialize(game);
      console.log(JSON.parse(gameJson));
      io.to(gameId).emit(GAME_UPDATE_EVENT, gameJson);
    }

  });

  socket.on("disconnect", () => {
    console.log("User disconnected");

    const userId =  (socket as any).userId;

    const gameId = findGamePersonIsIn(userId);
    if (!gameId) return;

    state.games[gameId].people.delete(userId);
  })
});

function findGamePersonIsIn(personId: string): string | null {
  for (const gameId in state.games) {
    if (state.games[gameId].people.has(personId)) {
      return gameId;
    }
  }

  return null;
}

// Clear empty games every minute
// setInterval(() => {
//   let toRemove: string[] = [];
//   for (const gameId in state.games) {
//     if (state.games[gameId].people.length == 0) {
//       toRemove.push(gameId);
//     }
//   }

//   console.log(`Deleting games: ${toRemove.map(toString).join(" ")}`);
//   for (const i of toRemove) {
//     delete state.games[i];
//   }

// }, 60000);

server.listen(3000, () => console.log("Listening on port 3000..."));