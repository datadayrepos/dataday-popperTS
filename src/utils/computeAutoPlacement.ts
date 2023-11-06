import {
  placements as allPlacements,
  basePlacements,
  variationPlacements,
} from '../enums.js'
import type { Padding, State } from '../types'
import type {
  Boundary,
  ComputedPlacement,
  Placement,
  RootBoundary,
} from '../enums'
import getVariation from './getVariation.js'
import detectOverflow from './detectOverflow.js'
import getBasePlacement from './getBasePlacement.js'

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
  options: Options = {},
): Array<ComputedPlacement> {
  const {
    placement,
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

  const overflows: OverflowsMap = allowedPlacements.reduce((
    acc,
    placement,
  ) => {
    acc[placement] = detectOverflow(state, {
      boundary,
      padding,
      placement,
      rootBoundary,
    })[getBasePlacement(placement)]
    return acc
  }, {})
  return Object.keys(overflows).sort((a, b) => {
    return overflows[a] - overflows[b]
  })
}
