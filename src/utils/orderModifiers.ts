import { modifierPhases } from '../enums' // source: https://stackoverflow.com/questions/49875255
import type { Modifier } from '../types/types'

function order(modifiers: Modifier<string, object>[]) {
  const map = new Map<string, Modifier<string, object>>()
  const visited = new Set<string>()
  const result: Modifier<string, object>[] = []
  modifiers.forEach((modifier) => {
    map.set(modifier.name, modifier)
  }) // On visiting object, check for its dependencies and visit them recursively

  function sort(modifier: Modifier<any, any>) {
    visited.add(modifier.name)

    const requires = [
      ...(modifier.requires || []),
      ...(modifier.requiresIfExists || []),
    ]

    requires.forEach((dep) => {
      if (!visited.has(dep)) {
        const depModifier = map.get(dep)

        if (depModifier)
          sort(depModifier)
      }
    })
    result.push(modifier)
  }

  modifiers.forEach((modifier) => {
    if (!visited.has(modifier.name)) {
      // check for visited object
      sort(modifier)
    }
  })
  return result
}

export default function orderModifiers(
  modifiers: Array<Modifier<any, any>>,
): Array<Modifier<any, any>> {
  // order based on dependencies
  const orderedModifiers = order(modifiers)

  // order based on phase
  return modifierPhases.reduce<Array<Modifier<any, any>>>((acc, phase) => {
    return acc.concat(
      orderedModifiers.filter(modifier => modifier.phase === phase),
    )
  }, [])
}
