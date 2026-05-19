import { Platform } from "react-native"
import * as Haptics from "expo-haptics"

export type AppHapticIntent = "selection" | "tab" | "toggle" | "success" | "warning" | "error"
export type PressHapticIntent = "selection" | "toggle"

function isHapticsSupported() {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return false
  }

  return process.env.NODE_ENV !== "test"
}

export async function triggerHaptic(intent: AppHapticIntent) {
  if (!isHapticsSupported()) {
    return
  }

  try {
    switch (intent) {
      case "selection":
      case "tab":
        await Haptics.selectionAsync()
        return
      case "toggle":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        return
      case "success":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        return
      case "warning":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        return
      case "error":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        return
    }
  } catch {
    // Haptics should never block the action that triggered them.
  }
}

export function fireHaptic(intent: AppHapticIntent) {
  void triggerHaptic(intent)
}

export function firePressHaptic(intent: PressHapticIntent | "none" | undefined) {
  if (!intent || intent === "none") {
    return
  }

  fireHaptic(intent)
}
