import type { PersonRole } from "./chess/person";
import type { PieceSide } from "./chess/piece";

/****** From server *******/

// No data
export const ERROR_EVENT = "error";

// data is the user id (string)
export const USER_ID_EVENT = "user_id";

// The data is `Game` as json
export const GAME_UPDATE_EVENT = "game_update";

// Emitted when everything is loaded
// No data
export const READY_EVENT = "ready";

// Emitted when the game status changes
// Data is the new `GameStatus`
// This is purely for convenience, you could just watch for changes on the
// gameStatus property client side, but this is easier (also easier for be to introduce bugs later but whatever)
// This should be emitted AFTER the actual game update event is emitted
export const GAME_STATUS_CHANGED_EVENT = "game_status_changed";

/****** From client *******/

// Data is object as described in `JoinGameData`
export const JOIN_GAME_EVENT = "join_game";
export interface JoinGameData {
  gameId: string;
  role: PersonRole;
  side?: PieceSide;
  name: string;
}

// The data is `Move` as json
export const MAKE_MOVE_EVENT = "make_move";
