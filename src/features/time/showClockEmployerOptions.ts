import { Alert, Platform } from "react-native"

import { translate } from "@/i18n/translate"

import type { ClockEmployerOptionSheetItem } from "./showClockEmployerOptions.types"

export async function showClockEmployerOptions({
  options,
}: {
  options: ClockEmployerOptionSheetItem[]
}): Promise<string | null> {
  if (options.length === 0) return null

  if (Platform.OS === "ios") {
    const { showClockEmployerOptionsIos } = await import("./showClockEmployerOptionsIos")
    return showClockEmployerOptionsIos({ options })
  }

  return new Promise((resolve) => {
    Alert.alert(
      translate("time:startTimer"),
      translate("time:chooseWorkplacePrompt"),
      [
        ...options.map((option) => ({
          onPress: () => resolve(option.id),
          text: option.description ? `${option.title}\n${option.description}` : option.title,
        })),
        {
          onPress: () => resolve(null),
          style: "cancel" as const,
          text: translate("common:actions.cancel"),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    )
  })
}
