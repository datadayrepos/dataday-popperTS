import type { Placement, Variation } from '../enums'

export default function getVariation(
  placement: Placement,
): Variation | null | undefined {
  // @ts-expect-error
  return placement.split('-')[1]
}
