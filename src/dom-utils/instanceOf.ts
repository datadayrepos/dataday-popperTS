import getWindow from './getWindow'

function isElement(node: unknown): node is Element {
  const OwnElement = getWindow(node).Element
  return node instanceof OwnElement || node instanceof Element
}

function isHTMLElement(node: unknown): node is HTMLElement {
  const OwnElement = getWindow(node).HTMLElement
  return node instanceof OwnElement || node instanceof HTMLElement
}

function isShadowRoot(node: unknown): boolean {
  // IE 11 has no ShadowRoot
  if (typeof ShadowRoot === 'undefined')
    return false

  const OwnElement = getWindow(node).ShadowRoot
  return node instanceof OwnElement || node instanceof ShadowRoot
}

export function isNode(value: any): value is Node {
  return value instanceof Node
}

export { isElement, isHTMLElement, isShadowRoot }
