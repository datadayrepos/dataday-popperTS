import {
  placements as allPlacements,
  basePlacements,
  variationPlacements,
} from '../enums'
import type { Padding, State } from '../types/types'
import type {
  Boundary,
  ComputedPlacement,
  Placement,
  RootBoundary,
} from '../enums'
import getVariation from './getVariation'
import detectOverflow from './detectOverflow'
import getBasePlacement from './getBasePlacement'

type OverflowsMap = { [K in ComputedPlacement]: number }

interface Options {
  placement: Placement
  padding: Padding
  boundary: Boundary
  rootBoundary: RootBoundary
  flipVariations: boolean
  allowedAutoPlacements?: Array<Placement>
}

export default function computeAutoPlacement(
  state: Partial<State>,
  options: Partial<Options> = {},
): Array<ComputedPlacement> {
  const {
    placement = 'bottom', // default placement if undefined
    boundary,
    rootBoundary,
    padding,
    flipVariations,
    allowedAutoPlacements = allPlacements,
  } = options

  const variation = getVariation(placement)

  const placements = variation
    ? flipVariations
      ? variationPlacements
      : variationPlacements.filter((placement) => {
        return getVariation(placement) === variation
      })
    : basePlacements

  let allowedPlacements = placements.filter((placement) => {
    return allowedAutoPlacements.includes(placement)
  })

  if (allowedPlacements.length === 0) {
    allowedPlacements = placements

    if (process.env.NODE_ENV !== 'production') {
      console.error(
        [
          'Popper: The `allowedAutoPlacements` option did not allow any',
          'placements. Ensure the `placement` option matches the variation',
          'of the allowed placements.',
          'For example, "auto" cannot be used to allow "bottom-start".',
          'Use "auto-start" instead.',
        ].join(' '),
      )
    }
  } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...

  // Explicitly define the type of the accumulator
  const overflows: OverflowsMap = allowedPlacements.reduce((acc: OverflowsMap, placement) => {
    const basePlacement = getBasePlacement(placement)
    if (basePlacement in acc) {
      // @ts-expect-error unresolved
      acc[basePlacement as keyof OverflowsMap] = detectOverflow(state, {
        boundary,
        padding,
        placement,
        rootBoundary,
      })[basePlacement]
    }
    return acc
  }, {} as OverflowsMap)

  return Object.keys(overflows)
    .sort((a, b) => overflows[a as ComputedPlacement] - overflows[b as ComputedPlacement])
    .map(key => key as ComputedPlacement) // Cast each key to ComputedPlacement
}
