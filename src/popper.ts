import applyStyles from './modifiers/applyStyles'
import arrow from './modifiers/arrow'
import computeStyles from './modifiers/computeStyles'
import eventListeners from './modifiers/eventListeners'
import flip from './modifiers/flip'
import hide from './modifiers/hide'
import offset from './modifiers/offset'
import { detectOverflow, popperGenerator } from './createPopper'
import popperOffsets from './modifiers/popperOffsets'
import preventOverflow from './modifiers/preventOverflow'

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
} from './types/types'

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

// export { createPopper as createPopperLite } from "./popper-lite";

export * from './modifiers'
