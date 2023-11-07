import type { ClientRectObject, Rect } from '../types/types'

export default function rectToClientRect(rect: Rect): ClientRectObject {
  return Object.assign({}, rect, {
    bottom: rect.y + rect.height,
    left: rect.x,
    right: rect.x + rect.width,
    top: rect.y,
  })
}
