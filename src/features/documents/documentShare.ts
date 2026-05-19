import { Alert, Linking } from "react-native"
import * as Print from "expo-print"
import * as Sharing from "expo-sharing"
import * as FileSystem from "expo-file-system/legacy"

import type { DocumentItem } from "@/core/models"

import type { Contract, Payslip } from "./documents.types"

function sanitizeFileName(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
  return normalized.replace(/(^-|-$)/g, "") || `document-${Date.now()}`
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function getExportDirectory() {
  return FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? null
}

async function ensureDirectoryExists(directoryUri: string) {
  const info = await FileSystem.getInfoAsync(directoryUri)
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true })
  }
}

async function moveExportedFile(uri: string, fileName: string) {
  const exportDirectory = getExportDirectory()
  if (!exportDirectory) {
    return uri
  }

  const documentsDirectory = `${exportDirectory}vesta-mobile-exports/`
  await ensureDirectoryExists(documentsDirectory)

  const targetUri = `${documentsDirectory}${fileName}`
  try {
    await FileSystem.moveAsync({ from: uri, to: targetUri })
    return targetUri
  } catch {
    return uri
  }
}

async function shareFile({
  fileName,
  mimeType,
  title,
  uri,
}: {
  fileName: string
  mimeType: string
  title: string
  uri: string
}) {
  const shareUri = uri.startsWith("file://") ? uri : await moveExportedFile(uri, fileName)

  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(shareUri, {
        UTI: mimeType === "application/pdf" ? "com.adobe.pdf" : undefined,
        dialogTitle: title,
        mimeType,
      })
      return true
    }

    if (await Linking.canOpenURL(shareUri)) {
      await Linking.openURL(shareUri)
      return true
    }
  } catch {}

  Alert.alert("Share unavailable", "This device can't share the selected file.")
  return false
}

function buildPdfDocument(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
        color: #1f2937;
        padding: 32px 28px;
        line-height: 1.55;
      }
      h1 {
        font-size: 24px;
        margin: 0 0 18px;
      }
      .copy {
        white-space: pre-wrap;
        font-size: 14px;
      }
      .muted {
        color: #6b7280;
        font-size: 12px;
        margin-top: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 18px;
      }
      th, td {
        border-bottom: 1px solid #e5e7eb;
        padding: 10px 0;
        text-align: left;
        font-size: 14px;
      }
      .value {
        text-align: right;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    ${body}
  </body>
</html>`
}

async function printPdfToFile({ fileName, html }: { fileName: string; html: string }) {
  const result = await Print.printToFileAsync({ html })
  return moveExportedFile(result.uri, fileName)
}

export async function shareContractPdf(contract: Contract) {
  try {
    const fileName = `${sanitizeFileName(contract.name)}-${contract.id}.pdf`
    const html = buildPdfDocument(
      contract.name,
      `<div class="copy">${escapeHtml(contract.body)}</div>
<div class="muted">${escapeHtml(`${contract.type} · ${contract.date}`)}</div>`,
    )
    const uri = await printPdfToFile({ fileName, html })
    return shareFile({
      fileName,
      mimeType: "application/pdf",
      title: contract.name,
      uri,
    })
  } catch {
    Alert.alert("Download unavailable", "Vesta couldn't create the contract PDF.")
    return false
  }
}

export async function sharePayslipPdf(payslip: Payslip) {
  try {
    const fileName = `${sanitizeFileName(payslip.month)}-payslip.pdf`
    const rowsHtml = payslip.rows
      .map(
        (row) =>
          `<tr><td>${escapeHtml(row.label)}</td><td class="value">${escapeHtml(row.amount)}</td></tr>`,
      )
      .join("")
    const html = buildPdfDocument(
      `${payslip.month} Payslip`,
      `<div class="copy">${escapeHtml(`${payslip.period}\nPaid ${payslip.date}\nNet pay ${payslip.net}`)}</div>
<table>
  <tbody>${rowsHtml}</tbody>
</table>`,
    )
    const uri = await printPdfToFile({ fileName, html })
    return shareFile({
      fileName,
      mimeType: "application/pdf",
      title: `${payslip.month} payslip`,
      uri,
    })
  } catch {
    Alert.alert("Download unavailable", "Vesta couldn't create the payslip PDF.")
    return false
  }
}

export async function shareUploadedDocument(document: DocumentItem) {
  if (!document.uploadedUri) {
    Alert.alert("File unavailable", "This document doesn't have a saved file yet.")
    return false
  }

  return shareFile({
    fileName: document.uploadedFileName ?? `${sanitizeFileName(document.title)}.pdf`,
    mimeType: document.uploadedMimeType ?? "application/octet-stream",
    title: document.title,
    uri: document.uploadedUri,
  })
}
