export default class Pair {
  first: number;
  second: number;

  constructor(first: number, second: number) {
    this.first = first;
    this.second = second;
  }

  equals(other: Pair | null | undefined): boolean {
    if (other) {
      return this.first == other.first && this.second == other.second;
    } else {
      return false;
    }
  }

  copy(): Pair {
    return new Pair(this.first, this.second);
  }

  toString() {
    return `(${this.first}, ${this.second})`;
  }
}