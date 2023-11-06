import type { SideObject } from '../types'

export default function getFreshSideObject(): SideObject {
  return {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  }
}
