import type { Placement } from '../enums'

const hash = {
  bottom: 'top',
  left: 'right',
  right: 'left',
  top: 'bottom',
}
export default function getOppositePlacement(placement: Placement): Placement {
  // @ts-expect-error
  return placement.replace(/left|right|bottom|top/g, (matched) => {
    return hash[matched]
  })
}
