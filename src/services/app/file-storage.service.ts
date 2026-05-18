import * as FileSystem from "expo-file-system/legacy"

function getBaseDirectory() {
  return FileSystem.documentDirectory ?? FileSystem.cacheDirectory
}

function sanitizeFileName(fileName: string) {
  const trimmed = fileName.trim()
  return trimmed.replace(/[^a-zA-Z0-9._-]/g, "-") || `file-${Date.now()}`
}

async function ensureDirectoryExists(directoryUri: string) {
  const info = await FileSystem.getInfoAsync(directoryUri)
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true })
  }
}

export async function persistLocalAsset({
  accountId,
  fileName,
  kind,
  sourceUri,
}: {
  accountId: string
  fileName: string
  kind: "documents" | "proof-photos"
  sourceUri: string
}) {
  const baseDirectory = getBaseDirectory()
  if (!baseDirectory || !sourceUri.startsWith("file://")) {
    return sourceUri
  }

  const rootDirectory = `${baseDirectory}vesta-mobile-assets/`
  const accountDirectory = `${rootDirectory}${accountId}/${kind}/`
  await ensureDirectoryExists(rootDirectory)
  await ensureDirectoryExists(`${rootDirectory}${accountId}/`)
  await ensureDirectoryExists(accountDirectory)

  if (sourceUri.startsWith(accountDirectory)) {
    return sourceUri
  }

  const destinationUri = `${accountDirectory}${Date.now()}-${sanitizeFileName(fileName)}`
  await FileSystem.copyAsync({
    from: sourceUri,
    to: destinationUri,
  })

  return destinationUri
}
