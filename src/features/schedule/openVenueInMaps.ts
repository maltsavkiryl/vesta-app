import { Alert, Linking, Platform } from "react-native"

export function getVenueMapUrl(address: string, platformName = Platform.OS) {
  const encodedAddress = encodeURIComponent(address)

  if (platformName === "ios") {
    return `http://maps.apple.com/?q=${encodedAddress}`
  }

  return `geo:0,0?q=${encodedAddress}`
}

type OpenVenueInMapsDependencies = {
  canOpenURL?: typeof Linking.canOpenURL
  openURL?: typeof Linking.openURL
  platformName?: typeof Platform.OS
  showAlert?: typeof Alert.alert
}

export async function openVenueInMaps(
  address: string,
  {
    canOpenURL = Linking.canOpenURL,
    openURL = Linking.openURL,
    platformName = Platform.OS,
    showAlert = Alert.alert,
  }: OpenVenueInMapsDependencies = {},
) {
  const mapUrl = getVenueMapUrl(address, platformName)

  try {
    if (await canOpenURL(mapUrl)) {
      await openURL(mapUrl)
      return true
    }
  } catch {}

  showAlert("Maps unavailable", "Set up a maps app on this device to open the shift location.")
  return false
}
