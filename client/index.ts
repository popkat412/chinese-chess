import { default as axiosStatic } from "axios";
import { deserialize, serialize } from "class-transformer";
import p5 from "p5";
import "reflect-metadata";
import { io } from "socket.io-client";
import Vue from "vue";
import Game from "../shared/chess/game";
import Move from "../shared/chess/move";
import { generateAllMoves } from "../shared/chess/move-generator";
import { PersonRole } from "../shared/chess/person";
import { PieceSide } from "../shared/chess/piece";
import { NUM_FILES, NUM_RANKS } from "../shared/constants";
import Pair from "../shared/ds/pair";
import {
  ERROR_EVENT,
  GAME_UPDATE_EVENT,
  JoinGameData,
  JOIN_GAME_EVENT,
  MAKE_MOVE_EVENT,
  USER_ID_EVENT,
} from "../shared/events";
import CreateGame from "../shared/models/create-game";
import ValidateJoinResult from "../shared/models/validate-join-result";
import validateNickname from "../shared/validation";

//===============//
//     AXIOS     //
//===============//
const axios = axiosStatic.create({
  baseURL: `${__DEPLOY_URL__}/api/`,
});

//=================//
//     GLOBALS     //
//=================//

declare global {
  const __DEPLOY_URL__: string;
  const __DEPLOY_URL__: string;
}

// DRAWING STUFF
// These are not constants because in the future I might want
// these to change as the screen size changes
let GRID_SQUARE_SIZE = 60;
let H_PADDING = 40,
  V_PADDING = 100;
let CANVAS_HEIGHT = (NUM_RANKS - 1) * GRID_SQUARE_SIZE + V_PADDING * 2;
let CANVAS_WIDTH = (NUM_FILES - 1) * GRID_SQUARE_SIZE + H_PADDING * 2;
let PIECE_SIZE = 55;

// GAME LOGIC STUFF
let game = new Game();
game.board.log();
let myUserId: string | null = null;

//================//
//     SERVER     //
//================//
const socket = io(__DEPLOY_URL__, { autoConnect: false });
socket.onAny((event, ...args) => {
  console.info(`New socket event: ${event}, ${args}`);
});
socket.on(GAME_UPDATE_EVENT, (data: string) => {
  game = deserialize(Game, data);
});
socket.on(USER_ID_EVENT, (userId: string) => {
  myUserId = userId;
  console.log(`My user id: ${myUserId}`);
});
socket.on(ERROR_EVENT, (error: string) => {
  console.error(`Socket returned error: ${error}`);
  alert(`Socket returned error: ${error}`);
});
socket.on("disconnect", () => {
  myUserId = null;
  vm.$data.showingCanvas = false;
});

//========================//
//     URL Parameters     //
//========================//
const urlParamGameId = new URLSearchParams(window.location.search).get(
  "gameId"
);

//================//
//     SKETCH     //
//================//
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
  };

  p.mousePressed = () => {
    if (!vm.$data.showingCanvas) return;

    console.log(`mouse pressed: (${p.mouseX}, ${p.mouseY})`);
    console.log(`myUserId: ${myUserId}`);
    console.log(
      `game.people.get(myUserId)?.side: ${
        game.people.get(myUserId ?? "")?.side
      }`
    );

    if (!myUserId) return;
    if (game.people.get(myUserId)?.role != PersonRole.Player) return;
    if (game.board.currentSide != game.people.get(myUserId)?.side) return;

    // Check if pressed on piece
    for (let i = 0; i < NUM_RANKS; i++) {
      for (let j = 0; j < NUM_FILES; j++) {
        if (!game.board.grid[i][j]) continue;
        const canvasPos = coordToCanvasPos(new Pair(i, j));
        if (
          p.dist(canvasPos.first, canvasPos.second, p.mouseX, p.mouseY) <
          PIECE_SIZE / 2
        ) {
          console.log(`clicked on piece: ${new Pair(i, j)}`);
          console.log(`canvas pos: ${canvasPos}`);

          if (game.board.grid[i][j]?.side == game.board.currentSide) {
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
    if (!vm.$data.showingCanvas) return;

    if (currentlyDraggingPos && currentlyDraggingOffset) {
      // Figure out where it was dropped
      let file = -1,
        rank: number = -1;

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
        if (game.board.checkMove(move)) {
          // Move the piece
          game.board.move(move);
          socket.emit(MAKE_MOVE_EVENT, serialize(move));
        }
      }

      currentlyDraggingPos = null;
      currentlyDraggingOffset = null;
    }
  };

  // For debugging purposes
  p.keyPressed = () => {
    switch (p.key) {
      case "x":
        game.board.log();
        break;
      case "z":
        console.log(generateAllMoves(game.board.grid, game.board.currentSide));
        break;
      case "c":
        console.log(`Current size: ${game.board.currentSide}`);
      default:
        break;
    }
  };

  // Helper Functions
  // ----------------
  function coordToCanvasPos(
    coord: Pair,
    compensateForSide: boolean = true
  ): Pair {
    let x = coord.second;
    let y = coord.first;

    if (
      compensateForSide &&
      myUserId &&
      game.people.get(myUserId)?.side == PieceSide.Red
    ) {
      // swap the x and y
      x = NUM_FILES - x - 1;
      y = NUM_RANKS - y - 1;
    }

    return new Pair(
      x * GRID_SQUARE_SIZE + H_PADDING,
      y * GRID_SQUARE_SIZE + V_PADDING
    );
  }

  // Drawing Functions
  // -----------------

  function drawBoard() {
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
  }

  function drawPieces() {
    // TODO: Draw the side you're on as the bottom
    for (let i = 0; i < NUM_RANKS; i++) {
      for (let j = 0; j < NUM_FILES; j++) {
        if (new Pair(i, j).equals(currentlyDraggingPos)) continue;
        const pos = coordToCanvasPos(new Pair(i, j));
        game.board.grid[i][j]?.draw(p, pos.first, pos.second, PIECE_SIZE);
      }
    }
  }

  function drawPieceBeingDragged() {
    if (currentlyDraggingOffset && currentlyDraggingPos) {
      const piecePos = p5.Vector.add(
        p.createVector(p.mouseX, p.mouseY),
        currentlyDraggingOffset
      );

      game.board.grid[currentlyDraggingPos.first][
        currentlyDraggingPos.second
      ]?.draw(p, piecePos.x, piecePos.y, PIECE_SIZE);
    }
  }

  function drawAvailablePositions() {
    if (currentlyDraggingPos && currentlyDraggingOffset) {
      const availablePos = game.board.availableMoves(currentlyDraggingPos);

      for (const pos of availablePos) {
        const canvasPos = coordToCanvasPos(pos.to);
        p.fill(0, 255, 0, 100);
        p.noStroke();
        p.ellipse(canvasPos.first, canvasPos.second, PIECE_SIZE / 2);
      }
    }
  }
});

//===========//
//    UI     //
//===========//

interface CreateGameFormData {
  name: string;
  role: string;
  side: string;
}

interface JoinGameFormData extends CreateGameFormData {
  gameId: string;
}

interface VueData {
  showingCanvas: boolean;

  createGameBoxStyle: object;

  joinGameData: JoinGameFormData;
  createGameData: CreateGameFormData;

  gameId: string | null;
}

const vm = new Vue({
  el: document.getElementById("app")!,
  data(): VueData {
    return {
      showingCanvas: false,

      createGameBoxStyle: {
        filter: `opacity(${urlParamGameId ? "20%" : "100%"})`,
        // filter: `opacity(20%)`,
        transition: "1s",
      },

      joinGameData: {
        gameId: urlParamGameId ?? "",
        name: "",
        role: PersonRole.Player,
        side: PieceSide.Red,
      },
      createGameData: {
        name: "",
        role: PersonRole.Player,
        side: PieceSide.Red,
      },
      gameId: urlParamGameId,
    };
  },
  computed: {
    joinUrl(): string {
      return `${__DEPLOY_URL__}/?gameId=${this.gameId}`;
    },
  },
  methods: {
    async copyJoinUrl() {
      await navigator.clipboard.writeText(this.joinUrl);
      alert("Copied to clipboard!");
    },
    joinGame(data: JoinGameData) {
      if (socket.connected) {
        console.warn("Socket already open");
        alert("An unexpected error occurred");
        return;
      }

      socket.connect();
      socket.emit(JOIN_GAME_EVENT, data);

      this.showingCanvas = true;
    },

    async joinGamePressed() {
      // Validate form inputs
      if (this.joinGameData.gameId.trim() == "") {
        alert("Game ID is required");
        return;
      }

      console.log(`joinGameData: ${JSON.stringify(this.joinGameData)}`);
      const res = (
        await axios.post<ValidateJoinResult>("/validateJoin", this.joinGameData)
      ).data;

      if (!res.valid) {
        alert(`Error: ${res.errorMessage}`);
        return;
      }

      // Prepare the data
      const data: JoinGameData = {
        gameId: this.joinGameData.gameId,
        name: this.joinGameData.name,
        role: this.joinGameData.role as PersonRole,
        side: this.joinGameData.side as PieceSide,
      };

      this.joinGame(data);
    },

    async createGamePressed() {
      console.log("Creating game...");

      // Validate form inputs
      const nicknameValidation = validateNickname(this.createGameData.name);
      if (nicknameValidation != true) {
        alert(nicknameValidation);
        return;
      }

      try {
        const gameId = (await axios.get<CreateGame>("/createGame")).data.gameId;

        this.gameId = gameId;

        this.joinGame({
          gameId,
          name: this.createGameData.name,
          role: this.createGameData.role as PersonRole,
          side: this.createGameData.side as PieceSide,
        });
      } catch (e) {
        console.error(e);
        alert(`Error creating game: ${e}`);
        return;
      }
    },

    leaveGamePressed() {
      console.log("Leaving game");

      socket.disconnect();
    },
  },
});
