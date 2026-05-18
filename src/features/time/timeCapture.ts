import { Alert } from "react-native"

import type { LocationSnapshot, ProofPhoto } from "@/core/models"

function buildAddressLabel(components: {
  city?: string | null
  district?: string | null
  name?: string | null
  postalCode?: string | null
  street?: string | null
  streetNumber?: string | null
  subregion?: string | null
}) {
  const streetLine = [components.street, components.streetNumber].filter(Boolean).join(" ").trim()
  const localityLine = [components.postalCode, components.city ?? components.district]
    .filter(Boolean)
    .join(" ")
    .trim()
  return [streetLine, localityLine, components.name ?? components.subregion]
    .filter(Boolean)
    .join(", ")
}

export async function captureLocationSnapshot(
  fallbackAddress: string,
): Promise<LocationSnapshot | undefined> {
  const Location = await import("expo-location")
  const permission = await Location.requestForegroundPermissionsAsync()

  if (!permission.granted) {
    Alert.alert("Location not shared", "The entry will still be saved without a map snapshot.")
    return undefined
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })
    let addressLabel = fallbackAddress

    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
      const firstMatch = reverseGeocode[0]
      if (firstMatch) {
        addressLabel = buildAddressLabel(firstMatch) || fallbackAddress
      }
    } catch {}

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      addressLabel,
      accuracyMeters: position.coords.accuracy ?? undefined,
    }
  } catch {
    Alert.alert("Location unavailable", "We couldn't capture your location for this event.")
    return undefined
  }
}

function promptForClockInPhoto() {
  return new Promise<"photo" | "skip" | "cancel">((resolve) => {
    Alert.alert("Clock-in proof photo", "Add an optional selfie for your check-in proof?", [
      { text: "Cancel", style: "cancel", onPress: () => resolve("cancel") },
      { text: "Skip", onPress: () => resolve("skip") },
      { text: "Take selfie", onPress: () => resolve("photo") },
    ])
  })
}

export async function captureOptionalClockInPhoto(): Promise<ProofPhoto | undefined | null> {
  const nextAction = await promptForClockInPhoto()
  if (nextAction === "cancel") return null
  if (nextAction === "skip") return undefined

  const ImagePicker = await import("expo-image-picker")
  const permission = await ImagePicker.requestCameraPermissionsAsync()
  if (!permission.granted) {
    Alert.alert("Camera access needed", "Allow camera access to capture a clock-in selfie.")
    return undefined
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [3, 4],
    cameraType: ImagePicker.CameraType.front,
    mediaTypes: ["images"],
    quality: 0.75,
  })

  if (result.canceled) return undefined
  const asset = result.assets[0]
  if (!asset) return undefined

  return {
    uri: asset.uri,
    capturedAt: new Date().toISOString(),
    fileName: asset.fileName ?? "clock-in-proof.jpg",
    fileSize: asset.fileSize,
    mimeType: asset.mimeType ?? "image/jpeg",
  }
}
