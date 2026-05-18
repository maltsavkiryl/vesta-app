import { Alert } from "react-native"

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
  Alert.alert(title, "Choose an upload source.", [
    { text: "Take photo", onPress: () => onSelect("camera") },
    { text: "Browse files", onPress: () => onSelect("files") },
    { style: "cancel", text: "Cancel", onPress: onCancel },
  ])
}
