import computeOffsets from '../utils/computeOffsets.js'

import type { Modifier, ModifierArguments } from '../types'

function popperOffsets({ state, name }: ModifierArguments<object>) {
  // Offsets are the actual position the popper needs to have to be
  // properly positioned near its reference element
  // This is the most basic placement, and will be adjusted by
  // the modifiers in the next step
  state.modifiersData[name] = computeOffsets({
    element: state.rects.popper,
    placement: state.placement,
    reference: state.rects.reference,
    strategy: 'absolute',
  })
}

export type PopperOffsetsModifier = Modifier<'popperOffsets', object>
export default {
  data: {},
  enabled: true,
  fn: popperOffsets,
  name: 'popperOffsets',
  phase: 'read',
} as PopperOffsetsModifier
