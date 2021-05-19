import { deserialize } from "class-transformer";
import { Socket } from "socket.io-client";
import VueSocketIOExt from "vue-socket.io-extended";
import { Module } from "vuex";
import type { RootState } from ".";
import Game from "../../shared/chess/game";
import Person, { PersonRole } from "../../shared/chess/person";
import { PieceSide } from "../../shared/chess/piece";
import {
  GAME_UPDATE_EVENT,
  JoinGameData,
  JOIN_GAME_EVENT,
  USER_ID_EVENT,
} from "../../shared/events";

export interface GameState {
  game: Game | null;
  myUserId: string | null;
  gameId: string | null;
}

export interface JoinGameActionPayload {
  data: JoinGameData;
  socket: Socket;
}

function mutationify(eventName: string): string {
  const defaults = VueSocketIOExt.defaults;
  return (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    defaults.mutationPrefix + defaults.eventToMutationTransformer!(eventName)
  );
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
    reset(state): void {
      state.game = null;
      state.gameId = null;
      state.myUserId = null;
    },
    [mutationify(USER_ID_EVENT)]: function (state, payload: string): void {
      state.myUserId = payload;
    },
    [mutationify(GAME_UPDATE_EVENT)]: function (state, payload: string): void {
      state.game = deserialize(Game, payload);
    },
  },
  modules: {},
  actions: {
    joinGame(_context, { data, socket }: JoinGameActionPayload): void {
      if (socket.disconnected) {
        socket.connect();
      }

      socket.emit(JOIN_GAME_EVENT, data);

      // Showing canvas will be set to true when READY_EVENT is received,
      // this is not a bug
    },
  },
  getters: {
    // The `Person` object belonging to the current player
    me: (state): Person | undefined => {
      return state.game?.people.get(state.myUserId ?? "");
    },
    // The opponent's nickname
    opponentName: (state): string | undefined => {
      return state.game?.getOpponentName(state.myUserId ?? "");
    },
    // The person's nickname
    myName: (_state, getters): string | undefined => {
      return getters.me?.name;
    },
    // Could be "red", "black", or "spectating"
    myIdentity: (_state, getters): string | undefined => {
      const me = getters.me as Person;
      if (!me) return;
      return me.role == PersonRole.Player ? (me.side as string) : "spectating";
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
