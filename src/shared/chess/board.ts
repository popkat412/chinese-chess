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
import Move from "./move";
import { generateAllMoves, MOVE_GENERATORS } from "./move-generator";
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

  // Returns true if side is checkmated
  checkCheckmate(side: PieceSide): boolean {
    return this.allAvailableMoves(side).length == 0;
  }

  allAvailableMoves(side: PieceSide): Move[] {
    const availableMoves: Move[] = [];

    for (let i = 0; i < NUM_RANKS; i++) {
      for (let j = 0; j < NUM_FILES; j++) {
        if (this.grid[i][j]?.side == side) {
          availableMoves.push(...this.availableMoves(new Pair(i, j)));
        }
      }
    }

    return availableMoves;
  }

  // This returns fully legal moves
  availableMoves(piecePos: Pair): Move[] {
    const piece = this.grid[piecePos.first][piecePos.second];
    if (piece) {
      return this.generateFullyLegalMoves(
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
    const pos: Pair[] = [];
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

  private generateFullyLegalMoves(
    board: Board,
    pseudoLegalMoves: Move[]
  ): Move[] {
    const fullyLegalMoves: Move[] = [];

    for (const move of pseudoLegalMoves) {
      board.move(move);
      const responses = generateAllMoves(board.grid, board.currentSide);
      if (
        responses.every(
          (v) =>
            !v.to.equals(
              board.findPiece(
                PieceType.King,
                OPPOSITE_SIDE[board.currentSide]
              )[0]
            )
        )
      ) {
        fullyLegalMoves.push(move);
      }
      board.unmove(move);
    }

    return this.filterKingMeetKingMoves(board, fullyLegalMoves);
  }

  private gridFromFen(fen: string): PieceGrid {
    let file = 0;
    let rank = 9;

    fen = fen.split(" ")[0];

    const tmp = create2dArray<Piece>(NUM_RANKS, NUM_FILES);

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

  private filterKingMeetKingMoves(board: Board, moves: Move[]): Move[] {
    return moves.filter((move) => {
      board.move(move);

      // Check if kings are meeting
      const redKingPos = board.findPiece(PieceType.King, PieceSide.Red)[0];
      const blackKingPos = board.findPiece(PieceType.King, PieceSide.Black)[0];

      // Check if same file
      if (redKingPos.second != blackKingPos.second) {
        board.unmove(move);
        return true;
      }

      console.log(`move: ${move.from} -> ${move.to}`);
      for (
        let pos = redKingPos.copy();
        pos.first >= 0 && pos.first < NUM_RANKS;
        pos.first++
      ) {
        if (pos.equals(redKingPos)) continue;
        console.log(`pos: ${pos}`);
        const next = board.grid[pos.first][pos.second];
        if (next) {
          // Reached piece
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
}
