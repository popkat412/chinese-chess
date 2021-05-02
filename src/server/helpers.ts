import state from "./state";

export function findGamePersonIsIn(personId: string): string | null {
  for (const gameId in state.games) {
    if (state.games[gameId].people.has(personId)) {
      return gameId;
    }
  }

  return null;
}
