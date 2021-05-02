import { deserialize } from "class-transformer";
import { Socket } from "socket.io-client";
import { Module } from "vuex";
import type { RootState } from ".";
import Game from "../../shared/chess/game";
import Person, { PersonRole } from "../../shared/chess/person";
import { PieceSide } from "../../shared/chess/piece";
import { JoinGameData, JOIN_GAME_EVENT } from "../../shared/events";

export interface GameState {
  game: Game | null;
  myUserId: string | null;
  gameId: string | null;
}

export interface JoinGameActionPayload {
  data: JoinGameData;
  socket: Socket;
}

const gameState: Module<GameState, RootState> = {
  namespaced: true,
  state: {
    game: null,
    gameId: null,
    myUserId: null,
  },
  mutations: {
    setGameId(state, payload: string): void {
      state.gameId = payload;
    },
    SOCKET_USER_ID(state, payload: string): void {
      state.myUserId = payload;
    },
    SOCKET_GAME_UPDATE(state, payload: string): void {
      state.game = deserialize(Game, payload);
    },
  },
  modules: {},
  actions: {
    joinGame(_context, { data, socket }: JoinGameActionPayload): void {
      if (socket.connected) {
        console.warn("Socket already open");
        alert("An unexpected error occurred");
        return;
      }

      socket.connect();
      socket.emit(JOIN_GAME_EVENT, data);

      // Showing canvas will be set to true when READY_EVENT is received,
      // this is not a bug
    },
  },
  getters: {
    me: (state): Person | undefined => {
      return state.game?.people.get(state.myUserId ?? "");
    },
    opponentName: (state): string | undefined => {
      return state.game?.getOpponentName(state.myUserId ?? "");
    },
    myName: (_state, getters): string | undefined => {
      return getters.me?.name;
    },
    myIdentity: (_state, getters): string | undefined => {
      const me = getters.me as Person;
      if (!me) return;
      return me.role == PersonRole.Player ? (me.side as string) : "spectating";
    },
    statusMsg: (state, getters): string | undefined => {
      const me = getters.me as Person;
      const game = state.game;
      if (!me || !game) return;

      if (game.gameOver) return `Game over`; // todo: provide more info
      return `It's ${me.side}'s turn`;
    },
    numSpectators: (state): number | undefined => {
      return state.game?.spectators.length;
    },
    joinUrl: (state): string | undefined => {
      const url = window.location.origin;

      let s = `${url}/?gameId=${state.gameId}`;

      if (!state.game) return;

      if (state.game.players.length >= 2) {
        s += "&role=Spectator";
      } else {
        if (
          state.game.players.filter((v) => v.side == PieceSide.Red).length > 0
        ) {
          s += "&side=black";
        } else {
          s += "&side=red";
        }
      }

      return s;
    },
  },
};
export default gameState;
