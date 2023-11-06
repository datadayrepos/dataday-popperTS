import { VisualViewport } from '../types'
import type { Window } from '../types'
import getScrollParent from './getScrollParent'
import getParentNode from './getParentNode'
import getWindow from './getWindow'
import isScrollParent from './isScrollParent'

/*
given a DOM element, return the list of all scroll parents, up the list of ancesors
until we get to the top window object. This list is what we attach scroll listeners
to, because if any of these parent elements scroll, we'll need to re-calculate the
reference element's position.
*/

function concatFilterViewport(
  list: Array<Element | Window>,
  target: Node | ShadowRoot | Array<Element | Window | VisualViewport>,
): Array<Element | Window> {
  const filteredTarget = Array.isArray(target)
    ? target.filter(
      (item): item is Element | Window =>
        !(item instanceof VisualViewport),
    )
    : [target as Element | Window]
  return list.concat(filteredTarget)
}

export default function listScrollParents(
  element: Node,
  list?: Array<Element | Window>,
): Array<Element | Window> {
  let _element$ownerDocumen

  if (list === void 0)
    list = []

  const scrollParent = getScrollParent(element)
  const isBody
        = scrollParent
        === ((_element$ownerDocumen = element.ownerDocument) == null
          ? void 0
          : _element$ownerDocumen.body)

  const win = getWindow(scrollParent)
  const target: Node | ShadowRoot | Array<Element | Window | VisualViewport>
        = isBody
          ? [win].concat(
              win.visualViewport || [],
              isScrollParent(scrollParent) ? scrollParent : [],
            )
          : scrollParent

  // const updatedList = list.concat(target)

  const updatedList = concatFilterViewport(list, target)

  return isBody
    ? updatedList // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    : updatedList.concat(
      listScrollParents(getParentNode(target as Node | ShadowRoot)),
    )
}
