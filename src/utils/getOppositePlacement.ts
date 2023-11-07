import type { Placement } from '../enums'

// Explicitly define the possible keys and their opposites.
const hash: { [key: string]: Placement } = {
  bottom: 'top',
  left: 'right',
  right: 'left',
  top: 'bottom',
}

function getOppositePlacement(placement: Placement): Placement {
  // Replace each matched key with its opposite from the hash.
  const oppositePlacement = placement.replace(/left|right|bottom|top/g, (matched): string => {
    // Here we assert that the matched key is indeed a key of the hash object.
    // If it's not, this is an unexpected case, and we should handle it,
    // for example, by throwing an error.
    const replacement = hash[matched]
    if (typeof replacement === 'undefined')
      throw new Error(`Unexpected placement: ${matched}`)

    return replacement
  })

  // Since we know our hash contains all the keys we are replacing,
  // and we throw an error for any unexpected values,
  // we can assert that the result is a Placement.
  return oppositePlacement as Placement
}

export default getOppositePlacement
