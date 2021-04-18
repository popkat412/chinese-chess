import { PieceSide, PieceType } from "@shared/chess/piece";

const NUM_RANKS = 10;
const NUM_FILES = 9;
const STARTING_POSITION_FEN =
  "rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR w - - 0 1";
const PIECE_FROM_FEN: { [k: string]: PieceType } = {
  K: PieceType.King,
  A: PieceType.Advisor,
  E: PieceType.Elephant,
  R: PieceType.Rook,
  C: PieceType.Cannon,
  H: PieceType.Horse,
  P: PieceType.Pawn,
};
const OPPOSITE_SIDE: { [k in PieceSide]: PieceSide } = {
  black: PieceSide.Red,
  red: PieceSide.Black,
};

export {
  NUM_FILES,
  NUM_RANKS,
  PIECE_FROM_FEN,
  STARTING_POSITION_FEN,
  OPPOSITE_SIDE,
};
