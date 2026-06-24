import { ActionSheetIOS } from "react-native"

import { translate } from "@/i18n/translate"

export type UploadSource = "camera" | "files"

export function showNativeUploadOptions({
  onCancel,
  onSelect,
  title,
}: {
  onCancel?: () => void
  onSelect: (source: UploadSource) => void
  title: string
}) {
  ActionSheetIOS.showActionSheetWithOptions(
    {
      cancelButtonIndex: 2,
      options: [
        translate("documents:takePhoto"),
        translate("documents:browseFiles"),
        translate("common:actions.cancel"),
      ],
      title,
    },
    (buttonIndex) => {
      if (buttonIndex === 0) onSelect("camera")
      if (buttonIndex === 1) onSelect("files")
      if (buttonIndex === 2) onCancel?.()
    },
  )
}
