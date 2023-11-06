import type { Window } from '../types'
import { isNode } from './instanceOf'

export default function getNodeName(
  element: (Node | null | undefined) | Window,
): string | null | undefined {
  if (isNode(element))
    return element.nodeName.toLowerCase()

  return null
}
