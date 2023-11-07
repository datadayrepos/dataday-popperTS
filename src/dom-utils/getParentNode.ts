import getNodeName from './getNodeName'
import getDocumentElement from './getDocumentElement'

// import { isShadowRoot } from './instanceOf'

function isElementLocal(node: Node | ShadowRoot): node is Element {
  return node instanceof Element
}

export function isShadowRootLocal(value: any): value is ShadowRoot {
  return value instanceof ShadowRoot
}

export default function getParentNode(element: Node | ShadowRoot): Node {
  if (getNodeName(element) === 'html')
    return element

  return (
    (isElementLocal(element) && element.assignedSlot) // step into the shadow DOM of the parent of a slotted node
      || element.parentNode // DOM Element detected
      || (isShadowRootLocal(element) ? element.host : null) // ShadowRoot detected
      || (isElementLocal(element) ? getDocumentElement(element) : document.documentElement) // fallback
  )
}
