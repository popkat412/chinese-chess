import type { Express } from "express";
import { v4 as uuidV4 } from "uuid";
import Game from "../shared/chess/game";
import { JoinGameData } from "../shared/events";
import CreateGameModel from "../shared/models/createGameModel";
import GameInfoModel from "../shared/models/gameInfoModel";
import state from "./state";
import { validateJoinGameData } from "./validation";

export default function registerEndpoints(app: Express): void {
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

    const info: GameInfoModel = {
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

    const data: CreateGameModel = {
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
}
