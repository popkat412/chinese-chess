import { PieceSide, PieceType } from "./chess/piece";

const NUM_RANKS = 10;
const NUM_FILES = 9;
const STARTING_POSITION_FEN = "rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR w - - 0 1";
const PIECE_FROM_FEN: { [k: string]: PieceType } = {
  "K": PieceType.King,
  "A": PieceType.Advisor,
  "E": PieceType.Elephant,
  "R": PieceType.Rook,
  "C": PieceType.Cannon,
  "H": PieceType.Horse,
  "P": PieceType.Pawn,
}
const PIECE_CHINESE_CHARACTER: { [k in PieceType]: { [kk in PieceSide]: string } } = {
  Rook: { black: "車", red: "車" },
  Horse: { black: "马", red: "马" },
  Elephant: { black: "象", red: "相" },
  Advisor: { black: "士", red: "仕" },
  King: { black: "将", red: "帅" },
  Cannon: { black: "炮", red: "砲" },
  Pawn: { black: "卒", red: "兵" },
};
const OPPOSITE_SIDE: { [k in PieceSide]: PieceSide } = {
  black: PieceSide.Red,
  red: PieceSide.Black,
}

export { NUM_FILES, NUM_RANKS, PIECE_FROM_FEN, STARTING_POSITION_FEN, PIECE_CHINESE_CHARACTER, OPPOSITE_SIDE };