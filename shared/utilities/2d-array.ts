export default function create2dArray<T>(x: number, y: number, defaultValue?: T): (T | undefined)[][] {
  return Array.from(Array(x), () => new Array(y)).map((v1) => v1.map((v2) => defaultValue));
}