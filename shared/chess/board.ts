import { Exclude, Transform, Type } from "class-transformer";
import {
  NUM_FILES,
  NUM_RANKS,
  OPPOSITE_SIDE,
  PIECE_FROM_FEN,
  STARTING_POSITION_FEN,
} from "../constants";
import Pair from "../ds/pair";
import create2dArray from "../utilities/2d-array";
import { generateFullyLegalMoves } from "./fully-legal-moves";
import Move from "./move";
import { MOVE_GENERATORS } from "./move-generator";
import { Piece, PieceSide, PieceType } from "./piece";

export type PieceGrid = (Piece | null)[][];

export class Board {
  /// The pieces are represented as objects in a 2D array.
  /// Pieces are accessed using `grid[rank][file]`.
  /// (0, 0) is the top left of the grid.
  /// The top of the grid is always the red and the bottom is always the black.
  /// However, the pieces may be drawn to the screen differently
  @Type(() => Array)
  @Transform(({ obj }) => {
    return obj.grid.map((v1: any) =>
      v1.map((v2: any) => {
        if (v2) return new Piece(v2.type, v2.side);
        else return null;
      })
    );
  })
  readonly grid: PieceGrid;

  currentSide: PieceSide;

  @Type(() => Move)
  readonly moveStack: Move[] = [];

  @Exclude()
  get latestMove(): Move | null {
    if (this.moveStack.length < 1) return null;
    return this.moveStack[this.moveStack.length - 1];
  }

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

  // Checks if current person has checkmated the other person
  checkMate(): boolean {
    throw new Error("Not implemented");
  }

  // This returns fully legal moves
  availableMoves(piecePos: Pair): Move[] {
    const piece = this.grid[piecePos.first][piecePos.second];
    if (piece) {
      return generateFullyLegalMoves(
        this,
        MOVE_GENERATORS[piece.type](piecePos, this.grid)
      );
    } else {
      return [];
    }
  }

  move(move: Move): void {
    if (move.to.equals(move.from)) return;
    move.capturedPiece = this.grid[move.to.first][move.to.second];
    this.grid[move.to.first][move.to.second] = this.grid[move.from.first][
      move.from.second
    ];
    this.grid[move.from.first][move.from.second] = null;
    this.moveStack.push(move);
    this.swapPlayer();
  }

  unmove(move: Move): void {
    if (move.to.equals(move.from)) return;
    this.grid[move.from.first][move.from.second] = this.grid[move.to.first][
      move.to.second
    ];
    this.grid[move.to.first][move.to.second] = move.capturedPiece;
    this.moveStack.splice(
      this.moveStack.findIndex((v) => v == move),
      1
    );
    this.swapPlayer();
  }

  findPiece(type: PieceType, side: PieceSide): Pair[] {
    let pos: Pair[] = [];
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
            /[A-Z]/.test(char) ? PieceSide.Red : PieceSide.Black
          );
          file++;
        }
      }
    }

    return tmp;
  }
}
