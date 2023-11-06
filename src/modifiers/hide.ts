import { bottom, left, right, top } from '../enums.js'
import detectOverflow from '../utils/detectOverflow.js'

import type {
  Modifier,
  ModifierArguments,
  Offsets,
  Rect,
  SideObject,
} from '../types'

function getSideOffsets(
  overflow: SideObject,
  rect: Rect,
  preventedOffsets: Offsets = { x: 0, y: 0 },
): SideObject {
  return {
    bottom: overflow.bottom - rect.height + preventedOffsets.y,
    left: overflow.left - rect.width - preventedOffsets.x,
    right: overflow.right - rect.width + preventedOffsets.x,
    top: overflow.top - rect.height - preventedOffsets.y,
  }
}

function isAnySideFullyClipped(overflow: SideObject): boolean {
  return [top, right, bottom, left].some((side) => {
    return overflow[side] >= 0
  })
}

function hide({ state, name }: ModifierArguments<object>) {
  const referenceRect = state.rects.reference
  const popperRect = state.rects.popper
  const preventedOffsets = state.modifiersData.preventOverflow

  const referenceOverflow = detectOverflow(state, {
    elementContext: 'reference',
  })

  const popperAltOverflow = detectOverflow(state, {
    altBoundary: true,
  })

  const referenceClippingOffsets = getSideOffsets(
    referenceOverflow,
    referenceRect,
  )

  const popperEscapeOffsets = getSideOffsets(
    popperAltOverflow,
    popperRect,
    preventedOffsets,
  )

  const isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets)
  const hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets)

  state.modifiersData[name] = {
    hasPopperEscaped,
    isReferenceHidden,
    popperEscapeOffsets,
    referenceClippingOffsets,
  }

  state.attributes.popper = {
    ...state.attributes.popper,
    'data-popper-escaped': hasPopperEscaped,
    'data-popper-reference-hidden': isReferenceHidden,
  }
}

export type HideModifier = Modifier<'hide', object>
export default {
  enabled: true,
  fn: hide,
  name: 'hide',
  phase: 'main',
  requiresIfExists: ['preventOverflow'],
} as HideModifier
