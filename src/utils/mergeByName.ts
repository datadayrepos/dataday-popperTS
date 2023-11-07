import type { Modifier } from '../types/types'

// Assuming Modifier is something like this:
// interface Modifier<Name extends string, Options> {
//   name: Name;
//   enabled: boolean;
//   options?: Options;
//   // ...other properties
// }

export default function mergeByName(
  modifiers: Array<Partial<Modifier<string, any>>>,
): Array<Partial<Modifier<string, any>>> {
  // Explicitly type the 'merged' accumulator as a Record with string keys
  // and values of type 'Partial<Modifier<string, any>>'.
  const merged = modifiers.reduce<Record<string, Partial<Modifier<string, any>>>>((acc, current) => {
    // Handle the case where 'current.name' might be undefined
    if (!current.name)
      return acc // Skip the current modifier if it doesn't have a name

    const existing = acc[current.name]
    acc[current.name] = existing
      ? {
          ...existing,
          ...current,
          // Make sure to properly merge 'data' and 'options', which might be undefined.
          data: { ...(existing.data || {}), ...(current.data || {}) },
          options: { ...(existing.options || {}), ...(current.options || {}) },
        }
      : current
    return acc
  }, {})

  // Convert the Record back into an array.
  return Object.keys(merged).map(key => merged[key])
}
