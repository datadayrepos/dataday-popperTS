type ExtendedNavigator = Navigator & { userAgentData?: NavigatorUAData }

interface NavigatorUAData {
  brands: Array<{ brand: string; version: string }>
  mobile: boolean
  platform: string
}

export default function getUAStrings(): string {
  const uaData = (navigator as ExtendedNavigator).userAgentData

  if (uaData?.brands) {
    return uaData.brands
      .map(item => `${item.brand}/${item.version}`)
      .join(' ')
  }

  return navigator.userAgent
}
