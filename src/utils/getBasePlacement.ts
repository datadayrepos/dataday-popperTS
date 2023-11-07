import type { BasePlacement, Placement } from '../enums'

// const validBasePlacements: BasePlacement[] = ['top', 'bottom', 'right', 'left']

export default function getBasePlacement(
  placement: Placement,
): Placement {
  // Assume split returns a string that we can cast to BasePlacement
  return placement.split('-')[0] as Placement
}
