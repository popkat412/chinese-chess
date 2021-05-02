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
