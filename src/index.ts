// @popperjs/core 2.11.6 https://www.npmjs.com/package/@popperjs/core?activeTab=explore
// export * from './modifiers/index'

export {
  popperGenerator,
  detectOverflow,
  createPopper as createPopperBase,
} from './createPopper'

export { createPopper } from './popper'

export type { Placement } from './enums'

export type {
  Instance,
  Modifier,
  Options,
  State,
  VirtualElement,
} from './types/types'
