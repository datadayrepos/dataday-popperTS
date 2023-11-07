import getWindow from '../dom-utils/getWindow'

import type { Modifier, ModifierArguments } from '../types/types'

export interface Options {
  scroll: boolean
  resize: boolean
}

const passive = {
  passive: true,
}

function effect({ state, instance, options }: ModifierArguments<Options>) {
  const { scroll = true, resize = true } = options

  const window = getWindow(state.elements.popper)

  const scrollParents = [
    ...state.scrollParents.reference,
    ...state.scrollParents.popper,
  ]

  if (scroll) {
    scrollParents.forEach((scrollParent) => {
      scrollParent.addEventListener('scroll', instance.update, passive)
    })
  }

  if (resize)
    window.addEventListener('resize', instance.update, passive)

  return function () {
    if (scroll) {
      scrollParents.forEach((scrollParent) => {
        scrollParent.removeEventListener(
          'scroll',
          instance.update,
          passive.passive,
        )
      })
    }

    if (resize)
      window.removeEventListener('resize', instance.update, passive)
  }
}

export type EventListenersModifier = Modifier<'eventListeners', Options>
export default {
  data: {},
  effect,
  enabled: true,
  fn: () => {},
  name: 'eventListeners',
  phase: 'write',
} as EventListenersModifier
