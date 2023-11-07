import { round } from '../utils/math'
import type { ClientRectObject, VirtualElement } from '../types/types'
import { isElement, isHTMLElement } from './instanceOf'
import getWindow from './getWindow'
import isLayoutViewport from './isLayoutViewport'

/*
function isVirtualElement(
    element: Element | VirtualElement
): element is VirtualElement {
    return 'getBoundingClientRect' in element
}
*/
export default function getBoundingClientRect(
  element: Element | VirtualElement,
  includeScale: boolean = false,
  isFixedStrategy: boolean = false,
): ClientRectObject {
  const clientRect = element.getBoundingClientRect()
  let scaleX = 1
  let scaleY = 1

  if (includeScale && isHTMLElement(element)) {
    const htmlElement = element as HTMLElement

    scaleX
            = htmlElement.offsetWidth > 0
        ? round(clientRect.width) / htmlElement.offsetWidth || 1
        : 1
    scaleY
            = htmlElement.offsetHeight > 0
        ? round(clientRect.height) / htmlElement.offsetHeight || 1
        : 1
  }

  const _ref = isElement(element) ? getWindow(element) : window
  const visualViewport = _ref.visualViewport

  const addVisualOffsets = !isLayoutViewport() && isFixedStrategy
  const x
        = (clientRect.left
            + (addVisualOffsets && visualViewport
              ? visualViewport.offsetLeft
              : 0))
        / scaleX
  const y
        = (clientRect.top
            + (addVisualOffsets && visualViewport
              ? visualViewport.offsetTop
              : 0))
        / scaleY
  const width = clientRect.width / scaleX
  const height = clientRect.height / scaleY
  return {
    bottom: y + height,
    height,
    left: x,
    right: x + width,
    top: y,
    width,
    x,
    y,
  }
}
