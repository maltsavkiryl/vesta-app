// This module is the iOS-specific variant, dispatched by platform at the call
// site and imported by explicit name — renaming to .ios.ts would break the
// import on Android, so the platform-components rule is disabled here.
// eslint-disable-next-line react-native/split-platform-components
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
