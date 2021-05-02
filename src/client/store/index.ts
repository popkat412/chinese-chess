import Vue from "vue";
import Vuex from "vuex";
import gameState from "./gameState";

Vue.use(Vuex);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RootState {}

export const store = new Vuex.Store<RootState>({
  modules: {
    gameState,
  },
  strict: false, // todo: document why this is here
});
