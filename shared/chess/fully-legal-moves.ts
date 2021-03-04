import { OPPOSITE_SIDE } from "../constants";
import { Board } from "./board";
import Move from "./move";
import { generateAllMoves } from "./move-generator";
import { PieceSide, PieceType } from "./piece";

export function filterPseudoLegalMoves(board: Board, pseudoLegalMoves: Move[]): Move[] {
  let fullyLegalMoves: Move[] = [];

  for (const move of pseudoLegalMoves) {
    board.move(move);
    const responses = generateAllMoves(board.grid, board.currentSide);
    if (responses.every((v) => !v.to.equals(board.findPiece(PieceType.King, OPPOSITE_SIDE[board.currentSide])[0]))) {
      fullyLegalMoves.push(move);
    }
    board.unmove(move);
  }

  return fullyLegalMoves;
}