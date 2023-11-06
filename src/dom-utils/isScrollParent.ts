import getComputedStyle from './getComputedStyle'

export default function isScrollParent(element: HTMLElement): boolean {
  // Firefox wants us to check `-x` and `-y` variations as well
  const _getComputedStyle = getComputedStyle(element)
  const overflow = _getComputedStyle.overflow
  const overflowX = _getComputedStyle.overflowX
  const overflowY = _getComputedStyle.overflowY

  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX)
}
