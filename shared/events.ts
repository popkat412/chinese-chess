import { PersonRole } from "./chess/person";
import { PieceSide } from "./chess/piece";

// No data
export const ERROR_EVENT = "error";

// data is the user id
export const USER_ID_EVENT = "userId";

// Data is object as described in JoinGameData
export const JOIN_GAME_EVENT = "joinGame";
export interface JoinGameData {
  gameId: string;
  userId: string | null;
  role: PersonRole;
  side?: PieceSide;
  name: string;
}

// The data is board as json
export const GAME_UPDATE_EVENT = "gameUpdate";

// The data is move as json
export const MAKE_MOVE_EVENT = "makeMove";

// Emitted when everything is loaded
// No data
export const READY_EVENT = "ready";