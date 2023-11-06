import type { SideObject } from '../types'
import getFreshSideObject from './getFreshSideObject.js'

export default function mergePaddingObject(
  paddingObject: Partial<SideObject>,
): SideObject {
  return Object.assign({}, getFreshSideObject(), paddingObject)
}
