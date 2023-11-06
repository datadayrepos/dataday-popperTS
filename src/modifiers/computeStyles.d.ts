import type { Modifier, Offsets, PositioningStrategy, Rect } from '../types'
import type { BasePlacement, Variation } from '../enums'

export declare type RoundOffsets = (
  offsets: Partial<{
    x: number
    y: number
    centerOffset: number
  }>
) => Offsets
export declare interface Options {
  gpuAcceleration: boolean
  adaptive: boolean
  roundOffsets?: boolean | RoundOffsets
}
export declare function mapToStyles({
  popper,
  popperRect,
  placement,
  variation,
  offsets,
  position,
  gpuAcceleration,
  adaptive,
  roundOffsets,
  isFixed,
}: {
  popper: HTMLElement
  popperRect: Rect
  placement: BasePlacement
  variation: Variation | null | undefined
  offsets: Partial<{
    x: number
    y: number
    centerOffset: number
  }>
  position: PositioningStrategy
  gpuAcceleration: boolean
  adaptive: boolean
  roundOffsets: boolean | RoundOffsets
  isFixed: boolean
}): {
  transform: string
  top: string
  right: string
  bottom: string
  left: string
  position: PositioningStrategy
}
export declare type ComputeStylesModifier = Modifier<'computeStyles', Options>
declare const _default: ComputeStylesModifier
export default _default
