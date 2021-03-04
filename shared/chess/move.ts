import Pair from "../ds/pair";
import { Piece } from "./piece";

export default class Move {
  from: Pair<number, number>;
  to: Pair<number, number>;
  capturedPiece: Piece | undefined;

  constructor(from: Pair<number, number>, to: Pair<number, number>, capturedPiece: Piece | undefined = undefined) {
    this.from = from;
    this.to = to;
    this.capturedPiece = capturedPiece;
  }
}