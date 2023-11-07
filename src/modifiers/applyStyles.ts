import getNodeName from '../dom-utils/getNodeName'
import { isHTMLElement } from '../dom-utils/instanceOf'

import type { Modifier, ModifierArguments, State, VirtualElement } from '../types/types'

// This modifier takes the styles prepared by the `computeStyles` modifier
// and applies them to the HTMLElements such as popper and arrow
function applyStyles({ state }: ModifierArguments<State>) {
  Object.keys(state.elements).forEach((name) => {
    const style = state.styles[name] || {}
    const attributes = state.attributes[name] || {}

    const element = state.elements[name as keyof typeof state.elements] as HTMLElement | undefined

    if (!isHTMLElement(element) || !getNodeName(element))
      return

    // Flow doesn't support to extend this property, but it's the most
    // effective way to apply styles to an HTMLElement
    // $FlowFixMe[cannot-write]
    Object.assign(element.style, style)
    Object.keys(attributes).forEach((name) => {
      const value = attributes[name]

      if (value === false)
        element.removeAttribute(name)
      else
        element.setAttribute(name, value === true ? '' : value)
    })
  })
}

// eslint-disable-next-line ts/consistent-type-definitions
type StyleObject = { [key: string]: string }

function effect({ state }: ModifierArguments<State>) {
  const initialStyles: { [key: string]: any } = {
    arrow: {
      position: 'absolute',
    },
    popper: {
      left: '0',
      margin: '0',
      position: state.options.strategy,
      top: '0',
    },
    reference: {},
  }

  Object.assign(state.elements.popper.style, initialStyles.popper)
  state.styles = initialStyles

  if (state.elements.arrow)
    Object.assign(state.elements.arrow.style, initialStyles.arrow)

  return function () {
    Object.keys(state.elements).forEach((name) => {
      const element = state.elements[name as keyof typeof state.elements] as HTMLElement | undefined
      const attributes = state.attributes[name] || {}
      const styleProperties = Object.keys(
        Object.prototype.hasOwnProperty.call(state.styles, name)
          ? state.styles[name]
          : initialStyles[name],
      ) // Set all values to an empty string to unset them

      // Ensure that the empty object has a string index signature.
      // Define a type for the style object with a string index signature

      const style: StyleObject = styleProperties.reduce((acc: StyleObject, property: string) => {
        acc[property] = ''
        return acc
      }, {} as StyleObject) // Cast the initial value to StyleObject

      if (!isHTMLElement(element) || !getNodeName(element))
        return

      Object.assign(element.style, style)
      Object.keys(attributes).forEach((attribute) => {
        element.removeAttribute(attribute)
      })
    })
  }
}

export type ApplyStylesModifier = Modifier<'applyStyles', object>
export default {
  effect,
  enabled: true,
  fn: applyStyles,
  name: 'applyStyles',
  phase: 'write',
  requires: ['computeStyles'],
} as ApplyStylesModifier
