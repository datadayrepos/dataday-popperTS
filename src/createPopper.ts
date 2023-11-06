import getCompositeRect from './dom-utils/getCompositeRect.js'
import getLayoutRect from './dom-utils/getLayoutRect.js'
import listScrollParents from './dom-utils/listScrollParents.js'
import getOffsetParent from './dom-utils/getOffsetParent.js'
import getComputedStyle from './dom-utils/getComputedStyle.js'
import orderModifiers from './utils/orderModifiers.js'
import debounce from './utils/debounce.js'
import validateModifiers from './utils/validateModifiers.js'
import uniqueBy from './utils/uniqueBy.js'
import getBasePlacement from './utils/getBasePlacement.js'
import mergeByName from './utils/mergeByName.js'
import detectOverflow from './utils/detectOverflow.js'
import { isElement } from './dom-utils/instanceOf.js'
import { auto } from './enums.js'

import type {
  Instance,
  Modifier,
  OptionsGeneric,
  State,
  VirtualElement,
} from './types'

interface PopperGeneratorArgs {
  defaultModifiers?: Array<Modifier<any, any>>
  defaultOptions?: Partial<OptionsGeneric<any>>
}

const INVALID_ELEMENT_ERROR
  = 'Popper: Invalid reference or popper argument provided. They must be either a DOM element or virtual element.'
const INFINITE_LOOP_ERROR
  = 'Popper: An infinite loop in the modifiers cycle has been detected! The cycle has been interrupted to prevent a browser crash.'

const DEFAULT_OPTIONS: OptionsGeneric<any> = {
  modifiers: [],
  placement: 'bottom',
  strategy: 'absolute',
}

function areValidElements(...args: Array<any>): boolean {
  return !args.some(
    element =>
      !(element && typeof element.getBoundingClientRect === 'function'),
  )
}

export function popperGenerator(generatorOptions: PopperGeneratorArgs = {}) {
  const { defaultModifiers = [], defaultOptions = DEFAULT_OPTIONS }
    = generatorOptions

  return function createPopper<TModifier extends Partial<Modifier<any, any>>>(
    reference: Element | VirtualElement,
    popper: HTMLElement,
    options: Partial<OptionsGeneric<TModifier>> = defaultOptions,
  ): Instance {
    let state: Partial<State> = {
      attributes: {},
      elements: {
        popper,
        reference,
      },
      modifiersData: {},
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
      orderedModifiers: [],
      placement: 'bottom',
      styles: {},
    }

    let effectCleanupFns: Array<() => void> = []
    let isDestroyed = false

    const instance = {
      destroy: function destroy() {
        cleanupModifierEffects()
        isDestroyed = true
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function forceUpdate() {
        if (isDestroyed)
          return

        const reference = state.elements?.reference
        const popper = state.elements?.popper

        // Don't proceed if `reference` or `popper` are not valid elements
        // anymore

        if (!areValidElements(reference, popper)) {
          if (process.env.NODE_ENV !== 'production')
            console.error(INVALID_ELEMENT_ERROR)

          return
        } // Store the reference and popper rects to be read by modifiers

        state.rects = {
          popper: getLayoutRect(popper),
          reference: getCompositeRect(
            reference,
            getOffsetParent(popper),
            state.options?.strategy === 'fixed',
          ),
        }

        // Modifiers have the ability to reset the current update cycle. The
        // most common use case for this is the `flip` modifier changing the
        // placement, which then needs to re-run all the modifiers, because the
        // logic was previously ran for the previous placement and is therefore
        // stale/incorrect
        state.reset = false
        state.placement = state.options?.placement

        // On each update cycle, the `modifiersData` property for each modifier
        // is filled with the initial data specified by the modifier. This means
        // it doesn't persist and is fresh on each update.
        // To ensure persistent data, use `${name}#persistent`
        state.orderedModifiers?.forEach(
          modifier =>
            (state.modifiersData[modifier.name] = {
              ...modifier.data,
            }),
        )

        let __debug_loops__ = 0

        for (
          let index = 0;
          index < state.orderedModifiers.length;
          index++
        ) {
          if (process.env.NODE_ENV !== 'production') {
            __debug_loops__ += 1

            if (__debug_loops__ > 100) {
              console.error(INFINITE_LOOP_ERROR)
              break
            }
          }

          if (state.reset === true) {
            state.reset = false
            index = -1
            continue
          }

          const {
            fn,
            options = {},
            name,
          } = state.orderedModifiers[index]

          if (typeof fn === 'function')
            state = fn({ instance, name, options, state }) || state
        }
      },
      setOptions: function setOptions(setOptionsAction) {
        const options
          = typeof setOptionsAction === 'function'
            ? setOptionsAction(state.options)
            : setOptionsAction

        cleanupModifierEffects()

        state.options = Object.assign(
          {},
          defaultOptions,
          state.options,
          options,
        )

        state.scrollParents = {
          popper: listScrollParents(popper),
          reference: isElement(reference)
            ? listScrollParents(reference)
            : reference.contextElement
              ? listScrollParents(reference.contextElement)
              : [],
        }

        // Orders the modifiers based on their dependencies and `phase`
        // properties
        const orderedModifiers = orderModifiers(
          mergeByName([
            ...defaultModifiers,
            ...state.options.modifiers,
          ]),
        )

        // Strip out disabled modifiers
        state.orderedModifiers = orderedModifiers.filter(
          m => m.enabled,
        )

        // Validate the provided modifiers so that the consumer will get warned
        // if one of the modifiers is invalid for any reason
        if (process.env.NODE_ENV !== 'production') {
          const modifiers = uniqueBy(
            [...orderedModifiers, ...state.options.modifiers],
            ({ name }) => name,
          )
          validateModifiers(modifiers)

          if (getBasePlacement(state.options.placement) === auto) {
            const flipModifier = state.orderedModifiers.find(
              (_ref2) => {
                const name = _ref2.name
                return name === 'flip'
              },
            )

            if (!flipModifier) {
              console.error(
                [
                  'Popper: "auto" placements require the "flip" modifier be',
                  'present and enabled to work.',
                ].join(' '),
              )
            }
          }

          const { marginTop, marginRight, marginBottom, marginLeft }
            = getComputedStyle(popper)

          // We no longer take into account `margins` on the popper, and it can
          // cause bugs with positioning, so we'll warn the consumer

          if (
            [marginTop, marginRight, marginBottom, marginLeft].some(
              (margin) => {
                return Number.parseFloat(margin)
              },
            )
          ) {
            console.warn(
              [
                'Popper: CSS "margin" styles cannot be used to apply padding',
                'between the popper and its reference element or boundary.',
                'To replicate margin, use the `offset` modifier, as well as',
                'the `padding` option in the `preventOverflow` and `flip`',
                'modifiers.',
              ].join(' '),
            )
          }
        }

        runModifierEffects()
        return instance.update()
      },
      state,

      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)

      update: debounce(() => {
        return new Promise((resolve) => {
          instance.forceUpdate()
          resolve(state)
        })
      }),
    }

    if (!areValidElements(reference, popper)) {
      if (process.env.NODE_ENV !== 'production')
        console.error(INVALID_ELEMENT_ERROR)

      return instance
    }

    instance.setOptions(options).then((state) => {
      if (!isDestroyed && options.onFirstUpdate)
        options.onFirstUpdate(state)
    })

    // Modifiers have the ability to execute arbitrary code before the first
    // update cycle runs. They will be executed in the same order as the update
    // cycle. This is useful when a modifier adds some persistent data that
    // other modifiers need to use, but the modifier is run after the dependent
    // one.
    function runModifierEffects() {
      state.orderedModifiers?.forEach(({
        name,
        options = {},
        effect,
      }) => {
        if (typeof effect === 'function') {
          const cleanupFn = effect({
            instance,
            name,
            options,
            state,
          })

          const noopFn = function noopFn() { }

          effectCleanupFns.push(cleanupFn || noopFn)
        }
      })
    }

    function cleanupModifierEffects() {
      effectCleanupFns.forEach((fn) => {
        return fn()
      })
      effectCleanupFns = []
    }

    return instance
  }
}
export const createPopper = popperGenerator()

export { detectOverflow }
