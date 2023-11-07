import type { Padding, PositioningStrategy, SideObject, State } from '../types/types'
import type { Boundary, Context, Placement, RootBoundary } from '../enums'

export declare interface Options {
  placement: Placement
  strategy: PositioningStrategy
  boundary: Boundary
  rootBoundary: RootBoundary
  elementContext: Context
  altBoundary: boolean
  padding: Padding
}
export default function detectOverflow(
  state: State,
  options?: Partial<Options>
): SideObject
