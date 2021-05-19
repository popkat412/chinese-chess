import type { PersonRole } from "./chess/person";
import type { PieceSide } from "./chess/piece";

/****** From server *******/

// No data
export const ERROR_EVENT = "error_event";

// data is the user id (string)
export const USER_ID_EVENT = "user_id_event";

// The data is `Game` as json
export const GAME_UPDATE_EVENT = "game_update_event";

// Emitted when everything is loaded
// No data
export const READY_EVENT = "ready_event";

// Emitted when the game status changes
// Data is the new `GameStatus`
// This is purely for convenience, you could just watch for changes on the
// gameStatus property client side, but this is easier (also easier for be to introduce bugs later but whatever)
// This should be emitted AFTER the actual game update event is emitted
export const GAME_STATUS_CHANGED_EVENT = "game_status_changed_event";

// Emitted when the game expires (aka > 12 hours),
// just before the game is deleted
export const GAME_EXPIRED_EVENT = "game_expired_event";

// Data is `MessageData`
export const MESSAGE_EVENT = "message_event";
export interface MessageData {
  name: string;
  message: string;
}

/****** From client *******/

// No data
// The created game's id will be sent back via acknowledgements
// The shape of the callback should be (gameId: string) => void
export const CREATE_GAME_EVENT = "create_game_event";

// Data is object as described in `JoinGameData`
export const JOIN_GAME_EVENT = "join_game_event";
export interface JoinGameData {
  gameId: string;
  role: PersonRole;
  side?: PieceSide;
  name: string;
}

// The data is `Move` as json
export const MAKE_MOVE_EVENT = "make_move_event";

// Data is string containing message to send
export const SEND_MESSAGE_EVENT = "send_message_event";
