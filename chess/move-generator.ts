import { NUM_FILES, NUM_RANKS } from "../constants";
import Pair from "../ds/pair";
import multipleEquals from "../utilities/multiple-equals";
import { PieceGrid } from "./board";
import { PieceSide, PieceType } from "./piece";

function rookGenerator(position: Pair<number, number>, board: PieceGrid): Pair<number, number>[] {

  const piece = board[position.first][position.second];
  if (!piece) return [];

  const dx = [0, 0, 1, -1];
  const dy = [1, -1, 0, 0];

  let moves: Pair<number, number>[] = [];

  for (let i = 0; i < 4; i++) {
    let x = position.first;
    let y = position.second;

    while (true) {
      x += dx[i];
      y += dy[i];

      // If out of bounds
      if (x < 0 || x >= NUM_RANKS || y < 0 || y >= NUM_FILES) break;
      // If being blocked by a friendly piece
      if (board[x][y]?.side == piece.side) break;

      moves.push(new Pair(x, y));

      // If being blocked by opponent piece.
      // Has to be behind moves.push() because
      // the person can still choose to capture the opponent's piece
      if (board[x][y] && (board[x][y]?.side != piece.side)) break;
    }
  }

  return moves;
}

function blockablePieceGenerator(position: Pair<number, number>, board: PieceGrid, dx: number[], dy: number[], blockX: number[], blockY: number[]): Pair<number, number>[] {
  console.assert(multipleEquals(dx.length, dy.length, blockX.length, blockY.length));

  const piece = board[position.first][position.second];
  if (!piece) return [];

  let moves: Pair<number, number>[] = [];

  for (let i = 0; i < dx.length; i++) {
    const x = position.first + dx[i];
    const y = position.second + dy[i];
    const bX = position.first + blockX[i];
    const bY = position.second + blockY[i];

    // Check if out of bounds
    if (x < 0 || x >= NUM_RANKS || y < 0 || y >= NUM_FILES) continue;
    if (bX < 0 || bX >= NUM_RANKS || bY < 0 || bY >= NUM_FILES) continue;

    // Check if blocked
    if (board[bX][bY]) continue;

    // Check if friendly piece at target location
    if (board[x][y]?.side == piece.side) continue;

    moves.push(new Pair(x, y));
  }

  return moves;

}

function horseGenerator(position: Pair<number, number>, board: PieceGrid): Pair<number, number>[] {
  // * Order is very important!
  const dx = [-1, +1, +2, +2, +1, -1, -2, -2];
  const dy = [-2, -2, -1, +1, +2, +2, +1, -1];
  const blockX = [+0, +0, +1, +1, +0, +0, -1, -1];
  const blockY = [-1, -1, +0, +0, +1, +1, +0, +0];

  return blockablePieceGenerator(position, board, dx, dy, blockX, blockY);
}

function elephantGenerator(position: Pair<number, number>, board: PieceGrid): Pair<number, number>[] {
  const dx = [-2, +2, +2, -2];
  const dy = [-2, -2, +2, +2];
  const blockX = [-1, +1, +1, -1];
  const blockY = [-1, -1, +1, +1];

  return blockablePieceGenerator(position, board, dx, dy, blockX, blockY);
}

function kingBoxPieceGenerator(position: Pair<number, number>, board: PieceGrid, dx: number[], dy: number[]): Pair<number, number>[] {
  console.assert(dx.length == dy.length);

  const piece = board[position.first][position.second];
  if (!piece) return [];

  let moves: Pair<number, number>[] = [];

  for (let i = 0; i < dx.length; i++) {
    const x = position.first + dx[i];
    const y = position.second + dy[i];
    const pair = new Pair(x, y);

    // Check if inside board
    if (!isInsideKingBox(pair, piece.side)) continue;;
    // Check if friendly piece at target
    if (board[x][y]?.side == piece.side) continue;

    moves.push(pair);
  }

  return moves;

}

function isInsideKingBox(toCheck: Pair<number, number>, side: PieceSide): boolean {
  const x = toCheck.first;
  const y = toCheck.second;

  if (side == PieceSide.Red) { // Red is always at top of the grid
    return (x <= 2 && x >= 0 && y <= 5 && y >= 3);
  } else { // Black is always at the bottom
    return (x < NUM_RANKS && x >= NUM_RANKS - 3 && y <= 5 && y >= 3);
  }
}

function advisorGenerator(position: Pair<number, number>, board: PieceGrid): Pair<number, number>[] {
  const dx = [-1, +1, +1, -1];
  const dy = [-1, -1, +1, +1];
  return kingBoxPieceGenerator(position, board, dx, dy);
}

function kingGenerator(position: Pair<number, number>, board: PieceGrid): Pair<number, number>[] {
  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];
  return kingBoxPieceGenerator(position, board, dx, dy);
}

function cannonGenerator(position: Pair<number, number>, board: PieceGrid): Pair<number, number>[] {
  const piece = board[position.first][position.second];
  if (!piece) return [];

  const dx = [0, 0, 1, -1];
  const dy = [1, -1, 0, 0];

  let moves: Pair<number, number>[] = [];

  for (let i = 0; i < 4; i++) {
    let x = position.first;
    let y = position.second;
    let pieceCnt = 0;

    while (true) {
      x += dx[i];
      y += dy[i];

      // If out of bounds
      if (x < 0 || x >= NUM_RANKS || y < 0 || y >= NUM_FILES) break;
      // If being blocked by a piece
      if (board[x][y]) {
        pieceCnt++;

        if (pieceCnt == 2) {
          // Check if can eat
          if (board[x][y] && board[x][y]?.side != piece.side) {
            // Can eat!
            moves.push(new Pair(x, y));
          }
          break;
        }
      } else {
        if (pieceCnt == 0) {
          moves.push(new Pair(x, y));
        }
      }
    }
  }

  return moves;
}

function isAcrossRiver(position: Pair<number, number>, side: PieceSide): boolean {
  const y = position.first;

  if (side == PieceSide.Black) { // black is at the top
    return y <= 4;
  } else {
    return y > 4;
  }
}

function pawnGenerator(position: Pair<number, number>, board: PieceGrid): Pair<number, number>[] {
  const piece = board[position.first][position.second];
  if (!piece) return [];

  if (isAcrossRiver(position, piece.side)) {
    let dx: number[], dy: number[];
    let moves: Pair<number, number>[] = [];

    if (piece.side == PieceSide.Red) { // remember, red is on top
      dx = [0, 1, 0];
      dy = [1, 0, -1];
    } else {
      dx = [0, -1, 0];
      dy = [-1, 0, 1];
    }

    for (let i = 0; i < 3; i++) {
      const nx = position.first + dx[i];
      const ny = position.second + dy[i];

      // Check if inside board
      if (nx < 0 || nx >= NUM_RANKS || ny < 0 || ny >= NUM_FILES) continue;
      // Check if friendly piece blocking
      if (board[nx][ny]?.side == piece.side) continue;

      moves.push(new Pair(nx, ny));
    }

    return moves;

  } else {
    const nx = position.first + 1 * (piece.side == PieceSide.Red ? 1 : -1);
    const ny = position.second;
    if (board[nx][ny]) {
      return [];
    } else {
      return [new Pair(nx, ny)];
    }
  }
}

export const MOVE_GENERATORS: { [k in PieceType]: (position: Pair<number, number>, board: PieceGrid) => Pair<number, number>[] } = {
  Rook: rookGenerator,
  Horse: horseGenerator,
  Elephant: elephantGenerator,
  Advisor: advisorGenerator,
  King: kingGenerator,
  Cannon: cannonGenerator,
  Pawn: pawnGenerator,
};