import { ActionSheetIOS } from "react-native"

type UploadSource = "camera" | "files"

export function showNativeUploadOptions({
  onSelect,
  title,
}: {
  onSelect: (source: UploadSource) => void
  title: string
}) {
  ActionSheetIOS.showActionSheetWithOptions(
    {
      cancelButtonIndex: 2,
      options: ["Take Photo", "Browse Files", "Cancel"],
      title,
    },
    (buttonIndex) => {
      if (buttonIndex === 0) onSelect("camera")
      if (buttonIndex === 1) onSelect("files")
    },
  )
}
