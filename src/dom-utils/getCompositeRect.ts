import type { Rect, VirtualElement, Window } from '../types'
import getBoundingClientRect from './getBoundingClientRect'
import getNodeScroll from './getNodeScroll'
import getNodeName from './getNodeName'
import { isHTMLElement } from './instanceOf'
import getWindowScrollBarX from './getWindowScrollBarX'
import getDocumentElement from './getDocumentElement'
import isScrollParent from './isScrollParent'

/** This function checks whether the provided value is an instance of the Element class. */
function isElementLocal(value: any): value is Element {
  return value instanceof Element
}

/** This function checks if the dimensions obtained from getBoundingClientRect of an element are scaled relative to its offset width and height. */
function isElementScaled(element: HTMLElement | Window): boolean {
  // Ensure element is of type HTMLElement before trying to access HTMLElement-specific properties
  if (element instanceof HTMLElement) {
    const rect = element.getBoundingClientRect()
    const scaleX = Math.round(rect.width) / element.offsetWidth || 1
    const scaleY = Math.round(rect.height) / element.offsetHeight || 1
    return scaleX !== 1 || scaleY !== 1
  }
  return false
}

// Returns the composite rect of an element relative to its offsetParent.
// Composite means it takes into account transforms as well as layout.
export default function getCompositeRect(
  elementOrVirtualElement: Element | VirtualElement,
  offsetParent: HTMLElement | Window,
  isFixed: boolean = false,
): Rect {
  const isOffsetParentAnElement = isHTMLElement(offsetParent)
  const offsetParentIsScaled
        = isHTMLElement(offsetParent) && isElementScaled(offsetParent)

  const documentElement = isElementLocal(offsetParent)
    ? getDocumentElement(offsetParent)
    : document

  const rect = getBoundingClientRect(
    elementOrVirtualElement,
    offsetParentIsScaled,
    isFixed,
  )
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0,
  }
  let offsets = {
    x: 0,
    y: 0,
  }

  if (isOffsetParentAnElement || (!isOffsetParentAnElement && !isFixed)) {
    if (
      getNodeName(offsetParent) !== 'body' // https://github.com/popperjs/popper-core/issues/1078
            || (isElementLocal(documentElement) && isScrollParent(documentElement))
    )
      scroll = getNodeScroll(offsetParent)

    if (isHTMLElement(offsetParent) && isElementLocal(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent, true)
      offsets.x += offsetParent.clientLeft
      offsets.y += offsetParent.clientTop
    }
    else if (documentElement && isElementLocal(documentElement)) {
      offsets.x = getWindowScrollBarX(documentElement)
    }
  }

  return {
    height: rect.height,
    width: rect.width,
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
  }
}
