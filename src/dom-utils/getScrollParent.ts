import getParentNode from './getParentNode'
import isScrollParent from './isScrollParent'
import getNodeName from './getNodeName'
import { isHTMLElement } from './instanceOf'

export default function getScrollParent(node: Node): HTMLElement {
  if (['html', 'body', '#document'].includes(getNodeName(node) ?? '')) {
    // $FlowFixMe[incompatible-return]: assume body is always available
    // This will return body and type safe but be sure that body is always available
    // or handle it appropriately
    return node.ownerDocument!.body
  }

  if (isHTMLElement(node) && isScrollParent(node))
    return node

  return getScrollParent(getParentNode(node))
}
