import type { Placement } from '../enums'

const hash = {
  end: 'start',
  start: 'end',
}
export default function getOppositeVariationPlacement(
  placement: Placement,
): Placement {
  // @ts-expect-error
  return placement.replace(/start|end/g, (matched) => {
    return hash[matched]
  })
}
