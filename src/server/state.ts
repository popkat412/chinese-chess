import { Socket } from "socket.io";
import Game from "../shared/chess/game";

interface SocketInfo {
  userId?: string;
}

export interface State {
  games: { [gameId: string]: Game };
  socketInfo: WeakMap<Socket, SocketInfo>;
}

const state: State = {
  games: {},
  socketInfo: new WeakMap(),
};

export default state;

// - get game with id
// - set game with id
// - find game person with id is in
// - delete user with game

// - set socket info to empty object
// - get userId of socket info
