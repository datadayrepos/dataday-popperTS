import getBasePlacement from '../utils/getBasePlacement'
import { left, placements, right, top } from '../enums'
import type { Placement } from '../enums'
import type { Modifier, ModifierArguments, Offsets, Rect } from '../types/types'

export interface Options {
  offset: Offsets
}

export function distanceAndSkiddingToXY(
  placement: Placement,
  rects: { popper: Rect; reference: Rect },
  offset: Offsets,
): { x: any; y: any } {
  const basePlacement = getBasePlacement(placement)
  const invertDistance = ([left, top] as Placement[]).includes(basePlacement) ? -1 : 1

  // Describe the existing tuple/callback dispatch without changing the public Offsets signature.
  const offsetInput = offset as unknown as [number, number] | ((args: {
    popper: Rect
    reference: Rect
    placement: Placement
  }) => [number, number])

  let [skidding, distance]
    = typeof offsetInput === 'function'
      ? offsetInput({
        ...rects,
        placement,
      })
      : offsetInput

  skidding = skidding || 0
  distance = (distance || 0) * invertDistance

  return ([left, right] as Placement[]).includes(basePlacement)
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
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset as Offsets)
    return acc
  }, {} as Record<Placement, Offsets>)
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
