import { Module } from "vuex";
import { RootState } from ".";
import Game from "../../shared/chess/game";
import Person, { PersonRole } from "../../shared/chess/person";

export interface GameState {
  game: Game | null;
  myUserId: string | null;
}

const gameState: Module<GameState, RootState> = {
  state: {
    game: null,
    myUserId: null,
  },
  mutations: {
    SOCKET_USER_ID(state, payload: string): void {
      state.myUserId = payload;
    },
    SOCKET_GAME_UPDATE(state, payload: Game): void {
      state.game = payload;
    },
  },
  modules: {},
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
    joinUrl: (): string | undefined => {
      return "todo";
    },
  },
};
export default gameState;
