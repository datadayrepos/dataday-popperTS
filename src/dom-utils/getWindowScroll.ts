import type { Window } from '../types'
import getWindow from './getWindow'

export default function getWindowScroll(node: Node | Window): {
  scrollLeft: any
  scrollTop: any
} {
  const win = getWindow(node)
  const scrollLeft = win.pageXOffset
  const scrollTop = win.pageYOffset
  return {
    scrollLeft,
    scrollTop,
  }
}
