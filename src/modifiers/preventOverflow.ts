import { bottom, left, right, start, top } from '../enums'
import getBasePlacement from '../utils/getBasePlacement'
import getMainAxisFromPlacement from '../utils/getMainAxisFromPlacement'
import getAltAxis from '../utils/getAltAxis'
import { within, withinMaxClamp } from '../utils/within'
import getLayoutRect from '../dom-utils/getLayoutRect'
import getOffsetParent from '../dom-utils/getOffsetParent'
import detectOverflow from '../utils/detectOverflow'
import getVariation from '../utils/getVariation'
import getFreshSideObject from '../utils/getFreshSideObject'
import { max as mathMax, min as mathMin } from '../utils/math'

import type { Boundary, Placement, RootBoundary } from '../enums'
import type { Modifier, ModifierArguments, Padding, Rect } from '../types/types'

// Assuming Rect and Placement are types
type TetherOffset =
  | ((args: { popper: Rect; reference: Rect; placement: Placement }) => number | { mainAxis: number; altAxis: number })
  | number
  | { mainAxis: number; altAxis: number }

export interface Options {
  /* Prevents boundaries overflow on the main axis */
  mainAxis: boolean
  /* Prevents boundaries overflow on the alternate axis */
  altAxis: boolean
  /* The area to check the popper is overflowing in */
  boundary: Boundary
  /* If the popper is not overflowing the main area, fallback to this one */
  rootBoundary: RootBoundary
  /* Use the reference's "clippingParents" boundary context */
  altBoundary: boolean
  /**
   * Allows the popper to overflow from its boundaries to keep it near its
   * reference element
   */
  tether: boolean
  /* Offsets when the `tether` option should activate */
  tetherOffset: TetherOffset
  /* Sets a padding to the provided boundary */
  padding: Padding
}

function preventOverflow({ state, options, name }: ModifierArguments<Options>) {
  const {
    mainAxis: checkMainAxis = true,
    altAxis: checkAltAxis = false,
    boundary,
    rootBoundary,
    altBoundary,
    padding,
    tether = true,
    tetherOffset = 0,
  } = options

  const overflow = detectOverflow(state, {
    altBoundary,
    boundary,
    padding,
    rootBoundary,
  })
  const basePlacement = getBasePlacement(state.placement)
  const variation = getVariation(state.placement)
  const isBasePlacement = !variation
  const mainAxis = getMainAxisFromPlacement(basePlacement)
  const altAxis = getAltAxis(mainAxis)
  const popperOffsets = state.modifiersData.popperOffsets
  const referenceRect = state.rects.reference
  const popperRect = state.rects.popper

  const tetherOffsetValue
    = typeof tetherOffset === 'function'
      ? tetherOffset(
        Object.assign({}, state.rects, {
          placement: state.placement,
        }),
      )
      : tetherOffset

  const normalizedTetherOffsetValue
    = typeof tetherOffsetValue === 'number'
      ? {
          altAxis: tetherOffsetValue,
          mainAxis: tetherOffsetValue,
        }
      : Object.assign(
        {
          altAxis: 0,
          mainAxis: 0,
        },
        tetherOffsetValue,
      )

  const offsetModifierState = state.modifiersData.offset
    ? state.modifiersData.offset[state.placement]
    : null

  const data = {
    x: 0,
    y: 0,
  }

  if (!popperOffsets)
    return

  if (checkMainAxis) {
    const mainSide = mainAxis === 'y' ? top : left
    const altSide = mainAxis === 'y' ? bottom : right
    const len = mainAxis === 'y' ? 'height' : 'width'
    const offset = popperOffsets[mainAxis]

    const min = offset + overflow[mainSide]
    const max = offset - overflow[altSide]

    const additive = tether ? -popperRect[len] / 2 : 0

    const minLen = variation === start ? referenceRect[len] : popperRect[len]
    const maxLen = variation === start ? -popperRect[len] : -referenceRect[len]

    // We need to include the arrow in the calculation so the arrow doesn't go
    // outside the reference bounds
    const arrowElement = state.elements.arrow
    const arrowRect
      = tether && arrowElement
        ? getLayoutRect(arrowElement)
        : {
            height: 0,
            width: 0,
          }

    const arrowPaddingObject = state.modifiersData['arrow#persistent']
      ? state.modifiersData['arrow#persistent'].padding
      : getFreshSideObject()

    const arrowPaddingMin = arrowPaddingObject[mainSide]
    const arrowPaddingMax = arrowPaddingObject[altSide]

    // If the reference length is smaller than the arrow length, we don't want
    // to include its full size in the calculation. If the reference is small
    // and near the edge of a boundary, the popper can overflow even if the
    // reference is not overflowing as well (e.g. virtual elements with no
    // width or height)
    const arrowLen = within(0, referenceRect[len], arrowRect[len])

    const minOffset = isBasePlacement
      ? referenceRect[len] / 2
      - additive
      - arrowLen
      - arrowPaddingMin
      - normalizedTetherOffsetValue.mainAxis
      : minLen
      - arrowLen
      - arrowPaddingMin
      - normalizedTetherOffsetValue.mainAxis

    const maxOffset = isBasePlacement
      ? -referenceRect[len] / 2
      + additive
      + arrowLen
      + arrowPaddingMax
      + normalizedTetherOffsetValue.mainAxis
      : maxLen
      + arrowLen
      + arrowPaddingMax
      + normalizedTetherOffsetValue.mainAxis

    const arrowOffsetParent
      = state.elements.arrow && getOffsetParent(state.elements.arrow)

    const clientOffset = arrowOffsetParent
      ? mainAxis === 'y'
        ? arrowOffsetParent.clientTop || 0
        : arrowOffsetParent.clientLeft || 0
      : 0

    const offsetModifierValue = offsetModifierState?.[mainAxis] ?? 0
    const tetherMin = offset + minOffset - offsetModifierValue - clientOffset
    const tetherMax = offset + maxOffset - offsetModifierValue

    const preventedOffset = within(
      tether ? mathMin(min, tetherMin) : min,
      offset,
      tether ? mathMax(max, tetherMax) : max,
    )
    popperOffsets[mainAxis] = preventedOffset
    data[mainAxis] = preventedOffset - offset
  }

  if (checkAltAxis) {
    const mainSide = mainAxis === 'x' ? top : left
    const altSide = mainAxis === 'x' ? bottom : right
    const offset = popperOffsets[altAxis]

    const len = altAxis === 'y' ? 'height' : 'width'

    const min = offset + overflow[mainSide]
    const max = offset - overflow[altSide]

    const isOriginSide: boolean = basePlacement === 'top' || basePlacement === 'left'

    const offsetModifierValue = offsetModifierState?.[altAxis] ?? 0

    const tetherMin = isOriginSide
      ? min
      : offset
      - referenceRect[len]
      - popperRect[len]
      - offsetModifierValue
      + normalizedTetherOffsetValue.altAxis

    const tetherMax = isOriginSide
      ? offset
      + referenceRect[len]
      + popperRect[len]
      - offsetModifierValue
      - normalizedTetherOffsetValue.altAxis
      : max

    const preventedOffset
      = tether && isOriginSide
        ? withinMaxClamp(tetherMin, offset, tetherMax)
        : within(tether ? tetherMin : min, offset, tether ? tetherMax : max)

    popperOffsets[altAxis] = preventedOffset
    data[altAxis] = preventedOffset - offset
  }

  state.modifiersData[name] = data
}

export type PreventOverflowModifier = Modifier<'preventOverflow', Options>
export default {
  enabled: true,
  fn: preventOverflow,
  name: 'preventOverflow',
  phase: 'main',
  requiresIfExists: ['offset'],
} as PreventOverflowModifier
