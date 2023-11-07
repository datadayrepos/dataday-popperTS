import type { Placement, Variation } from '../enums'

export default function getVariation(
  placement: Placement,
): Variation | null | undefined {
  return placement.split('-')[1]
}
