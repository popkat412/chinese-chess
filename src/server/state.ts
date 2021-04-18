import { Socket } from "socket.io";
import Game from "../shared/chess/game";

interface SocketInfo {
  userId?: string;
}

export default interface State {
  games: { [gameId: string]: Game };
  socketInfo: WeakMap<Socket, SocketInfo>;
}
