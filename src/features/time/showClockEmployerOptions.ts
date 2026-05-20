import { Alert, Platform } from "react-native"

export interface ClockEmployerOptionSheetItem {
  description?: string
  id: string
  title: string
}

export async function showClockEmployerOptions({
  options,
}: {
  options: ClockEmployerOptionSheetItem[]
}): Promise<string | null> {
  if (options.length === 0) return null

  if (Platform.OS === "ios") {
    const { showClockEmployerOptionsIos } = await import("./showClockEmployerOptions.ios")
    return showClockEmployerOptionsIos({ options })
  }

  return new Promise((resolve) => {
    Alert.alert(
      "Start timer",
      "Choose the workplace for this timer.",
      [
        ...options.map((option) => ({
          onPress: () => resolve(option.id),
          text: option.description ? `${option.title}\n${option.description}` : option.title,
        })),
        {
          onPress: () => resolve(null),
          style: "cancel" as const,
          text: "Cancel",
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    )
  })
}
