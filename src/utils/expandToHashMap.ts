export default function expandToHashMap<
  T extends number | string | boolean,
  K extends string,
>(
  value: T,
  keys: Array<K>,
): {
    [key: string]: T
  } {
  return keys.reduce((hashMap, key) => {
    // @ts-expect-error
    hashMap[key] = value
    return hashMap
  }, {})
}
