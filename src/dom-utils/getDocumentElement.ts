// import { isElement } from './instanceOf'

function isElementLocal(value: any): value is Element {
  return value instanceof Element
}

export default function getDocumentElement(
  element: Element | Window,
): HTMLElement {
  // $FlowFixMe[incompatible-return]: assume body is always available
  return (
    (isElementLocal(element)
      ? element.ownerDocument // $FlowFixMe[prop-missing]
      : element.document) || window.document
  ).documentElement
}
