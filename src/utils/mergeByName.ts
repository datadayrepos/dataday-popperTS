import type { Modifier } from '../types'

export default function mergeByName(
  modifiers: Array<Partial<Modifier<any, any>>>,
): Array<Partial<Modifier<any, any>>> {
  const merged = modifiers.reduce((merged, current) => {
    const existing = merged[current.name]
    merged[current.name] = existing
      ? {
          ...existing,
          ...current,
          data: { ...existing.data, ...current.data },
          options: { ...existing.options, ...current.options },
        }
      : current
    return merged
  }, {})

  // IE11 does not support Object.values
  return Object.keys(merged).map(key => merged[key])
}
