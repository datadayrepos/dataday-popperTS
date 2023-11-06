import { viewport } from '../enums'
import rectToClientRect from '../utils/rectToClientRect'
import { max, min } from '../utils/math'
import type { ClientRectObject, PositioningStrategy } from '../types'
import type { Boundary, RootBoundary } from '../enums'
import getViewportRect from './getViewportRect'
import getDocumentRect from './getDocumentRect'
import listScrollParents from './listScrollParents'
import getOffsetParent from './getOffsetParent'
import getDocumentElement from './getDocumentElement'
import getComputedStyle from './getComputedStyle'
import { isElement, isHTMLElement } from './instanceOf'
import getBoundingClientRect from './getBoundingClientRect'
import getParentNode from './getParentNode'
import contains from './contains'
import getNodeName from './getNodeName'

function getInnerBoundingClientRect(
  element: Element,
  strategy: PositioningStrategy,
) {
  const rect = getBoundingClientRect(element, false, strategy === 'fixed')
  rect.top = rect.top + element.clientTop
  rect.left = rect.left + element.clientLeft
  rect.bottom = rect.top + element.clientHeight
  rect.right = rect.left + element.clientWidth
  rect.width = element.clientWidth
  rect.height = element.clientHeight
  rect.x = rect.left
  rect.y = rect.top
  return rect
}

function getClientRectFromMixedType(
  element: Element,
  clippingParent: Element | RootBoundary,
  strategy: PositioningStrategy,
): ClientRectObject {
  return clippingParent === viewport
    ? rectToClientRect(getViewportRect(element, strategy))
    : isElement(clippingParent)
      ? getInnerBoundingClientRect(clippingParent as Element, strategy) // isElement check in the ternary condition.
      : rectToClientRect(getDocumentRect(getDocumentElement(element)))
}

// A "clipping parent" is an overflowable container with the characteristic of
// clipping (or hiding) overflowing elements with a position different from
// `initial`
function getClippingParents(element: Element): Array<Element> {
  const clippingParents = listScrollParents(getParentNode(element))
  const canEscapeClipping
        = ['absolute', 'fixed'].includes(getComputedStyle(element).position)
  const clipperElement
        = canEscapeClipping && isHTMLElement(element)
          ? getOffsetParent(element)
          : element

  if (!isElement(clipperElement))
    return []

  // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414
  // @ts-expect-error todoreturn
  return clippingParents.filter((clippingParent) => {
    return (
      isElement(clippingParent)
            && contains(clippingParent as Element, clipperElement)
            && getNodeName(clippingParent) !== 'body'
    )
  })
}

function isElementLocal(value: any): value is Element {
  return value instanceof Element
}

// Gets the maximum area that the element is visible in due to any number of
// clipping parents
export default function getClippingRect(
  element: Element,
  boundary: Boundary,
  rootBoundary: RootBoundary,
  strategy: PositioningStrategy,
): ClientRectObject {
  const mainClippingParents
        = boundary === 'clippingParents'
          ? getClippingParents(element)
          : ([] as Element[]).concat(boundary)

  const clippingParents = ([] as Element[]).concat(mainClippingParents)
  if (isElementLocal(rootBoundary))
    clippingParents.push(rootBoundary)

  const firstClippingParent = clippingParents[0]
  const clippingRect = clippingParents.reduce((
    accRect,
    clippingParent,
  ) => {
    const rect = getClientRectFromMixedType(
      element,
      clippingParent,
      strategy,
    )
    accRect.top = max(rect.top, accRect.top)
    accRect.right = min(rect.right, accRect.right)
    accRect.bottom = min(rect.bottom, accRect.bottom)
    accRect.left = max(rect.left, accRect.left)
    return accRect
  }, getClientRectFromMixedType(element, firstClippingParent, strategy))
  clippingRect.width = clippingRect.right - clippingRect.left
  clippingRect.height = clippingRect.bottom - clippingRect.top
  clippingRect.x = clippingRect.left
  clippingRect.y = clippingRect.top
  return clippingRect
}
