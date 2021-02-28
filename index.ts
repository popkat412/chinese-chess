import p5 from "p5";
import { NUM_FILES, NUM_RANKS } from "./constants";
import { Board } from "./chess/board";
import Move from "./chess/move";
import { PieceSide } from "./chess/piece";
import Pair from "./ds/pair";
import Game from "./chess/game";

// These are not constants because in the future I might want
// these to change as the screen size changes
let GRID_SQUARE_SIZE = 60;
let H_PADDING = 40, V_PADDING = 100;
let CANVAS_HEIGHT = (NUM_RANKS - 1) * GRID_SQUARE_SIZE + V_PADDING * 2;
let CANVAS_WIDTH = (NUM_FILES - 1) * GRID_SQUARE_SIZE + H_PADDING * 2;
let PIECE_SIZE = 55;

let game = new Game();
game.board.log();

new p5((p: p5) => {
  // VARIABLES
  // ---------

  // This is the coordinate of the piece being dragged
  let currentlyDraggingPos: Pair<number, number> | null = null;
  // This stores information about the mouse and the piece so we can draw the piece being dragged
  // It is a vector from the center of the piece to the mouse
  let currentlyDraggingOffset: p5.Vector | null = null;

  // P5 FUNCTIONS
  // ------------
  p.setup = () => {
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  p.draw = () => {
    p.background(200);

    drawBoard();
    drawPieces();
    drawPieceBeingDragged();
    drawAvailablePositions();
  }

  p.mousePressed = () => {
    console.log(`mouse pressed: (${p.mouseX}, ${p.mouseY})`);

    // Check if pressed on piece
    for (let i = 0; i < NUM_RANKS; i++) {
      for (let j = 0; j < NUM_FILES; j++) {
        if (!game.board.grid[i][j]) continue;
        const canvasPos = coordToCanvasPos(i, j);
        if (p.dist(canvasPos.first, canvasPos.second, p.mouseX, p.mouseY) < PIECE_SIZE / 2) {
          console.log(`clicked on piece: ${new Pair(i, j)}`);
          console.log(`canvas pos: ${canvasPos}`);

          if (game.board.grid[i][j]?.side == game.currentSide) {
            // Clicked on piece!
            currentlyDraggingPos = new Pair(i, j);
            currentlyDraggingOffset = p5.Vector.sub(p.createVector(canvasPos.first, canvasPos.second), p.createVector(p.mouseX, p.mouseY));
            break;
          }
        }
      }
    }
  };

  p.mouseReleased = () => {
    if (currentlyDraggingPos && currentlyDraggingOffset) {

      // Figure out where it was dropped
      let file = -1, rank: number = -1;

      let exit = false;
      for (let i = 0; i < NUM_RANKS && !exit; i++) {
        for (let j = 0; j < NUM_FILES && !exit; j++) {
          const canvasPos = coordToCanvasPos(i, j);
          if (p.dist(canvasPos.first, canvasPos.second, p.mouseX, p.mouseY) < PIECE_SIZE / 2) {
            file = i;
            rank = j;
            exit = true;
          }
        }
      }

      // If dropped in valid location (aka if dropped on the board or like off screen)
      if (file != -1 && rank != -1) {
        console.log(`mouse released on ${new Pair(file, rank)}`);

        const move = new Move(currentlyDraggingPos, new Pair(file, rank));

        // Check if move is legal
        if (game.board.checkMove(move)) {
          // Move the piece
          game.board.move(move);
          game.swapPlayer();
        }
      }

      currentlyDraggingPos = null;
      currentlyDraggingOffset = null;
    }
  }

  // For debugging purposes
  p.keyPressed = () => {
    switch (p.key) {
      case "x":
        game.board.log();
        break;

      default:
        break;
    }
  }

  // HELPER FUNCTIONS
  // ----------------
  function coordToCanvasPos(coord: Pair<number, number>): Pair<number, number>;
  function coordToCanvasPos(a: number, b: number): Pair<number, number>;
  function coordToCanvasPos(a: any, b?: any): Pair<number, number> {

    let x: number, y: number;

    if (a instanceof Pair) {
      x = a.second;
      y = a.first;
    } else {
      x = b;
      y = a;
    }

    return new Pair(x * GRID_SQUARE_SIZE + H_PADDING, y * GRID_SQUARE_SIZE + V_PADDING);
  }


  // DRAWING FUNCTIONS
  // -----------------

  function drawBoard() {

    p.stroke(0);
    p.strokeWeight(4);
    p.noFill();

    // Main grid
    for (let i = 0; i < NUM_FILES - 1; i++) {
      for (let j = 0; j < NUM_RANKS - 1; j++) {
        if (j == 4) continue;

        const pos = coordToCanvasPos(j, i);
        p.square(pos.first, pos.second, GRID_SQUARE_SIZE);
      }
    }

    // Diagonals (top)
    p.line(3 * GRID_SQUARE_SIZE + H_PADDING, V_PADDING, 5 * GRID_SQUARE_SIZE + H_PADDING, 2 * GRID_SQUARE_SIZE + V_PADDING);
    p.line(5 * GRID_SQUARE_SIZE + H_PADDING, V_PADDING, 3 * GRID_SQUARE_SIZE + H_PADDING, 2 * GRID_SQUARE_SIZE + V_PADDING);

    // Diagonals (bottom)
    p.line(3 * GRID_SQUARE_SIZE + H_PADDING, (NUM_RANKS - 1) * GRID_SQUARE_SIZE + V_PADDING, 5 * GRID_SQUARE_SIZE + H_PADDING, (NUM_RANKS - 3) * GRID_SQUARE_SIZE + V_PADDING);
    p.line(5 * GRID_SQUARE_SIZE + H_PADDING, (NUM_RANKS - 1) * GRID_SQUARE_SIZE + V_PADDING, 3 * GRID_SQUARE_SIZE + H_PADDING, (NUM_RANKS - 3) * GRID_SQUARE_SIZE + V_PADDING);

    // Lines at the side
    p.line(H_PADDING, V_PADDING, H_PADDING, V_PADDING + (NUM_RANKS - 1) * GRID_SQUARE_SIZE);
    p.line((NUM_FILES - 1) * GRID_SQUARE_SIZE + H_PADDING, V_PADDING, (NUM_FILES - 1) * GRID_SQUARE_SIZE + H_PADDING, V_PADDING + (NUM_RANKS - 1) * GRID_SQUARE_SIZE);

  }

  function drawPieces() {
    for (let i = 0; i < NUM_RANKS; i++) {
      for (let j = 0; j < NUM_FILES; j++) {
        if ((new Pair(i, j)).equals(currentlyDraggingPos)) continue;
        const pos = coordToCanvasPos(i, j);
        game.board.grid[i][j]?.draw(p, pos.first, pos.second, PIECE_SIZE);
      }
    }
  }

  function drawPieceBeingDragged() {
    if (currentlyDraggingOffset && currentlyDraggingPos) {
      const piecePos = p5.Vector.add(p.createVector(p.mouseX, p.mouseY), currentlyDraggingOffset);

      game.board.grid[currentlyDraggingPos.first][currentlyDraggingPos.second]?.draw(p, piecePos.x, piecePos.y, PIECE_SIZE);
    }
  }

  function drawAvailablePositions() {
    if (currentlyDraggingPos && currentlyDraggingOffset) {
      const availablePos = game.board.availableMoves(currentlyDraggingPos);

      for (const pos of availablePos) {
        const canvasPos = coordToCanvasPos(pos);
        p.fill(0, 255, 0, 100);
        p.noStroke();
        p.ellipse(canvasPos.first, canvasPos.second, PIECE_SIZE / 2);
      }
    }
  }
});