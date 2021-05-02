export default function multipleEquals<T>(...values: T[]): boolean {
  return values.every((v) => v === values[0]);
}
