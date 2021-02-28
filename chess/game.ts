import { Board } from "./board";
import { Piece, PieceSide } from "./piece";

export default class Game {
  board: Board = new Board();
  currentSide: PieceSide = PieceSide.Red;

  swapPlayer(): void {
    if (this.currentSide == PieceSide.Red) this.currentSide = PieceSide.Black;
    else this.currentSide = PieceSide.Red;
  }
}