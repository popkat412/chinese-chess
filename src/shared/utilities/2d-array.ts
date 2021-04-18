export default function create2dArray<T>(
  x: number,
  y: number,
  defaultValue?: T
): Array<Array<T | null>> {
  let returnV: Array<Array<T | null>> = [];

  for (let i = 0; i < x; i++) {
    returnV.push([]);
    for (let j = 0; j < y; j++) {
      returnV[i].push(defaultValue ?? null);
    }
  }

  return returnV;
}
