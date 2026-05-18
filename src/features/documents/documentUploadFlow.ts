import { Alert } from "react-native"

import { showNativeUploadOptions, type UploadSource } from "./showUploadOptions"

export type UploadTarget = { id?: string; title: string }
export type SelectedUploadAsset = {
  fileName: string
  fileSize?: number
  mimeType?: string
  uri: string
}

type UploadResult = "completed" | "cancelled" | "failed"
type UploadDocumentHandler = (
  payload: SelectedUploadAsset & { title: string; documentId?: string },
) => void

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024
const ACCEPTED_UPLOAD_TYPES = ["application/pdf", "image/jpeg", "image/png"]

function getUploadValidationError(asset: SelectedUploadAsset) {
  if (asset.fileSize && asset.fileSize > MAX_UPLOAD_SIZE_BYTES) {
    return "Choose a file smaller than 10 MB."
  }

  if (asset.mimeType && !ACCEPTED_UPLOAD_TYPES.includes(asset.mimeType)) {
    return "Upload a PDF, JPG, or PNG file."
  }

  return null
}

async function takeDocumentPhoto() {
  const ImagePicker = await import("expo-image-picker")
  const permission = await ImagePicker.requestCameraPermissionsAsync()
  if (!permission.granted) {
    Alert.alert("Camera access needed", "Allow camera access to take a document photo.")
    return null
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 0.85,
  })

  if (result.canceled) return null
  const asset = result.assets[0]
  if (!asset) return null

  return {
    fileName: asset.fileName ?? "document-photo.jpg",
    fileSize: asset.fileSize,
    mimeType: asset.mimeType ?? "image/jpeg",
    uri: asset.uri,
  } satisfies SelectedUploadAsset
}

async function browseDocumentFiles() {
  const DocumentPicker = await import("expo-document-picker")
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: ACCEPTED_UPLOAD_TYPES,
  })

  if (result.canceled) return null
  const asset = result.assets[0]
  if (!asset) return null

  return {
    fileName: asset.name,
    fileSize: asset.size,
    mimeType: asset.mimeType,
    uri: asset.uri,
  } satisfies SelectedUploadAsset
}

async function pickUploadAsset(source: UploadSource) {
  return source === "camera" ? takeDocumentPhoto() : browseDocumentFiles()
}

export async function uploadDocumentFromSource({
  source,
  target,
  uploadDocument,
}: {
  source: UploadSource
  target: UploadTarget
  uploadDocument: UploadDocumentHandler
}): Promise<UploadResult> {
  try {
    const asset = await pickUploadAsset(source)
    if (!asset) return "cancelled"

    const validationError = getUploadValidationError(asset)
    if (validationError) {
      Alert.alert("Cannot upload file", validationError)
      return "failed"
    }

    uploadDocument({
      documentId: target.id,
      title: target.title,
      ...asset,
    })
    Alert.alert("Upload complete", `${target.title} has been uploaded.`)
    return "completed"
  } catch {
    Alert.alert("Upload unavailable", "Rebuild the development app to enable document uploads.")
    return "failed"
  }
}

export function showDocumentUploadOptions({
  target = { title: "Uploaded document" },
  uploadDocument,
}: {
  target?: UploadTarget
  uploadDocument: UploadDocumentHandler
}) {
  return new Promise<UploadResult>((resolve) => {
    showNativeUploadOptions({
      onCancel: () => resolve("cancelled"),
      onSelect: (source) => {
        void uploadDocumentFromSource({
          source,
          target,
          uploadDocument,
        }).then(resolve)
      },
      title: target.title,
    })
  })
}
