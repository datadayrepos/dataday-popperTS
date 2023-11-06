import getClippingRect from '../dom-utils/getClippingRect.js'
import getDocumentElement from '../dom-utils/getDocumentElement.js'
import getBoundingClientRect from '../dom-utils/getBoundingClientRect.js'
import {
  basePlacements,
  bottom,
  clippingParents,
  popper,
  reference,
  right,
  top,
  viewport,
} from '../enums.js'
import { isElement } from '../dom-utils/instanceOf.js'
import computeOffsets from './computeOffsets.js'
import rectToClientRect from './rectToClientRect.js'
import mergePaddingObject from './mergePaddingObject.js'
import expandToHashMap from './expandToHashMap.js'

export default function detectOverflow(state, options = {}) {
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
    Object.keys(overflowOffsets).forEach((key) => {
      const multiply = [right, bottom].includes(key) ? 1 : -1
      const axis = [top, bottom].includes(key) ? 'y' : 'x'
      overflowOffsets[key] += offset[axis] * multiply
    })
  }

  return overflowOffsets
}
