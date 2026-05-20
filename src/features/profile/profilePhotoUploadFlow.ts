import { Alert, type AlertButton } from "react-native"

import { fireHaptic } from "@/utils/haptics"

type ProfilePhotoAction = "camera" | "library" | "cancel"

export type ProfilePhotoSelection =
  | { kind: "cancelled" }
  | { kind: "picked"; uri: string }

function promptForProfilePhotoAction() {
  return new Promise<ProfilePhotoAction>((resolve) => {
    const options: AlertButton[] = [
      { text: "Take photo", onPress: () => resolve("camera") },
      { text: "Choose photo", onPress: () => resolve("library") },
      {
        style: "cancel" as const,
        text: "Cancel",
        onPress: () => resolve("cancel"),
      },
    ]

    Alert.alert("Profile photo", "Choose how to update your profile photo.", options)
  })
}

async function takeProfilePhoto() {
  const ImagePicker = await import("expo-image-picker")
  const permission = await ImagePicker.requestCameraPermissionsAsync()

  if (!permission.granted) {
    Alert.alert("Camera access needed", "Allow camera access to take a profile photo.")
    return null
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    cameraType: ImagePicker.CameraType.front,
    mediaTypes: ["images"],
    quality: 0.8,
  })

  if (result.canceled) return null
  return result.assets[0]?.uri ?? null
}

async function chooseProfilePhoto() {
  const ImagePicker = await import("expo-image-picker")
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

  if (!permission.granted) {
    Alert.alert("Photo access needed", "Allow photo library access to choose a profile photo.")
    return null
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    mediaTypes: ["images"],
    quality: 0.8,
  })

  if (result.canceled) return null
  return result.assets[0]?.uri ?? null
}

export async function selectProfilePhoto(): Promise<ProfilePhotoSelection> {
  try {
    const action = await promptForProfilePhotoAction()

    if (action === "cancel") {
      return { kind: "cancelled" }
    }

    const uri = action === "camera" ? await takeProfilePhoto() : await chooseProfilePhoto()
    if (!uri) {
      return { kind: "cancelled" }
    }

    return {
      kind: "picked",
      uri,
    }
  } catch {
    fireHaptic("error")
    Alert.alert(
      "Photo unavailable",
      "Rebuild the development app to enable profile photo changes.",
    )
    return { kind: "cancelled" }
  }
}
