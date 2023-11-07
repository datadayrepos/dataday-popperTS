import getClippingRect from '../dom-utils/getClippingRect'
import getDocumentElement from '../dom-utils/getDocumentElement'
import getBoundingClientRect from '../dom-utils/getBoundingClientRect'
import {
  basePlacements,
  bottom,
  clippingParents,
  popper,
  reference,
  right,
  top,
  viewport,
} from '../enums'
import type { Boundary, Context, Placement, RootBoundary } from '../enums'

import { isElement } from '../dom-utils/instanceOf'
import type { Padding, State } from '../types/types'
import computeOffsets from './computeOffsets'
import rectToClientRect from './rectToClientRect'
import mergePaddingObject from './mergePaddingObject'
import expandToHashMap from './expandToHashMap'

interface DetectOverflowOptions {
  placement?: Placement
  strategy?: string
  boundary?: Boundary
  rootBoundary?: RootBoundary
  elementContext?: Context
  altBoundary?: boolean
  padding?: number | Padding // Assuming PaddingObject is a type that you have defined
}

export default function detectOverflow(state: State, options: DetectOverflowOptions = {}) {
  const _options = options
  const _options$placement = _options.placement
  const placement
    = _options$placement === undefined ? state.placement : _options$placement
  const _options$strategy = _options.strategy
  const strategy
    = _options$strategy === undefined ? state.strategy : _options$strategy
  const _options$boundary = _options.boundary
  const boundary
    = _options$boundary === undefined ? clippingParents : _options$boundary
  const _options$rootBoundary = _options.rootBoundary
  const rootBoundary
    = _options$rootBoundary === undefined ? viewport : _options$rootBoundary
  const _options$elementConte = _options.elementContext
  const elementContext
    = _options$elementConte === undefined ? popper : _options$elementConte
  const _options$altBoundary = _options.altBoundary
  const altBoundary
    = _options$altBoundary === undefined ? false : _options$altBoundary
  const _options$padding = _options.padding
  const padding = _options$padding === undefined ? 0 : _options$padding
  const paddingObject = mergePaddingObject(
    typeof padding !== 'number'
      ? padding
      : expandToHashMap(padding, basePlacements),
  )
  const altContext = elementContext === popper ? reference : popper
  const popperRect = state.rects.popper
  const element = state.elements[altBoundary ? altContext : elementContext]
  const clippingClientRect = getClippingRect(
    isElement(element)
      ? element
      : element.contextElement || getDocumentElement(state.elements.popper),
    boundary,
    rootBoundary,
    strategy,
  )
  const referenceClientRect = getBoundingClientRect(state.elements.reference)
  const popperOffsets = computeOffsets({
    element: popperRect,
    placement,
    reference: referenceClientRect,
    strategy: 'absolute',
  })
  const popperClientRect = rectToClientRect(
    Object.assign({}, popperRect, popperOffsets),
  )
  const elementClientRect
    = elementContext === popper ? popperClientRect : referenceClientRect // positive = overflowing the clipping rect
  // 0 or negative = within the clipping rect

  const overflowOffsets = {
    bottom:
      elementClientRect.bottom
      - clippingClientRect.bottom
      + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right:
      elementClientRect.right - clippingClientRect.right + paddingObject.right,
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
  }
  const offsetData = state.modifiersData.offset // Offsets can be applied only to the popper element

  if (elementContext === popper && offsetData) {
    const offset = offsetData[placement]
    if (offset) { // Check if offset is not undefined
      Object.keys(overflowOffsets).forEach((key) => {
        const side: 'top' | 'left' | 'right' | 'bottom' = key as 'top' | 'left' | 'right' | 'bottom'

        if (side === 'right' || side === 'bottom') {
          // side is now narrowed to "right" | "bottom"
          const multiply = 1
          const axis = side === 'bottom' ? 'y' : 'x'
          overflowOffsets[side] += offset[axis] * multiply
        }
        else {
          // side is "top" | "left"
          const multiply = -1
          const axis = side === 'top' ? 'y' : 'x'
          overflowOffsets[side] += offset[axis] * multiply
        }
      })
    }
  }

  return overflowOffsets
}
