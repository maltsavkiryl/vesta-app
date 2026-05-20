import { Alert, Linking, Platform } from "react-native"

export function getVenueMapUrl(address: string, platformName = Platform.OS) {
  const encodedAddress = encodeURIComponent(address)

  if (platformName === "ios") {
    return `http://maps.apple.com/?q=${encodedAddress}`
  }

  return `geo:0,0?q=${encodedAddress}`
}

export async function openVenueInMaps(address: string) {
  const mapUrl = getVenueMapUrl(address)

  try {
    if (await Linking.canOpenURL(mapUrl)) {
      await Linking.openURL(mapUrl)
      return true
    }
  } catch {}

  Alert.alert("Maps unavailable", "Set up a maps app on this device to open the shift location.")
  return false
}
