import getBasePlacement from '../utils/getBasePlacement.js'
import getLayoutRect from '../dom-utils/getLayoutRect.js'
import contains from '../dom-utils/contains.js'
import getOffsetParent from '../dom-utils/getOffsetParent.js'
import getMainAxisFromPlacement from '../utils/getMainAxisFromPlacement.js'
import { within } from '../utils/within.js'
import mergePaddingObject from '../utils/mergePaddingObject.js'
import expandToHashMap from '../utils/expandToHashMap.js'
import { basePlacements, bottom, left, right, top } from '../enums.js'
import { isHTMLElement } from '../dom-utils/instanceOf.js'

import type { Modifier, ModifierArguments, Padding, Rect } from '../types'
import type { Placement } from '../enums'

export declare interface Options {
  element: HTMLElement | string | null
  padding:
  | Padding
  | ((arg0: {
    popper: Rect
    reference: Rect
    placement: Placement
  }) => Padding)
}

const toPaddingObject = function toPaddingObject(padding, state) {
  padding
    = typeof padding === 'function'
      ? padding(
        Object.assign({}, state.rects, {
          placement: state.placement,
        }),
      )
      : padding
  return mergePaddingObject(
    typeof padding !== 'number'
      ? padding
      : expandToHashMap(padding, basePlacements),
  )
}

function arrow({ state, name, options }: ModifierArguments<Options>) {
  let _state$modifiersData$

  const arrowElement = state.elements.arrow
  const popperOffsets = state.modifiersData.popperOffsets
  const basePlacement = getBasePlacement(state.placement)
  const axis = getMainAxisFromPlacement(basePlacement)
  const isVertical = [left, right].includes(basePlacement)
  const len = isVertical ? 'height' : 'width'

  if (!arrowElement || !popperOffsets)
    return

  const paddingObject = toPaddingObject(options.padding, state)
  const arrowRect = getLayoutRect(arrowElement)
  const minProp = axis === 'y' ? top : left
  const maxProp = axis === 'y' ? bottom : right
  const endDiff
    = state.rects.reference[len]
    + state.rects.reference[axis]
    - popperOffsets[axis]
    - state.rects.popper[len]
  const startDiff = popperOffsets[axis] - state.rects.reference[axis]
  const arrowOffsetParent = getOffsetParent(arrowElement)
  const clientSize = arrowOffsetParent
    ? axis === 'y'
      ? arrowOffsetParent.clientHeight || 0
      : arrowOffsetParent.clientWidth || 0
    : 0
  const centerToReference = endDiff / 2 - startDiff / 2 // Make sure the arrow doesn't overflow the popper if the center point is
  // outside of the popper bounds

  const min = paddingObject[minProp]
  const max = clientSize - arrowRect[len] - paddingObject[maxProp]
  const center = clientSize / 2 - arrowRect[len] / 2 + centerToReference
  const offset = within(min, center, max) // Prevents breaking syntax highlighting...

  const axisProp = axis
  state.modifiersData[name]
    = ((_state$modifiersData$ = {}),
    (_state$modifiersData$[axisProp] = offset),
    (_state$modifiersData$.centerOffset = offset - center),
    _state$modifiersData$)
}

function effect({ state, options }: ModifierArguments<Options>) {
  let { element: arrowElement = '[data-popper-arrow]' } = options
  if (arrowElement == null)
    return

  // CSS selector
  if (typeof arrowElement === 'string') {
    arrowElement = state.elements.popper.querySelector(arrowElement)

    if (!arrowElement)
      return
  }

  if (process.env.NODE_ENV !== 'production') {
    if (!isHTMLElement(arrowElement)) {
      console.error(
        [
          'Popper: "arrow" element must be an HTMLElement (not an SVGElement).',
          'To use an SVG arrow, wrap it in an HTMLElement that will be used as',
          'the arrow.',
        ].join(' '),
      )
    }
  }

  if (!contains(state.elements.popper, arrowElement)) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        [
          'Popper: "arrow" modifier\'s `element` must be a child of the popper',
          'element.',
        ].join(' '),
      )
    }

    return
  }

  state.elements.arrow = arrowElement
}
export type ArrowModifier = Modifier<'arrow', Options>
export default {
  effect,
  enabled: true,
  fn: arrow,
  name: 'arrow',
  phase: 'main',
  requires: ['popperOffsets'],
  requiresIfExists: ['preventOverflow'],
}
