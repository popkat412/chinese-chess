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
import {
  ERROR_EVENT,
  GAME_UPDATE_EVENT,
  JoinGameData,
  JOIN_GAME_EVENT,
  MAKE_MOVE_EVENT,
  READY_EVENT,
  USER_ID_EVENT,
} from "../shared/events";
import CreateGame from "../shared/models/create-game";
import GameInfo from "../shared/models/game-info";
import ValidateJoinResult from "../shared/models/validate-join-result";
import validateNickname from "../shared/validation";
import State from "./state";

const __DEPLOY_URL__ =
  process.env.NODE_ENV == "production" ? "" : "http://localhost:8080";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cors({ origin: __DEPLOY_URL__ }));

console.log(`Deploy url: ${__DEPLOY_URL__}`);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: __DEPLOY_URL__,
    methods: ["GET", "POST"],
  },
});

const state: State = {
  games: {},
  socketInfo: new WeakMap(),
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
    gameId,
  };

  res.json(data);
});

/**
 * Endpoint: /api/validateGame
 * Type: POST
 * Parameters: none
 * Data: JoinGameData
 * Returns: ValidateJoinResult
 */
app.post("/api/validateJoin", (req, res) => {
  console.log(`body: ${req.body}`);
  const data: JoinGameData = req.body;

  const validationResult = validateJoinGameData(data);
  res.json(validationResult);
});

function validateJoinGameData(data: JoinGameData): ValidateJoinResult {
  // Check if game exists
  const game = state.games[data.gameId];

  if (!game) {
    return {
      valid: false,
      errorMessage: `No game with id ${data.gameId} exists`,
    };
  }

  // Check if role is valid
  if (data.role == PersonRole.Player) {
    if (!data.side) {
      return {
        valid: false,
        errorMessage: "Role is player but no side is specified",
      };
    }

    const numPlayersAlreadyInGame = game.players.length;

    if (numPlayersAlreadyInGame == 2) {
      return {
        valid: false,
        errorMessage: "Game already has 2 players",
      };
    } else if (numPlayersAlreadyInGame == 1) {
      if (game.players[0].side == data.side) {
        return {
          valid: false,
          errorMessage: `Game already has player on side ${data.side}`,
        };
      }
    }
  }

  // Check name
  if (!data.name) {
    return {
      valid: false,
      errorMessage: "Nickname required",
    };
  } else {
    const validateName = validateNickname(data.name);
    if (validateName != true) {
      return {
        valid: false,
        errorMessage: validateName,
      };
    }
  }

  return {
    valid: true,
    errorMessage: "",
  };
}

io.on("connection", (socket: Socket) => {
  console.log("User connected");
  state.socketInfo.set(socket, {});

  function error(message: string, disconnect: boolean = false) {
    socket.emit(ERROR_EVENT, message);
    if (disconnect) socket.disconnect();
  }

  function emitBoardUpdate(gameId: string) {
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
    emitBoardUpdate(data.gameId);
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
    emitBoardUpdate(gameId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");

    const userId = state.socketInfo.get(socket)!.userId;

    if (!userId) return;

    const gameId = findGamePersonIsIn(userId);
    if (!gameId) return;

    state.games[gameId].people.delete(userId);

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
