import { ActionSheetIOS } from "react-native"

import type { ClockEmployerOptionSheetItem } from "./showClockEmployerOptions.types"

export function showClockEmployerOptionsIos({
  options,
}: {
  options: ClockEmployerOptionSheetItem[]
}): Promise<string | null> {
  return new Promise((resolve) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        cancelButtonIndex: options.length,
        options: [...options.map((option) => option.title), "Cancel"],
        title: "Choose the workplace for this timer.",
      },
      (buttonIndex) => {
        const selectedOption = options[buttonIndex]
        resolve(selectedOption?.id ?? null)
      },
    )
  })
}
