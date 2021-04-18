import p5 from "p5";

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

export const PIECE_CHINESE_CHARACTER: {
  [k in PieceType]: { [kk in PieceSide]: string };
} = {
  Rook: { black: "車", red: "車" },
  Horse: { black: "马", red: "马" },
  Elephant: { black: "象", red: "相" },
  Advisor: { black: "士", red: "仕" },
  King: { black: "将", red: "帅" },
  Cannon: { black: "炮", red: "砲" },
  Pawn: { black: "卒", red: "兵" },
};

export class Piece {
  type: PieceType;
  side: PieceSide;

  constructor(type: PieceType, side: PieceSide) {
    this.type = type;
    this.side = side;
  }

  draw(p: p5, x: number, y: number, pieceSize: number): void {
    p.fill(255);
    p.stroke(this.side);
    p.circle(x, y, pieceSize);

    p.noStroke();
    p.fill(this.side);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(pieceSize * 0.5);
    p.text(PIECE_CHINESE_CHARACTER[this.type][this.side], x, y);
  }
}
