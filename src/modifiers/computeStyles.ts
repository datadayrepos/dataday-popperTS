import type { BasePlacement, Placement, Variation } from '../enums'
import { bottom, end, left, right, top } from '../enums'
import getOffsetParent from '../dom-utils/getOffsetParent'
import getWindow from '../dom-utils/getWindow'
import getDocumentElement from '../dom-utils/getDocumentElement'
import getComputedStyle from '../dom-utils/getComputedStyle'
import getBasePlacement from '../utils/getBasePlacement'
import getVariation from '../utils/getVariation'
import { round } from '../utils/math'

import type {
  Modifier,
  Offsets,
  State,
} from '../types/types'

export type RoundOffsets = (
  offsets: Partial<{
    x: number
    y: number
    centerOffset: number
  }>
) => Offsets

interface Options {
  gpuAcceleration: boolean
  adaptive: boolean
  roundOffsets?: boolean | RoundOffsets
}

const unsetSides = {
  bottom: 'auto',
  left: 'auto',
  right: 'auto',
  top: 'auto',
}

// Round the offsets to the nearest suitable subpixel based on the DPR.
// Zooming can change the DPR, but it seems to report a value that will
// cleanly divide the values into the appropriate subpixels.
function roundOffsetsByDPR({ x, y }: { x: number; y: number }): Offsets {
  const win = window
  const dpr = win.devicePixelRatio || 1
  return {
    x: round(x * dpr) / dpr || 0,
    y: round(y * dpr) / dpr || 0,
  }
}

type StyleSides = 'top' | 'right' | 'bottom' | 'left'

// Mapped type for the sides
interface StyleProperties {
  position?: string
  transform?: string
}

// Extend the mapped type with additional properties
type Styles = {
  [key in StyleSides]?: string;
} & StyleProperties

export function mapToStyles(_ref2: { gpuAcceleration: any; isFixed: boolean; placement: BasePlacement; popper: any; popperRect: any; variation: Variation | null | undefined } & { adaptive: any; offsets: any; position: any; roundOffsets: any }) {
  let _Object$assign2: Partial<Styles> = {}

  const popper = _ref2.popper
  const popperRect = _ref2.popperRect
  const placement = _ref2.placement
  const variation = _ref2.variation
  const offsets = _ref2.offsets
  const position = _ref2.position
  const gpuAcceleration = _ref2.gpuAcceleration
  const adaptive = _ref2.adaptive
  const roundOffsets = _ref2.roundOffsets
  const isFixed = _ref2.isFixed
  const _offsets$x = offsets.x
  let x = _offsets$x === undefined ? 0 : _offsets$x
  const _offsets$y = offsets.y
  let y = _offsets$y === undefined ? 0 : _offsets$y

  const _ref3
    = typeof roundOffsets === 'function'
      ? roundOffsets({
        x,
        y,
      })
      : {
          x,
          y,
        }

  x = _ref3.x
  y = _ref3.y
  const hasX = Object.prototype.hasOwnProperty.call(offsets, 'x')
  const hasY = Object.prototype.hasOwnProperty.call(offsets, 'y')

  let sideX: 'left' | 'right' = 'left'
  let sideY: 'top' | 'bottom' = 'top'
  const win = window

  if (adaptive) {
    let offsetParent = getOffsetParent(popper)
    let heightProp = 'clientHeight'
    let widthProp = 'clientWidth'

    if (offsetParent === getWindow(popper)) {
      offsetParent = getDocumentElement(popper)

      if (
        getComputedStyle(offsetParent).position !== 'static'
        && position === 'absolute'
      ) {
        heightProp = 'scrollHeight'
        widthProp = 'scrollWidth'
      }
    } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it

    // offsetParent = offsetParent

    if (
      placement === top
      || ((placement === left || placement === right) && variation === end)
    ) {
      sideY = bottom
      const offsetY
        = isFixed && offsetParent === win && win.visualViewport
          ? win.visualViewport.height // $FlowFixMe[prop-missing]
          : offsetParent[heightProp]
      y -= offsetY - popperRect.height
      y *= gpuAcceleration ? 1 : -1
    }

    if (
      placement === left
      || ((placement === top || placement === bottom) && variation === end)
    ) {
      sideX = right
      const offsetX
        = isFixed && offsetParent === win && win.visualViewport
          ? win.visualViewport.width // $FlowFixMe[prop-missing]
          : offsetParent[widthProp]
      x -= offsetX - popperRect.width
      x *= gpuAcceleration ? 1 : -1
    }
  }

  const commonStyles: Styles = Object.assign(
    {
      position,
    },
    adaptive && unsetSides,
  )

  const _ref4
    = roundOffsets === true
      ? roundOffsetsByDPR({
        x,
        y,
      })
      : {
          x,
          y,
        }

  x = _ref4.x
  y = _ref4.y

  if (gpuAcceleration) {
    let _Object$assign: Partial<Styles> = {}

    return Object.assign(
      {},
      commonStyles,
      ((_Object$assign = {}),
      (_Object$assign[sideY] = hasY ? '0' : ''),
      (_Object$assign[sideX] = hasX ? '0' : ''),
      (_Object$assign.transform
        = (win.devicePixelRatio || 1) <= 1
          ? `translate(${x}px, ${y}px)`
          : `translate3d(${x}px, ${y}px, 0)`),
      _Object$assign),
    )
  }

  return Object.assign(
    {},
    commonStyles,
    ((_Object$assign2 = {}),
    (_Object$assign2[sideY] = hasY ? `${y}px` : ''),
    (_Object$assign2[sideX] = hasX ? `${x}px` : ''),
    (_Object$assign2.transform = ''),
    _Object$assign2),
  )
}

function computeStyles(_ref5: { state: State; options: Options }) {
  const state = _ref5.state
  const options = _ref5.options
  const _options$gpuAccelerat = options.gpuAcceleration
  const gpuAcceleration
      = _options$gpuAccelerat === undefined ? true : _options$gpuAccelerat
  const _options$adaptive = options.adaptive
  const adaptive = _options$adaptive === undefined ? true : _options$adaptive
  const _options$roundOffsets = options.roundOffsets
  const roundOffsets
      = _options$roundOffsets === undefined ? true : _options$roundOffsets

  if (process.env.NODE_ENV !== 'production') {
    const transitionProperty
      = getComputedStyle(state.elements.popper).transitionProperty || ''

    if (
      adaptive
      && ['transform', 'top', 'right', 'bottom', 'left'].some((property) => {
        return transitionProperty.includes(property)
      })
    ) {
      console.warn(
        [
          'Popper: Detected CSS transitions on at least one of the following',
          'CSS properties: "transform", "top", "right", "bottom", "left".',
          '\n\n',
          'Disable the "computeStyles" modifier\'s `adaptive` option to allow',
          'for smooth transitions, or remove these properties from the CSS',
          'transition declaration on the popper element if only transitioning',
          'opacity or background-color for example.',
          '\n\n',
          'We recommend using the popper element as a wrapper around an inner',
          'element that can have any CSS property transitioned for animations.',
        ].join(' '),
      )
    }
  }

  const basePlacement = getBasePlacement(state.placement) as BasePlacement

  const commonStyles = {
    gpuAcceleration,
    isFixed: state.options.strategy === 'fixed',
    placement: basePlacement,
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    variation: getVariation(state.placement),
  }

  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign(
      {},
      state.styles.popper,
      mapToStyles(
        Object.assign({}, commonStyles, {
          adaptive,
          offsets: state.modifiersData.popperOffsets,
          position: state.options.strategy,
          roundOffsets,
        }),
      ),
    )
  }

  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign(
      {},
      state.styles.arrow,
      mapToStyles(
        Object.assign({}, commonStyles, {
          adaptive: false,
          offsets: state.modifiersData.arrow,
          position: 'absolute',
          roundOffsets,
        }),
      ),
    )
  }

  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    'data-popper-placement': state.placement,
  })
}

export type ComputeStylesModifier = Modifier<'computeStyles', Options>

export default {
  data: {},
  enabled: true,
  fn: computeStyles,
  name: 'computeStyles',
  phase: 'beforeWrite',
} as ComputeStylesModifier
