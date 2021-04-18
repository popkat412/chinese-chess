import { Piece } from "@shared/chess/piece";
import Pair from "@shared/ds/pair";
import { Exclude, Type } from "class-transformer";

export default class Move {
  @Type(() => Pair) from: Pair;
  @Type(() => Pair) to: Pair;
  @Exclude() capturedPiece: Piece | null;

  constructor(from: Pair, to: Pair, capturedPiece: Piece | null = null) {
    this.from = from;
    this.to = to;
    this.capturedPiece = capturedPiece;
  }
}
