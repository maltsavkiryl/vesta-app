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
  const normalizeAddressPart = (value: string) => value.trim().toLocaleLowerCase()
  const parts = [streetLine, localityLine, components.name ?? components.subregion].filter(
    (value): value is string => Boolean(value?.trim()),
  )

  return parts
    .filter((part, index, values) => {
      const normalizedPart = normalizeAddressPart(part)
      return values.findIndex((candidate) => normalizeAddressPart(candidate) === normalizedPart) === index
    })
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

/**
 * Captures the proof selfie for employers that require it. Goes straight to the
 * camera — there is no "add a selfie?" interstitial, because proof is only
 * requested when the employer's `clockConfig.proofRequired` is true.
 *
 * Returns `null` when the user backs out (camera declined or shot cancelled) so
 * the caller can abort the clock-in instead of saving an unproven entry.
 */
export async function captureClockInProofPhoto(): Promise<ProofPhoto | null> {
  const permission = await requestCameraPermissionsAsync()
  if (!permission.granted) {
    Alert.alert("Camera access needed", "This workplace requires a photo to clock in.")
    return null
  }

  const result = await launchCameraAsync({
    allowsEditing: true,
    aspect: [3, 4],
    cameraType: CameraType.front,
    mediaTypes: ["images"],
    quality: 0.75,
  })

  if (result.canceled) return null
  const asset = result.assets[0]
  if (!asset) return null

  return {
    uri: asset.uri,
    capturedAt: new Date().toISOString(),
    fileName: asset.fileName ?? "clock-in-proof.jpg",
    fileSize: asset.fileSize,
    mimeType: asset.mimeType ?? "image/jpeg",
  }
}
