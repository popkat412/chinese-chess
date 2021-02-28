import p5 from "p5";
import { PIECE_CHINESE_CHARACTER } from "../constants";

export enum PieceType {
  Rook = "Rook",
  Horse = "Horse",
  Elephant = "Elephant",
  Advisor = "Advisor",
  King = "King",
  Cannon = "Cannon",
  Pawn = "Pawn",
}

export enum PieceSide {
  Black = "black",
  Red = "red",
}

export class Piece {
  type: PieceType;
  side: PieceSide;

  constructor(type: PieceType, side: PieceSide) {
    this.type = type;
    this.side = side;
  }

  draw(p: p5, x: number, y: number, pieceSize: number) {
    p.fill(255);
    p.stroke(this.side);
    p.circle(x, y, pieceSize);

    p.noStroke();
    p.fill(this.side);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(pieceSize * .5);
    p.text(PIECE_CHINESE_CHARACTER[this.type][this.side], x, y);
  }
}