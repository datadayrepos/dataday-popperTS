import getBasePlacement from '../utils/getBasePlacement.js'
import { left, placements, right, top } from '../enums.js'
import type { Placement } from '../enums'
import type { Modifier, ModifierArguments, Offsets, Rect } from '../types'

export interface Options {
  offset: Offsets
}

export function distanceAndSkiddingToXY(
  placement: Placement,
  rects: { popper: Rect; reference: Rect },
  offset: Offsets,
) {
  const basePlacement = getBasePlacement(placement)
  const invertDistance = [left, top].includes(basePlacement) ? -1 : 1

  let [skidding, distance]
    = typeof offset === 'function'
      ? offset({
        ...rects,
        placement,
      })
      : offset

  skidding = skidding || 0
  distance = (distance || 0) * invertDistance

  return [left, right].includes(basePlacement)
    ? {
        x: distance,
        y: skidding,
      }
    : {
        x: skidding,
        y: distance,
      }
}

function offset({ state, options, name }: ModifierArguments<Options>) {
  const { offset = [0, 0] } = options
  const data = placements.reduce((acc, placement) => {
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset)
    return acc
  }, {})
  const { x, y } = data[state.placement]

  if (state.modifiersData.popperOffsets != null) {
    state.modifiersData.popperOffsets.x += x
    state.modifiersData.popperOffsets.y += y
  }

  state.modifiersData[name] = data
}

export type OffsetModifier = Modifier<'offset', Options>
export default {
  enabled: true,
  fn: offset,
  name: 'offset',
  phase: 'main',
  requires: ['popperOffsets'],
} as OffsetModifier
