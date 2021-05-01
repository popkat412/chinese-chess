<template>
  <div id="canvas-container"></div>
</template>

<script lang="ts">
import { serialize } from "class-transformer";
import p5 from "p5";
import { Vue, Component } from "vue-property-decorator";
import { namespace } from "vuex-class";
import Move from "../../../shared/chess/move";
import { generateAllMoves } from "../../../shared/chess/move-generator";
import { PersonRole } from "../../../shared/chess/person";
import { PieceSide } from "../../../shared/chess/piece";
import { NUM_FILES, NUM_RANKS } from "../../../shared/constants";
import Pair from "../../../shared/ds/pair";
import { MAKE_MOVE_EVENT } from "../../../shared/events";
import socket from "../../socket";
import Game from "../../../shared/chess/game";

// DRAWING STUFF
// These are not constants because in the future I might want
// these to change as the screen size changes
const GRID_SQUARE_SIZE = 60;
const H_PADDING = 40,
  V_PADDING = 100;
const CANVAS_HEIGHT = (NUM_RANKS - 1) * GRID_SQUARE_SIZE + V_PADDING * 2;
const CANVAS_WIDTH = (NUM_FILES - 1) * GRID_SQUARE_SIZE + H_PADDING * 2;
const PIECE_SIZE = 55;

const gameState = namespace("gameState");

@Component
export default class GameCanvas extends Vue {
  @gameState.State myUserId!: string | null;
  @gameState.State game!: Game | null;

  mounted(): void {
    // p5 stuff here
    new p5((p: p5) => {
      // Variables
      // ---------

      // This is the coordinate of the piece being dragged
      let currentlyDraggingPos: Pair | null = null;
      // This stores information about the mouse and the piece so we can draw the piece being dragged
      // It is a vector from the center of the piece to the mouse
      let currentlyDraggingOffset: p5.Vector | null = null;

      // p5 Functions
      // ------------
      p.setup = () => {
        const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        canvas.parent("canvas-container");
      };

      p.draw = () => {
        p.background(200);

        drawBoard();
        drawPieces();
        drawPieceBeingDragged();
        drawAvailablePositions();
        drawLatestMove();
      };

      p.mousePressed = () => {
        // if (!this.showingCanvas) return;
        if (!this.game) return;

        console.log(`mouse pressed: (${p.mouseX}, ${p.mouseY})`);
        console.log(`myUserId: ${this.myUserId}`);
        console.log(
          `this.game.people.get(myUserId)?.side: ${
            this.game.people.get(this.myUserId ?? "")?.side
          }`
        );

        if (!this.myUserId) return;
        if (this.game.people.get(this.myUserId)?.role != PersonRole.Player)
          return;
        if (
          this.game.board.currentSide !=
          this.game.people.get(this.myUserId)?.side
        )
          return;

        // Check if pressed on piece
        for (let i = 0; i < NUM_RANKS; i++) {
          for (let j = 0; j < NUM_FILES; j++) {
            if (!this.game.board.grid[i][j]) continue;
            const canvasPos = coordToCanvasPos(new Pair(i, j));
            if (
              p.dist(canvasPos.first, canvasPos.second, p.mouseX, p.mouseY) <
              PIECE_SIZE / 2
            ) {
              console.log(`clicked on piece: ${new Pair(i, j)}`);
              console.log(`canvas pos: ${canvasPos}`);

              if (
                this.game.board.grid[i][j]?.side == this.game.board.currentSide
              ) {
                // Clicked on piece!
                currentlyDraggingPos = new Pair(i, j);
                currentlyDraggingOffset = p5.Vector.sub(
                  p.createVector(canvasPos.first, canvasPos.second),
                  p.createVector(p.mouseX, p.mouseY)
                );
                break;
              }
            }
          }
        }
      };

      p.mouseReleased = () => {
        // if (this.showingCanvas) return;
        if (!this.game) return;

        if (currentlyDraggingPos && currentlyDraggingOffset) {
          // Figure out where it was dropped
          let file = -1,
            rank = -1;

          let exit = false;
          for (let i = 0; i < NUM_RANKS && !exit; i++) {
            for (let j = 0; j < NUM_FILES && !exit; j++) {
              const canvasPos = coordToCanvasPos(new Pair(i, j));
              if (
                p.dist(canvasPos.first, canvasPos.second, p.mouseX, p.mouseY) <
                PIECE_SIZE / 2
              ) {
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
            if (this.game.board.checkMove(move)) {
              // Move the piece
              this.game.board.move(move);
              socket.emit(MAKE_MOVE_EVENT, serialize(move));
            }
          }

          currentlyDraggingPos = null;
          currentlyDraggingOffset = null;
        }
      };

      // For debugging purposes
      p.keyPressed = () => {
        if (!this.game) return;

        switch (p.key) {
          case "x":
            this.game.board.log();
            break;
          case "z":
            console.log(
              generateAllMoves(
                this.game.board.grid,
                this.game.board.currentSide
              )
            );
            break;
          case "c":
            console.log(`Current size: ${this.game.board.currentSide}`);
            break;
          default:
            break;
        }
      };

      // Helper Functions
      // ----------------
      const coordToCanvasPos = (
        coord: Pair,
        compensateForSide = true
      ): Pair => {
        if (!this.game) return new Pair(0, 0);

        let x = coord.second;
        let y = coord.first;

        if (
          compensateForSide &&
          this.myUserId &&
          this.game.people.get(this.myUserId)?.side == PieceSide.Red
        ) {
          // swap the x and y
          x = NUM_FILES - x - 1;
          y = NUM_RANKS - y - 1;
        }

        return new Pair(
          x * GRID_SQUARE_SIZE + H_PADDING,
          y * GRID_SQUARE_SIZE + V_PADDING
        );
      };

      // Drawing Functions
      // -----------------

      const drawBoard = () => {
        p.stroke(0);
        p.strokeWeight(4);
        p.noFill();

        // Main grid
        for (let i = 0; i < NUM_FILES - 1; i++) {
          for (let j = 0; j < NUM_RANKS - 1; j++) {
            if (j == 4) continue;

            const pos = coordToCanvasPos(new Pair(j, i), false);
            p.square(pos.first, pos.second, GRID_SQUARE_SIZE);
          }
        }

        // Diagonals (top)
        p.line(
          3 * GRID_SQUARE_SIZE + H_PADDING,
          V_PADDING,
          5 * GRID_SQUARE_SIZE + H_PADDING,
          2 * GRID_SQUARE_SIZE + V_PADDING
        );
        p.line(
          5 * GRID_SQUARE_SIZE + H_PADDING,
          V_PADDING,
          3 * GRID_SQUARE_SIZE + H_PADDING,
          2 * GRID_SQUARE_SIZE + V_PADDING
        );

        // Diagonals (bottom)
        p.line(
          3 * GRID_SQUARE_SIZE + H_PADDING,
          (NUM_RANKS - 1) * GRID_SQUARE_SIZE + V_PADDING,
          5 * GRID_SQUARE_SIZE + H_PADDING,
          (NUM_RANKS - 3) * GRID_SQUARE_SIZE + V_PADDING
        );
        p.line(
          5 * GRID_SQUARE_SIZE + H_PADDING,
          (NUM_RANKS - 1) * GRID_SQUARE_SIZE + V_PADDING,
          3 * GRID_SQUARE_SIZE + H_PADDING,
          (NUM_RANKS - 3) * GRID_SQUARE_SIZE + V_PADDING
        );

        // Lines at the side
        p.line(
          H_PADDING,
          V_PADDING,
          H_PADDING,
          V_PADDING + (NUM_RANKS - 1) * GRID_SQUARE_SIZE
        );
        p.line(
          (NUM_FILES - 1) * GRID_SQUARE_SIZE + H_PADDING,
          V_PADDING,
          (NUM_FILES - 1) * GRID_SQUARE_SIZE + H_PADDING,
          V_PADDING + (NUM_RANKS - 1) * GRID_SQUARE_SIZE
        );
      };

      const drawPieces = () => {
        if (!this.game) return;

        for (let i = 0; i < NUM_RANKS; i++) {
          for (let j = 0; j < NUM_FILES; j++) {
            if (new Pair(i, j).equals(currentlyDraggingPos)) continue;
            const pos = coordToCanvasPos(new Pair(i, j));
            this.game.board.grid[i][j]?.draw(
              p,
              pos.first,
              pos.second,
              PIECE_SIZE
            );
          }
        }
      };

      const drawPieceBeingDragged = () => {
        if (!this.game) return;

        if (currentlyDraggingOffset && currentlyDraggingPos) {
          const piecePos = p5.Vector.add(
            p.createVector(p.mouseX, p.mouseY),
            currentlyDraggingOffset
          );

          this.game.board.grid[currentlyDraggingPos.first][
            currentlyDraggingPos.second
          ]?.draw(p, piecePos.x, piecePos.y, PIECE_SIZE);
        }
      };

      const drawAvailablePositions = () => {
        if (!this.game) return;

        if (currentlyDraggingPos && currentlyDraggingOffset) {
          const availablePos = this.game.board.availableMoves(
            currentlyDraggingPos
          );

          for (const pos of availablePos) {
            const canvasPos = coordToCanvasPos(pos.to);
            p.fill(0, 255, 0, 100);
            p.noStroke();
            p.ellipse(canvasPos.first, canvasPos.second, PIECE_SIZE / 2);
          }
        }
      };

      const drawLatestMove = () => {
        if (!this.game || !this.game.board.latestMove) return;

        p.push();

        p.rectMode(p.CENTER);
        p.stroke(100);
        p.noFill();

        // From
        const fromPos = coordToCanvasPos(this.game.board.latestMove.from);
        p.rect(
          fromPos.first,
          fromPos.second,
          GRID_SQUARE_SIZE / 2,
          GRID_SQUARE_SIZE / 2
        );

        // To
        const toPos = coordToCanvasPos(this.game.board.latestMove.to);
        p.rect(
          toPos.first,
          toPos.second,
          GRID_SQUARE_SIZE + 2,
          GRID_SQUARE_SIZE + 2
        );

        p.pop();
      };
    });
  }
}
</script>

<style scoped>
/* Canvas */
#canvas-container {
  display: flex;
  align-items: center;
  justify-content: center;
  grid-area: canvas;
}
</style>
