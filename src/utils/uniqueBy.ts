export default function uniqueBy<T>(
  arr: Array<T>,
  fn: (arg0: T) => any,
): Array<T> {
  const identifiers = new Set()
  return arr.filter((item) => {
    const identifier = fn(item)

    if (!identifiers.has(identifier)) {
      identifiers.add(identifier)
      return true
    }
    return false // Explicitly return false when the item is not unique.
  })
}
