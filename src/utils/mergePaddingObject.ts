import type { SideObject } from '../types/types'
import getFreshSideObject from './getFreshSideObject'

export default function mergePaddingObject(
  paddingObject: Partial<SideObject>,
): SideObject {
  return Object.assign({}, getFreshSideObject(), paddingObject)
}
