export const top = 'top' as const
export const bottom = 'bottom' as const
export const right = 'right' as const
export const left = 'left' as const
export const auto = 'auto' as const

export type BasePlacement =
    | typeof top
    | typeof bottom
    | typeof right
    | typeof left

export const basePlacements: Array<BasePlacement> = [top, bottom, right, left]

export const start = 'start' as const
export const end = 'end' as const
export type Variation = typeof start | typeof end

export const clippingParents = 'clippingParents' as const
export const viewport = 'viewport' as const
export type Boundary = Element | Array<Element> | typeof clippingParents
export type RootBoundary = typeof viewport | 'document'

export const popper = 'popper' as const
export const reference = 'reference' as const
export type Context = typeof popper | typeof reference

export type VariationPlacement =
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'right-start'
    | 'right-end'
    | 'left-start'
    | 'left-end'

export type AutoPlacement = 'auto' | 'auto-start' | 'auto-end'
export type ComputedPlacement = VariationPlacement | BasePlacement
export type Placement = AutoPlacement | BasePlacement | VariationPlacement

export const variationPlacements: Array<VariationPlacement>
/* #__PURE__ */ = basePlacements.reduce((
  acc: Array<VariationPlacement>,
  placement: BasePlacement,
) => {
  return acc.concat([
    `${placement}-${start}`,
    `${placement}-${end}`,
  ]) as VariationPlacement[]
}, [])

export const placements: Array<Placement> = [...basePlacements, auto].reduce(
  (
    acc: Array<Placement>,
    placement: BasePlacement | typeof auto,
  ): Array<Placement> =>
    acc.concat([placement, `${placement}-${start}`, `${placement}-${end}`]),
  [],
)

export const beforeRead = 'beforeRead' as const
export const read = 'read' as const
export const afterRead = 'afterRead' as const
// pure-logic modifiers
export const beforeMain = 'beforeMain' as const
export const main = 'main' as const
export const afterMain = 'afterMain' as const
// modifier with the purpose to write to the DOM (or write into a framework state)
export const beforeWrite = 'beforeWrite' as const
export const write = 'write' as const
export const afterWrite = 'afterWrite' as const

export const modifierPhases: Array<ModifierPhases> = [
  beforeRead,
  read,
  afterRead,
  beforeMain,
  main,
  afterMain,
  beforeWrite,
  write,
  afterWrite,
]

export type ModifierPhases =
    | typeof beforeRead
    | typeof read
    | typeof afterRead
    | typeof beforeMain
    | typeof main
    | typeof afterMain
    | typeof beforeWrite
    | typeof write
    | typeof afterWrite
