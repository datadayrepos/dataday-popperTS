import type { auto } from '../enums.js'
import type { BasePlacement, Placement } from '../enums'

export default function getBasePlacement(
  placement: Placement | typeof auto,
): BasePlacement {
  // @ts-expect-error
  return placement.split('-')[0]
}
