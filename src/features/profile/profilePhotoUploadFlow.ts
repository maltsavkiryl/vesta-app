import { Alert, type AlertButton } from "react-native"

import { translate } from "@/i18n/translate"
import { fireHaptic } from "@/utils/haptics"

type ProfilePhotoAction = "camera" | "library" | "cancel"

export type ProfilePhotoSelection = { kind: "cancelled" } | { kind: "picked"; uri: string }

function promptForProfilePhotoAction() {
  return new Promise<ProfilePhotoAction>((resolve) => {
    const options: AlertButton[] = [
      { text: translate("profile:photo.takePhoto"), onPress: () => resolve("camera") },
      { text: translate("profile:photo.choosePhoto"), onPress: () => resolve("library") },
      {
        style: "cancel" as const,
        text: translate("common:actions.cancel"),
        onPress: () => resolve("cancel"),
      },
    ]

    Alert.alert(translate("profile:photo.title"), translate("profile:photo.prompt"), options)
  })
}

async function takeProfilePhoto() {
  const ImagePicker = await import("expo-image-picker")
  const permission = await ImagePicker.requestCameraPermissionsAsync()

  if (!permission.granted) {
    Alert.alert(
      translate("profile:photo.cameraNeeded"),
      translate("profile:photo.cameraNeededBody"),
    )
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
    Alert.alert(translate("profile:photo.photoNeeded"), translate("profile:photo.photoNeededBody"))
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
    Alert.alert(translate("profile:photo.unavailable"), translate("profile:photo.devBuild"))
    return { kind: "cancelled" }
  }
}
