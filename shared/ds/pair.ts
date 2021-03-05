export default class Pair<First, Second> {
  first: First;
  second: Second;

  constructor(first: First, second: Second) {
    this.first = first;
    this.second = second;
  }

  equals(other: Pair<First, Second> | null | undefined): boolean {
    if (other) {
      return this.first == other.first && this.second == other.second;
    } else {
      return false;
    }
  }

  copy(): Pair<First, Second> {
    return new Pair(this.first, this.second);
  }

  toString() {
    return `(${this.first}, ${this.second})`;
  }
}