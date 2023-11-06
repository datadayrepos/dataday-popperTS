import applyStyles from './modifiers/applyStyles'
import arrow from './modifiers/arrow.js'
import computeStyles from './modifiers/computeStyles'
import eventListeners from './modifiers/eventListeners'
import flip from './modifiers/flip.js'
import hide from './modifiers/hide.js'
import offset from './modifiers/offset.js'
import { detectOverflow, popperGenerator } from './createPopper'
import popperOffsets from './modifiers/popperOffsets'
import preventOverflow from './modifiers/preventOverflow.js'

import type {
  ApplyStylesModifier,
  ArrowModifier,
  ComputeStylesModifier,
  EventListenersModifier,
  FlipModifier,
  HideModifier,
  OffsetModifier,
  PopperOffsetsModifier,
  PreventOverflowModifier,
} from './types'

// export type * from "./types";

const defaultModifiers = [
  applyStyles as ApplyStylesModifier,
  arrow as ArrowModifier,
  computeStyles as ComputeStylesModifier,
  eventListeners as EventListenersModifier,
  flip as FlipModifier,

  hide as HideModifier,
  offset as OffsetModifier,

  popperOffsets as PopperOffsetsModifier,
  preventOverflow as PreventOverflowModifier,
]

const createPopper = popperGenerator({
  defaultModifiers,
})

export { createPopper, popperGenerator, defaultModifiers, detectOverflow }

// export { createPopper as createPopperLite } from "./popper-lite.js";

export * from './modifiers'
