import type { Express } from "express";
import { JoinGameData } from "../shared/events";
import state from "./state";
import { validateJoinGameData } from "./validation";

export default function registerEndpoints(app: Express): void {
  // if (process.env.NODE_ENV == "development") {
  app.get("/api/state", (_req, res) => {
    res.json(state);
  });
  // }

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
