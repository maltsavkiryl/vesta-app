import { Alert } from "react-native"

import { translate } from "@/i18n/translate"
import { fireHaptic } from "@/utils/haptics"

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
) => Promise<unknown>

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024
const ACCEPTED_UPLOAD_TYPES = ["application/pdf", "image/jpeg", "image/png"]

function getUploadValidationError(asset: SelectedUploadAsset) {
  if (asset.fileSize && asset.fileSize > MAX_UPLOAD_SIZE_BYTES) {
    return translate("documents:fileTooLarge")
  }

  if (asset.mimeType && !ACCEPTED_UPLOAD_TYPES.includes(asset.mimeType)) {
    return translate("documents:fileType")
  }

  return null
}

async function takeDocumentPhoto() {
  const ImagePicker = await import("expo-image-picker")
  const permission = await ImagePicker.requestCameraPermissionsAsync()
  if (!permission.granted) {
    Alert.alert(
      translate("documents:uploadCameraNeeded"),
      translate("documents:uploadCameraNeededBody"),
    )
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
      fireHaptic("warning")
      Alert.alert(translate("documents:uploadFailed"), validationError)
      return "failed"
    }

    const result = await uploadDocument({
      documentId: target.id,
      title: target.title,
      ...asset,
    })
    if (
      typeof result === "object" &&
      result &&
      "ok" in result &&
      !result.ok &&
      "error" in result &&
      result.error &&
      typeof result.error === "object" &&
      "message" in result.error
    ) {
      fireHaptic("error")
      Alert.alert(translate("documents:uploadFailed"), String(result.error.message))
      return "failed"
    }

    fireHaptic("success")
    Alert.alert(translate("documents:uploadComplete"), `${target.title} has been uploaded.`)
    return "completed"
  } catch {
    fireHaptic("error")
    Alert.alert(translate("documents:uploadUnavailable"), translate("documents:uploadDevBuild"))
    return "failed"
  }
}

export function showDocumentUploadOptions({
  target = { title: translate("documents:uploadedDocument") },
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
