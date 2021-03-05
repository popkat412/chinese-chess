import { NUM_RANKS, OPPOSITE_SIDE } from "../constants";
import { Board, PieceGrid } from "./board";
import Move from "./move";
import { generateAllMoves } from "./move-generator";
import { PieceSide, PieceType } from "./piece";

export function generateFullyLegalMoves(board: Board, pseudoLegalMoves: Move[]): Move[] {
  let fullyLegalMoves: Move[] = [];

  for (const move of pseudoLegalMoves) {
    board.move(move);
    const responses = generateAllMoves(board.grid, board.currentSide);
    if (responses.every((v) => !v.to.equals(board.findPiece(PieceType.King, OPPOSITE_SIDE[board.currentSide])[0]))) {
      fullyLegalMoves.push(move);
    }
    board.unmove(move);
  }

  return filterKingMeetKingMoves(board, fullyLegalMoves);
}

export function filterKingMeetKingMoves(board: Board, moves: Move[]): Move[] {
  return moves.filter(move => {
    board.move(move);

    // Check if kings are meeting
    const redKingPos = board.findPiece(PieceType.King, PieceSide.Red)[0];
    const blackKingPos = board.findPiece(PieceType.King, PieceSide.Black)[0];

    // Check if same file
    if (redKingPos.second != blackKingPos.second) { board.unmove(move); return true; }

    console.log(`move: ${move.from} -> ${move.to}`);
    for (let pos = redKingPos.copy(); pos.first >= 0 && pos.first < NUM_RANKS; pos.first++) {
      if (pos.equals(redKingPos)) continue;
      console.log(`pos: ${pos}`);
      const next = board.grid[pos.first][pos.second];
      if (next) { // Reached piece
        // Check if is other king
        if (next.type == PieceType.King) {
          // Oops, illegal
          board.unmove(move);
          return false;
        } else {
          // Return true because this one got blocked by a piece
          // Thus cannot reach king 
          board.unmove(move);
          return true;
        }
      }
    }

    board.unmove(move);
  });
}