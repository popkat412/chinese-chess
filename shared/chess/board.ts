import { NUM_FILES, NUM_RANKS, OPPOSITE_SIDE, PIECE_FROM_FEN, STARTING_POSITION_FEN } from "../constants";
import Pair from "../ds/pair";
import create2dArray from "../utilities/2d-array";
import Move from "./move";
import { Piece, PieceSide, PieceType } from "./piece";
import { MOVE_GENERATORS } from "./move-generator";
import { filterPseudoLegalMoves as generateFullyLegalMoves } from "./fully-legal-moves";


export type PieceGrid = (Piece | undefined)[][];

export class Board {

  /// The pieces are represented as objects in a 2D array.
  /// Pieces are accessed using `grid[rank][file]`.
  /// (0, 0) is the top left of the grid.
  /// The top of the grid is always the red and the bottom is always the black.
  /// However, the pieces may be drawn to the screen differently
  readonly grid: PieceGrid;

  currentSide: PieceSide;

  constructor(fen: string = STARTING_POSITION_FEN) {
    this.grid = this.gridFromFen(fen);
    this.currentSide = PieceSide.Red;
  }


  log(): void {
    console.table(this.grid.map((v) => v.map((v2) => v2?.type)));
  }

  // Returns true if move is fully legal
  checkMove(move: Move): boolean {
    for (const available of this.availableMoves(move.from)) {
      if (move.to.equals(available.to)) return true;
    }
    return false;
  }

  // This returns fully legal moves
  availableMoves(piecePos: Pair<number, number>): Move[] {
    const piece = this.grid[piecePos.first][piecePos.second];
    if (piece) {
      return generateFullyLegalMoves(this, MOVE_GENERATORS[piece.type](piecePos, this.grid));
    } else {
      return [];
    }
  }

  move(move: Move): void {
    if (move.to.equals(move.from)) return;
    move.capturedPiece = this.grid[move.to.first][move.to.second];
    this.grid[move.to.first][move.to.second] = this.grid[move.from.first][move.from.second];
    this.grid[move.from.first][move.from.second] = undefined;

    this.swapPlayer();
  }

  unmove(move: Move): void {
    if (move.to.equals(move.from)) return;
    this.grid[move.from.first][move.from.second] = this.grid[move.to.first][move.to.second];
    this.grid[move.to.first][move.to.second] = move.capturedPiece;

    this.swapPlayer();
  }

  findPiece(type: PieceType, side: PieceSide): Pair<number, number>[] {
    let pos: Pair<number, number>[] = [];
    for (let i = 0; i < NUM_RANKS; i++) {
      for (let j = 0; j < NUM_FILES; j++) {
        const piece = this.grid[i][j];
        if (piece && piece.type == type && piece.side == side) {
          pos.push(new Pair(i, j));
        }
      }
    }

    return pos;
  }

  private swapPlayer(): void {
    this.currentSide = OPPOSITE_SIDE[this.currentSide];
  }

  private gridFromFen(fen: string): PieceGrid {
    let file = 0;
    let rank = 9;

    fen = fen.split(" ")[0];

    let tmp = create2dArray<Piece>(NUM_RANKS, NUM_FILES);

    for (const char of fen) {
      if (char == "/") {
        file = 0;
        rank--;
      } else {
        if (!isNaN(parseInt(char))) {
          file += parseInt(char);
        } else {
          tmp[rank][file] = new Piece(
            PIECE_FROM_FEN[char.toUpperCase()],
            /[A-Z]/.test(char) ? PieceSide.Red : PieceSide.Black,
          );
          file++;
        }
      }
    }

    return tmp;
  }
}