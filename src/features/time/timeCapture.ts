import { Alert } from "react-native"
import { CameraType, launchCameraAsync, requestCameraPermissionsAsync } from "expo-image-picker"
import {
  Accuracy,
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
  reverseGeocodeAsync,
} from "expo-location"

import type { LocationSnapshot, ProofPhoto } from "@/core/models"

export function buildAddressLabel(components: {
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

export function buildCoordinateLabel(latitude: number, longitude: number) {
  return `Captured at ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

export async function captureLocationSnapshot(): Promise<LocationSnapshot | undefined> {
  const permission = await requestForegroundPermissionsAsync()

  if (!permission.granted) {
    Alert.alert("Location not shared", "The entry will still be saved without a map snapshot.")
    return undefined
  }

  try {
    const position = await getCurrentPositionAsync({
      accuracy: Accuracy.Balanced,
    })
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude
    let addressLabel = buildCoordinateLabel(latitude, longitude)

    try {
      const reverseGeocode = await reverseGeocodeAsync({
        latitude,
        longitude,
      })
      const firstMatch = reverseGeocode[0]
      if (firstMatch) {
        addressLabel = buildAddressLabel(firstMatch) || addressLabel
      }
    } catch {}

    return {
      latitude,
      longitude,
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

  const permission = await requestCameraPermissionsAsync()
  if (!permission.granted) {
    Alert.alert("Camera access needed", "Allow camera access to capture a clock-in selfie.")
    return undefined
  }

  const result = await launchCameraAsync({
    allowsEditing: true,
    aspect: [3, 4],
    cameraType: CameraType.front,
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
