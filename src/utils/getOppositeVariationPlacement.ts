import type { Placement } from '../enums'

// Assuming Placement is a union of string literals like 'top', 'top-start', 'bottom', 'bottom-end', etc.
const hash: { [key: string]: string } = {
  end: 'start',
  start: 'end',
}

export default function getOppositeVariationPlacement(
  placement: Placement,
): Placement {
  // Use a type assertion to tell TypeScript that matched will be a key of hash
  return placement.replace(/start|end/g, (matched) => {
    return hash[matched as keyof typeof hash]
  }) as Placement // Cast the return value to Placement
}
