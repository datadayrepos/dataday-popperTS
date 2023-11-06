import getOppositePlacement from '../utils/getOppositePlacement.js'
import getBasePlacement from '../utils/getBasePlacement.js'
import getOppositeVariationPlacement from '../utils/getOppositeVariationPlacement.js'
import detectOverflow from '../utils/detectOverflow.js'
import computeAutoPlacement from '../utils/computeAutoPlacement.js'
import { auto, bottom, left, right, start, top } from '../enums.js'
import getVariation from '../utils/getVariation.js'

import type { Boundary, Placement, RootBoundary } from '../enums'
import type { Modifier, ModifierArguments, Padding } from '../types'

export interface Options {
  mainAxis: boolean
  altAxis: boolean
  fallbackPlacements: Array<Placement>
  padding: Padding
  boundary: Boundary
  rootBoundary: RootBoundary
  altBoundary: boolean
  flipVariations: boolean
  allowedAutoPlacements: Array<Placement>
}

function getExpandedFallbackPlacements(placement: Placement): Array<Placement> {
  if (getBasePlacement(placement) === auto)
    return []

  const oppositePlacement = getOppositePlacement(placement)
  return [
    getOppositeVariationPlacement(placement),
    oppositePlacement,
    getOppositeVariationPlacement(oppositePlacement),
  ]
}

function flip({ state, options, name }: ModifierArguments<Options>) {
  if (state.modifiersData[name]._skip)
    return

  const {
    mainAxis: checkMainAxis = true,
    altAxis: checkAltAxis = true,
    fallbackPlacements: specifiedFallbackPlacements,
    padding,
    boundary,
    rootBoundary,
    altBoundary,
    flipVariations = true,
    allowedAutoPlacements,
  } = options

  const preferredPlacement = state.options.placement
  const basePlacement = getBasePlacement(preferredPlacement)
  const isBasePlacement = basePlacement === preferredPlacement

  const fallbackPlacements
    = specifiedFallbackPlacements
    || (isBasePlacement || !flipVariations
      ? [getOppositePlacement(preferredPlacement)]
      : getExpandedFallbackPlacements(preferredPlacement))

  const placements = [preferredPlacement, ...fallbackPlacements].reduce(
    (acc, placement) => {
      return acc.concat(
        getBasePlacement(placement) === auto
          ? computeAutoPlacement(state, {
            allowedAutoPlacements,
            boundary,
            flipVariations,
            padding,
            placement,
            rootBoundary,
          })
          : placement,
      )
    },
    [],
  )

  const referenceRect = state.rects.reference
  const popperRect = state.rects.popper

  const checksMap = new Map()
  let makeFallbackChecks = true
  let firstFittingPlacement = placements[0]

  for (let i = 0; i < placements.length; i++) {
    const placement = placements[i]
    const basePlacement = getBasePlacement(placement)
    const isStartVariation = getVariation(placement) === start
    const isVertical = [top, bottom].includes(basePlacement)
    const len = isVertical ? 'width' : 'height'

    const overflow = detectOverflow(state, {
      altBoundary,
      boundary,
      padding,
      placement,
      rootBoundary,
    })

    let mainVariationSide: any = isVertical
      ? isStartVariation
        ? right
        : left
      : isStartVariation
        ? bottom
        : top

    if (referenceRect[len] > popperRect[len])
      mainVariationSide = getOppositePlacement(mainVariationSide)

    const altVariationSide = getOppositePlacement(mainVariationSide)

    const checks = []

    if (checkMainAxis)
      checks.push(overflow[basePlacement] <= 0)

    if (checkAltAxis) {
      checks.push(
        overflow[mainVariationSide] <= 0,
        overflow[altVariationSide] <= 0,
      )
    }

    if (checks.every(check => check)) {
      firstFittingPlacement = placement
      makeFallbackChecks = false
      break
    }

    checksMap.set(placement, checks)
  }

  if (makeFallbackChecks) {
    // `2` may be desired in some cases – research later
    const numberOfChecks = flipVariations ? 3 : 1

    for (let i = numberOfChecks; i > 0; i--) {
      const fittingPlacement = placements.find((placement) => {
        const checks = checksMap.get(placement)
        if (checks)
          return checks.slice(0, i).every(check => check)

        return false // Explicitly return false when checks is falsy.
      })

      if (fittingPlacement) {
        firstFittingPlacement = fittingPlacement
        break
      }
    }
  }

  if (state.placement !== firstFittingPlacement) {
    state.modifiersData[name]._skip = true
    state.placement = firstFittingPlacement
    state.reset = true
  }
}

export type FlipModifier = Modifier<'flip', Options>
export default {
  data: {
    _skip: false,
  },
  enabled: true,
  fn: flip,
  name: 'flip',
  phase: 'main',
  requiresIfExists: ['offset'],
} as FlipModifier
