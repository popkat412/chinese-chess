import { Board } from "./board";
import { Piece, PieceSide } from "./piece";

export default class Game {
  board: Board = new Board();
  currentSide: PieceSide = PieceSide.Red;
}