import getUAString from '../utils/userAgent'

export default function isLayoutViewport(): boolean {
  return !/^((?!chrome|android).)*safari/i.test(getUAString())
}
