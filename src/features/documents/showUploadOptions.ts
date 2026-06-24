import { Alert } from "react-native"

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
  Alert.alert(title, translate("documents:uploadSourcePrompt"), [
    { text: translate("documents:takePhoto"), onPress: () => onSelect("camera") },
    { text: translate("documents:browseFiles"), onPress: () => onSelect("files") },
    { style: "cancel", text: "Cancel", onPress: onCancel },
  ])
}
