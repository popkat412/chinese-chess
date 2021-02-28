import Pair from "../ds/pair";

export default class Move {
  from: Pair<number, number>;
  to: Pair<number, number>;

  constructor(from: Pair<number, number>, to: Pair<number, number>) {
    this.from = from;
    this.to = to;
  }
}