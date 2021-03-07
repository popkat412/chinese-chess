import Game from "../shared/chess/game";

export default interface State {
  games: { [gameId: string]: Game }
}