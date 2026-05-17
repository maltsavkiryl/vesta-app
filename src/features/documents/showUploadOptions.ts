import { Alert } from "react-native"

export type UploadSource = "camera" | "files"

export function showNativeUploadOptions({
  onSelect,
  title,
}: {
  onSelect: (source: UploadSource) => void
  title: string
}) {
  Alert.alert(title, "Choose an upload source.", [
    { text: "Take photo", onPress: () => onSelect("camera") },
    { text: "Browse files", onPress: () => onSelect("files") },
    { style: "cancel", text: "Cancel" },
  ])
}
