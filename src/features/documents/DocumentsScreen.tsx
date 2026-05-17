/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { useCallback, useEffect, useMemo, useState } from "react"
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { Text } from "@/components/Text"
import type { DocumentItem, DocumentStatus } from "@/core/models"
import { AppButton, AppScrollScreen, AppSegmentedControl } from "@/design-system/primitives"
import { useDesignTokens } from "@/design-system/tokens"
import type { DesignTokens } from "@/design-system/tokens"
import { useAppSession } from "@/providers/app-provider"

import { showNativeUploadOptions } from "./showUploadOptions"

type Category = "required" | "payslips" | "contracts"
type UploadTarget = { id?: string; title: string }
type SelectedUploadAsset = {
  fileName: string
  fileSize?: number
  mimeType?: string
  uri: string
}

interface Payslip {
  id: string
  month: string
  period: string
  net: string
  date: string
  rows: { label: string; amount: string; type: "plus" | "minus" }[]
}

interface Contract {
  id: string
  name: string
  type: string
  date: string
  status: "signed" | "pending"
  body: string
}

const categories: { id: Category; label: string }[] = [
  { id: "required", label: "Required" },
  { id: "payslips", label: "Payslips" },
  { id: "contracts", label: "Contracts" },
]
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

const payslips: Payslip[] = [
  {
    date: "Apr 1, 2026",
    id: "payslip-1",
    month: "March 2026",
    net: "€1,847.50",
    period: "Mar 1 - Mar 31",
    rows: [
      { amount: "€1,875.12", label: "Regular hours (156h x €12.02)", type: "plus" },
      { amount: "€72.12", label: "Overtime bonus", type: "plus" },
      { amount: "-€74.96", label: "NSSO contribution", type: "minus" },
      { amount: "-€24.78", label: "Advance holiday pay", type: "minus" },
    ],
  },
  {
    date: "Mar 1, 2026",
    id: "payslip-2",
    month: "February 2026",
    net: "€1,923.20",
    period: "Feb 1 - Feb 28",
    rows: [
      { amount: "€1,923.20", label: "Regular hours (160h x €12.02)", type: "plus" },
      { amount: "-€76.93", label: "NSSO contribution", type: "minus" },
      { amount: "-€25.74", label: "Advance holiday pay", type: "minus" },
    ],
  },
  {
    date: "Feb 1, 2026",
    id: "payslip-3",
    month: "January 2026",
    net: "€1,765.80",
    period: "Jan 1 - Jan 31",
    rows: [
      { amount: "€1,730.88", label: "Regular hours (144h x €12.02)", type: "plus" },
      { amount: "€34.92", label: "Holiday supplement", type: "plus" },
      { amount: "-€70.63", label: "NSSO contribution", type: "minus" },
    ],
  },
]

const contractBody =
  "This employment contract is entered into between Bistro Noir BVBA and Sofia Fischer, effective January 15, 2026.\n\n1. POSITION\nThe employee is engaged as Waiter/Waitress on a part-time basis, averaging 24 hours per week.\n\n2. COMPENSATION\nGross hourly wage of €12.02, payable monthly on the 1st.\n\n3. WORKING HOURS\nShifts assigned weekly by the employer. The employee agrees to maintain their availability profile."

const amendmentBody =
  "This amendment to the employment contract is entered into between Bistro Noir BVBA and Sofia Fischer, effective March 1, 2026.\n\n1. AMENDMENT\nEffective March 1, 2026, the employee's Friday evening shift will run from 17:00 to 00:00 midnight.\n\n2. COMPENSATION\nExtended hours are compensated at the existing rate of €12.02/h."

const initialContracts: Contract[] = [
  {
    body: contractBody,
    date: "Jan 15, 2026",
    id: "contract-1",
    name: "Employment Contract",
    status: "signed",
    type: "Part-time",
  },
  {
    body: amendmentBody,
    date: "Mar 1, 2026",
    id: "contract-2",
    name: "Schedule Amendment",
    status: "pending",
    type: "Amendment",
  },
]

function getStatusConfig(tokens: DesignTokens, status: DocumentStatus | Contract["status"]) {
  const normalized = status === "action_required" ? "missing" : status
  return {
    available: {
      backgroundColor: `${tokens.accent}14`,
      color: tokens.accent,
      icon: "document-text-outline",
      label: "Available",
    },
    missing: {
      backgroundColor: `${tokens.danger}14`,
      color: tokens.danger,
      icon: "alert-circle-outline",
      label: "Missing",
    },
    pending: {
      backgroundColor: `${tokens.warning}14`,
      color: tokens.warning,
      icon: "time-outline",
      label: "Pending",
    },
    processing: {
      backgroundColor: `${tokens.warning}14`,
      color: tokens.warning,
      icon: "time-outline",
      label: "Under review",
    },
    signed: {
      backgroundColor: `${tokens.success}14`,
      color: tokens.success,
      icon: "checkmark-circle-outline",
      label: "Signed",
    },
    verified: {
      backgroundColor: `${tokens.success}14`,
      color: tokens.success,
      icon: "checkmark-circle-outline",
      label: "Approved",
    },
  }[normalized] as {
    backgroundColor: string
    color: string
    icon: keyof typeof Ionicons.glyphMap
    label: string
  }
}

function Header({
  isSearching,
  onCancelSearch,
  onQueryChange,
  onSearch,
  onUpload,
  query,
}: {
  isSearching: boolean
  onCancelSearch: () => void
  onQueryChange: (query: string) => void
  onSearch: () => void
  onUpload: () => void
  query: string
}) {
  const tokens = useDesignTokens()

  if (isSearching) {
    return (
      <View style={styles.searchHeader}>
        <View style={[styles.searchBox, { backgroundColor: tokens.surface }]}>
          <Ionicons color={tokens.textMuted} name="search-outline" size={15} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={onQueryChange}
            onSubmitEditing={onSearch}
            placeholder="Search documents..."
            placeholderTextColor={tokens.textMuted}
            style={[styles.searchInput, { color: tokens.textPrimary }]}
          />
          {query ? (
            <Pressable onPress={() => onQueryChange("")}>
              <Ionicons color={tokens.textMuted} name="close-outline" size={15} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={() => {
            onCancelSearch()
          }}
        >
          <Text text="Cancel" size="xs" weight="medium" style={{ color: tokens.accent }} />
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.header}>
      <Text
        text="Documents"
        weight="bold"
        style={[styles.headerTitle, { color: tokens.textPrimary }]}
      />
      <View style={styles.headerActions}>
        <Pressable
          onPress={onSearch}
          style={[styles.iconButton, { backgroundColor: tokens.surface }]}
        >
          <Ionicons color={tokens.textSecondary} name="search-outline" size={16} />
        </Pressable>
        <Pressable
          onPress={onUpload}
          style={[styles.uploadButton, { backgroundColor: tokens.accent }]}
        >
          <Ionicons color={tokens.accentForeground} name="cloud-upload-outline" size={14} />
          <Text
            text="Upload"
            size="xxs"
            weight="medium"
            style={{ color: tokens.accentForeground }}
          />
        </Pressable>
      </View>
    </View>
  )
}

function AttentionBanner({ count, onPress }: { count: number; onPress: () => void }) {
  const tokens = useDesignTokens()
  if (count === 0) return null

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.attentionBanner,
        { backgroundColor: `${tokens.danger}10`, borderColor: `${tokens.danger}22` },
      ]}
    >
      <Ionicons color={tokens.danger} name="alert-circle-outline" size={15} />
      <Text
        text={`${count} document${count > 1 ? "s" : ""} need${count === 1 ? "s" : ""} attention`}
        size="xxs"
        weight="medium"
        style={[styles.flex, { color: tokens.danger }]}
      />
      <Text text="View" size="xxs" weight="semiBold" style={{ color: tokens.danger }} />
    </Pressable>
  )
}

function CategoryPicker({
  value,
  onChange,
}: {
  value: Category
  onChange: (category: Category) => void
}) {
  return (
    <AppSegmentedControl
      options={categories.map((category) => ({ label: category.label, value: category.id }))}
      value={value}
      onChange={onChange}
    />
  )
}

function RequiredDocumentRow({
  document,
  onPress,
}: {
  document: DocumentItem
  onPress: () => void
}) {
  const tokens = useDesignTokens()
  const status = getStatusConfig(tokens, document.status)
  const isMissing = document.status === "action_required"

  return (
    <Pressable onPress={onPress} style={[styles.documentRow, { borderBottomColor: tokens.border }]}>
      <View style={[styles.statusIcon, { backgroundColor: status.backgroundColor }]}>
        <Ionicons color={status.color} name={status.icon} size={18} />
      </View>
      <View style={styles.flex}>
        <Text
          text={document.title}
          size="xs"
          weight="medium"
          style={{ color: tokens.textPrimary }}
        />
        <Text
          text={isMissing ? document.subtitle : `${document.category} · ${document.subtitle}`}
          size="xxs"
          style={{ color: tokens.textSecondary }}
        />
      </View>
      <View style={styles.rowTail}>
        <Text text={status.label} size="xxs" weight="medium" style={{ color: status.color }} />
        {isMissing ? (
          <View style={[styles.inlineUpload, { backgroundColor: tokens.accent }]}>
            <Text
              text="Upload"
              size="xxs"
              weight="semiBold"
              style={{ color: tokens.accentForeground }}
            />
          </View>
        ) : (
          <View style={[styles.eyeButton, { backgroundColor: tokens.surface }]}>
            <Ionicons color={tokens.textSecondary} name="eye-outline" size={14} />
          </View>
        )}
      </View>
    </Pressable>
  )
}

function PayslipRow({ payslip, onPress }: { payslip: Payslip; onPress: () => void }) {
  const tokens = useDesignTokens()

  return (
    <Pressable onPress={onPress} style={[styles.documentRow, { borderBottomColor: tokens.border }]}>
      <View style={[styles.statusIcon, { backgroundColor: `${tokens.success}14` }]}>
        <Ionicons color={tokens.success} name="cash-outline" size={18} />
      </View>
      <View style={styles.flex}>
        <Text
          text={payslip.month}
          size="xs"
          weight="medium"
          style={{ color: tokens.textPrimary }}
        />
        <Text text={`Paid ${payslip.date}`} size="xxs" style={{ color: tokens.textSecondary }} />
      </View>
      <View style={styles.payslipTail}>
        <Text text={payslip.net} size="xs" weight="bold" style={{ color: tokens.textPrimary }} />
        <Text text="Net pay" size="xxs" style={{ color: tokens.textMuted, fontSize: 11 }} />
      </View>
      <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={14} />
    </Pressable>
  )
}

function ContractCard({
  contract,
  onDownload,
  onSign,
  onView,
}: {
  contract: Contract
  onDownload: () => void
  onSign: () => void
  onView: () => void
}) {
  const tokens = useDesignTokens()
  const status = getStatusConfig(tokens, contract.status)

  return (
    <View style={[styles.contractCard, { backgroundColor: tokens.surface }]}>
      <View style={styles.contractHeader}>
        <View style={[styles.statusIcon, { backgroundColor: status.backgroundColor }]}>
          <Ionicons color={status.color} name={status.icon} size={18} />
        </View>
        <View style={styles.flex}>
          <Text
            text={contract.name}
            size="xs"
            weight="semiBold"
            style={{ color: tokens.textPrimary }}
          />
          <Text
            text={`${contract.type} · ${contract.date}`}
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
        </View>
        <Text text={status.label} size="xxs" weight="semiBold" style={{ color: status.color }} />
      </View>
      <View style={styles.contractActions}>
        <Pressable
          onPress={onView}
          style={[
            styles.contractSecondary,
            { backgroundColor: tokens.background, borderColor: tokens.border },
          ]}
        >
          <Ionicons color={tokens.textPrimary} name="eye-outline" size={14} />
          <Text text="View" size="xxs" weight="medium" style={{ color: tokens.textPrimary }} />
        </Pressable>
        {contract.status === "pending" ? (
          <Pressable
            onPress={onSign}
            style={[styles.contractPrimary, { backgroundColor: tokens.accent }]}
          >
            <Ionicons color={tokens.accentForeground} name="pencil-outline" size={14} />
            <Text
              text="Review & sign"
              size="xxs"
              weight="semiBold"
              style={{ color: tokens.accentForeground }}
            />
          </Pressable>
        ) : (
          <Pressable
            onPress={onDownload}
            style={[
              styles.contractPrimary,
              {
                backgroundColor: `${tokens.success}10`,
                borderColor: `${tokens.success}22`,
                borderWidth: 1,
              },
            ]}
          >
            <Ionicons color={tokens.success} name="download-outline" size={14} />
            <Text text="Download" size="xxs" weight="semiBold" style={{ color: tokens.success }} />
          </Pressable>
        )}
      </View>
    </View>
  )
}

export function DocumentUploadScreen() {
  const router = useRouter()
  const { id, title = "Uploaded document" } = useLocalSearchParams<{
    id?: string
    title?: string
  }>()
  const { uploadDocument } = useAppSession()
  const tokens = useDesignTokens()
  const documentName = title
  const [error, setError] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<SelectedUploadAsset | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setError(null)
    setSelectedAsset(null)
    setUploading(false)
  }, [documentName])

  const validateAndSelectAsset = (asset: SelectedUploadAsset) => {
    const validationError = getUploadValidationError(asset)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSelectedAsset(asset)
  }

  const takePhoto = async () => {
    try {
      const asset = await takeDocumentPhoto()
      if (!asset) return
      validateAndSelectAsset(asset)
    } catch {
      Alert.alert("Upload unavailable", "Rebuild the development app to enable document uploads.")
    }
  }

  const browseFiles = async () => {
    try {
      const asset = await browseDocumentFiles()
      if (!asset) return
      validateAndSelectAsset(asset)
    } catch {
      Alert.alert("Upload unavailable", "Rebuild the development app to enable document uploads.")
    }
  }

  const submitUpload = () => {
    if (!selectedAsset) {
      setError("Choose a file before uploading.")
      return
    }

    setUploading(true)
    setTimeout(() => {
      uploadDocument({
        documentId: id,
        title: documentName,
        ...selectedAsset,
      })
      router.back()
    }, 500)
  }

  return (
    <AppScrollScreen
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={styles.nativeSheetContent}
      style={{ backgroundColor: tokens.background }}
      topInset="none"
    >
      {uploading ? (
        <View style={styles.uploadingState}>
          <View style={[styles.uploadSuccessIcon, { backgroundColor: `${tokens.success}14` }]}>
            <Ionicons color={tokens.success} name="checkmark-outline" size={32} />
          </View>
          <View style={[styles.uploadProgressTrack, { backgroundColor: tokens.background }]}>
            <View
              style={[
                styles.uploadProgressFill,
                { backgroundColor: tokens.success, width: "100%" },
              ]}
            />
          </View>
          <Text
            text="Upload complete!"
            size="xs"
            weight="semiBold"
            style={{ color: tokens.textPrimary }}
          />
        </View>
      ) : (
        <>
          <View style={styles.uploadIntro}>
            <View style={[styles.uploadIntroIcon, { backgroundColor: `${tokens.accent}14` }]}>
              <Ionicons color={tokens.accent} name="document-text-outline" size={22} />
            </View>
            <View style={styles.flex}>
              <Text
                text={documentName}
                size="xs"
                weight="semiBold"
                style={{ color: tokens.textPrimary }}
              />
              <Text
                text="PDF, JPG, or PNG up to 10 MB"
                size="xxs"
                style={{ color: tokens.textSecondary }}
              />
            </View>
          </View>

          <View style={[styles.uploadSourceCard, { backgroundColor: tokens.background }]}>
            <Pressable onPress={takePhoto} style={styles.uploadSourceRow}>
              <View style={[styles.uploadSourceIcon, { backgroundColor: `${tokens.accent}14` }]}>
                <Ionicons color={tokens.accent} name="camera-outline" size={18} />
              </View>
              <View style={styles.flex}>
                <Text
                  text="Take photo"
                  size="xs"
                  weight="medium"
                  style={{ color: tokens.textPrimary }}
                />
                <Text text="Use your camera" size="xxs" style={{ color: tokens.textSecondary }} />
              </View>
              <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
            </Pressable>
            <View style={[styles.uploadSourceDivider, { backgroundColor: tokens.border }]} />
            <Pressable onPress={browseFiles} style={styles.uploadSourceRow}>
              <View style={[styles.uploadSourceIcon, { backgroundColor: `${tokens.accent}14` }]}>
                <Ionicons color={tokens.accent} name="folder-open-outline" size={18} />
              </View>
              <View style={styles.flex}>
                <Text
                  text="Browse files"
                  size="xs"
                  weight="medium"
                  style={{ color: tokens.textPrimary }}
                />
                <Text text="Choose from Files" size="xxs" style={{ color: tokens.textSecondary }} />
              </View>
              <Ionicons color={tokens.textMuted} name="chevron-forward-outline" size={16} />
            </Pressable>
          </View>

          {selectedAsset ? (
            <View style={[styles.uploadSelectedCard, { backgroundColor: `${tokens.success}10` }]}>
              <Ionicons color={tokens.success} name="checkmark-circle-outline" size={18} />
              <View style={styles.flex}>
                <Text
                  text={selectedAsset.fileName}
                  numberOfLines={1}
                  size="xs"
                  weight="medium"
                  style={{ color: tokens.textPrimary }}
                />
                <Text
                  text={
                    selectedAsset.fileSize
                      ? `${(selectedAsset.fileSize / 1024 / 1024).toFixed(1)} MB selected`
                      : "Ready to upload"
                  }
                  size="xxs"
                  style={{ color: tokens.textSecondary }}
                />
              </View>
            </View>
          ) : null}

          {error ? (
            <View
              style={[
                styles.uploadError,
                { backgroundColor: `${tokens.danger}10`, borderColor: `${tokens.danger}22` },
              ]}
            >
              <Ionicons color={tokens.danger} name="alert-circle-outline" size={15} />
              <Text text={error} size="xxs" style={[styles.flex, { color: tokens.danger }]} />
            </View>
          ) : null}

          <AppButton label="Upload" disabled={!selectedAsset} onPress={submitUpload} />
        </>
      )}
    </AppScrollScreen>
  )
}

export function PayslipDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const tokens = useDesignTokens()
  const payslip = payslips.find((item) => item.id === id)

  return (
    <AppScrollScreen
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={styles.nativeSheetContent}
      style={{ backgroundColor: tokens.background }}
      topInset="none"
    >
      {payslip ? (
        <>
          <View>
            <Text
              text={payslip.month}
              weight="bold"
              style={[styles.sheetTitle, { color: tokens.textPrimary }]}
            />
            <Text text={payslip.period} size="xxs" style={{ color: tokens.textSecondary }} />
          </View>
          <View
            style={[
              styles.netPayHero,
              { backgroundColor: `${tokens.success}10`, borderColor: `${tokens.success}22` },
            ]}
          >
            <Text
              text="NET PAY"
              size="xxs"
              weight="semiBold"
              style={[styles.caps, { color: tokens.success }]}
            />
            <Text
              text={payslip.net}
              weight="bold"
              style={[styles.netPayValue, { color: tokens.textPrimary }]}
            />
            <Text
              text={`Paid ${payslip.date}`}
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          </View>
          <Text
            text="BREAKDOWN"
            size="xxs"
            weight="semiBold"
            style={[styles.caps, { color: tokens.textMuted }]}
          />
          <View style={[styles.breakdown, { backgroundColor: tokens.background }]}>
            {payslip.rows.map((row) => (
              <View
                key={row.label}
                style={[styles.breakdownRow, { borderBottomColor: tokens.border }]}
              >
                <Text
                  text={row.label}
                  size="xxs"
                  style={[styles.flex, { color: tokens.textSecondary }]}
                />
                <Text
                  text={row.amount}
                  size="xxs"
                  weight="semiBold"
                  style={{ color: row.type === "minus" ? tokens.danger : tokens.success }}
                />
              </View>
            ))}
          </View>
          <AppButton label="Download PDF" onPress={router.back} />
        </>
      ) : null}
    </AppScrollScreen>
  )
}

export function ContractDetailScreen() {
  const router = useRouter()
  const { id, mode = "view" } = useLocalSearchParams<{ id: string; mode?: "view" | "sign" }>()
  const tokens = useDesignTokens()
  const { signContract, state } = useAppSession()
  const contract = initialContracts
    .map((item) =>
      state.signedContractIds.includes(item.id) ? { ...item, status: "signed" as const } : item,
    )
    .find((item) => item.id === id)
  const [signature, setSignature] = useState("")

  return (
    <AppScrollScreen
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={styles.nativeSheetContent}
      style={{ backgroundColor: tokens.background }}
      topInset="none"
    >
      {contract ? (
        <>
          <View>
            <Text
              text={mode === "sign" ? "Sign contract" : contract.name}
              weight="bold"
              style={[styles.sheetTitle, { color: tokens.textPrimary }]}
            />
            <Text
              text={mode === "sign" ? contract.name : `${contract.type} · ${contract.date}`}
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          </View>
          <View style={[styles.contractPreview, { backgroundColor: tokens.background }]}>
            <Text
              text={contract.body}
              size="xxs"
              style={{
                color: mode === "sign" ? tokens.textSecondary : tokens.textPrimary,
                lineHeight: 21,
              }}
            />
          </View>
          {mode === "sign" ? (
            <>
              <Text
                text="YOUR SIGNATURE"
                size="xxs"
                weight="semiBold"
                style={[styles.caps, { color: tokens.textMuted }]}
              />
              <TextInput
                value={signature}
                onChangeText={setSignature}
                placeholder="Type your full legal name..."
                placeholderTextColor={tokens.textMuted}
                style={[
                  styles.signatureInputWrapper,
                  {
                    borderColor: signature ? tokens.accent : tokens.border,
                    color: tokens.textPrimary,
                  },
                ]}
              />
              <View
                style={[
                  styles.signNotice,
                  {
                    backgroundColor: `${tokens.warning}10`,
                    borderColor: `${tokens.warning}22`,
                  },
                ]}
              >
                <Text
                  text="By signing, you confirm you have read and agree to all terms of this document."
                  size="xxs"
                  style={{ color: tokens.warning }}
                />
              </View>
              <AppButton
                label="Sign document"
                disabled={!signature.trim()}
                onPress={() => {
                  signContract(contract.id)
                  router.back()
                }}
              />
            </>
          ) : (
            <View style={styles.contractActions}>
              <Pressable
                style={[
                  styles.contractSecondary,
                  { backgroundColor: tokens.background, borderColor: tokens.border },
                ]}
              >
                <Ionicons color={tokens.textPrimary} name="download-outline" size={14} />
                <Text
                  text="Download"
                  size="xxs"
                  weight="medium"
                  style={{ color: tokens.textPrimary }}
                />
              </Pressable>
              {contract.status === "pending" ? (
                <Pressable
                  onPress={() =>
                    router.replace({
                      pathname: "/(app)/document-contract/[id]",
                      params: { id: contract.id, mode: "sign" },
                    } as never)
                  }
                  style={[styles.contractPrimary, { backgroundColor: tokens.accent }]}
                >
                  <Ionicons color={tokens.accentForeground} name="pencil-outline" size={14} />
                  <Text
                    text="Sign contract"
                    size="xxs"
                    weight="semiBold"
                    style={{ color: tokens.accentForeground }}
                  />
                </Pressable>
              ) : null}
            </View>
          )}
        </>
      ) : null}
    </AppScrollScreen>
  )
}

export function DocumentsScreen() {
  const router = useRouter()
  const { state, uploadDocument } = useAppSession()
  const [category, setCategory] = useState<Category>("required")
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const missingCount = state.documents.filter(
    (document) => document.status === "action_required",
  ).length
  const filteredDocuments = useMemo(
    () =>
      state.documents.filter((document) =>
        query ? document.title.toLowerCase().includes(query.toLowerCase()) : true,
      ),
    [query, state.documents],
  )
  const filteredPayslips = payslips.filter((payslip) =>
    query ? payslip.month.toLowerCase().includes(query.toLowerCase()) : true,
  )
  const contracts = initialContracts.map((contract) =>
    state.signedContractIds.includes(contract.id)
      ? { ...contract, status: "signed" as const }
      : contract,
  )
  const filteredContracts = contracts.filter((contract) =>
    query ? contract.name.toLowerCase().includes(query.toLowerCase()) : true,
  )
  const uploadSelectedAsset = useCallback(
    async (target: UploadTarget, source: "camera" | "files") => {
      try {
        const asset = source === "camera" ? await takeDocumentPhoto() : await browseDocumentFiles()
        if (!asset) return

        const validationError = getUploadValidationError(asset)
        if (validationError) {
          Alert.alert("Cannot upload file", validationError)
          return
        }

        uploadDocument({
          documentId: target.id,
          title: target.title,
          ...asset,
        })
      } catch {
        Alert.alert("Upload unavailable", "Rebuild the development app to enable document uploads.")
      }
    },
    [uploadDocument],
  )
  const showUploadOptions = useCallback(
    (target: UploadTarget = { title: "Uploaded document" }) => {
      showNativeUploadOptions({
        onSelect: (source) => void uploadSelectedAsset(target, source),
        title: target.title,
      })
    },
    [uploadSelectedAsset],
  )

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <Header
        isSearching={isSearching}
        query={query}
        onCancelSearch={() => {
          setIsSearching(false)
          setQuery("")
        }}
        onQueryChange={setQuery}
        onSearch={() => setIsSearching(true)}
        onUpload={() => showUploadOptions()}
      />

      {!isSearching ? (
        <AttentionBanner count={missingCount} onPress={() => setCategory("required")} />
      ) : null}

      <CategoryPicker value={category} onChange={setCategory} />

      {category === "required" ? (
        <View style={styles.list}>
          {filteredDocuments.map((document) => (
            <RequiredDocumentRow
              key={document.id}
              document={document}
              onPress={() => {
                if (document.status === "action_required") {
                  showUploadOptions({ id: document.id, title: document.title })
                }
              }}
            />
          ))}
        </View>
      ) : null}

      {category === "payslips" ? (
        <View style={styles.list}>
          {filteredPayslips.map((payslip) => (
            <PayslipRow
              key={payslip.id}
              payslip={payslip}
              onPress={() =>
                router.push({
                  pathname: "/(app)/document-payslip/[id]",
                  params: { id: payslip.id },
                } as never)
              }
            />
          ))}
        </View>
      ) : null}

      {category === "contracts" ? (
        <View style={styles.contractList}>
          {filteredContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onDownload={() => undefined}
              onSign={() =>
                router.push({
                  pathname: "/(app)/document-contract/[id]",
                  params: { id: contract.id, mode: "sign" },
                } as never)
              }
              onView={() =>
                router.push({
                  pathname: "/(app)/document-contract/[id]",
                  params: { id: contract.id, mode: "view" },
                } as never)
              }
            />
          ))}
        </View>
      ) : null}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  attentionBanner: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  breakdown: {
    borderCurve: "continuous",
    borderRadius: 14,
    marginBottom: 4,
    overflow: "hidden",
  },
  breakdownRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  caps: {
    letterSpacing: 0,
  },
  contractActions: {
    flexDirection: "row",
    gap: 8,
  },
  contractCard: {
    borderCurve: "continuous",
    borderRadius: 17,
    gap: 14,
    padding: 16,
  },
  contractHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  contractList: {
    gap: 10,
  },
  contractPreview: {
    borderCurve: "continuous",
    borderRadius: 14,
    maxHeight: 320,
    padding: 16,
  },
  contractPrimary: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    flex: 2,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    padding: 10,
  },
  contractSecondary: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    padding: 10,
  },
  documentRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    minHeight: 68,
    paddingVertical: 14,
  },
  eyeButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 8,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  iconButton: {
    alignItems: "center",
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  inlineUpload: {
    borderCurve: "continuous",
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  list: {
    paddingHorizontal: 0,
  },
  nativeSheetContent: {
    gap: 16,
    paddingBottom: 36,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  netPayHero: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  netPayValue: {
    fontSize: 38,
    lineHeight: 44,
  },
  payslipTail: {
    alignItems: "flex-end",
  },
  rowTail: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  screen: {
    gap: 12,
    paddingHorizontal: 16,
  },
  searchBox: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  searchHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    padding: 0,
  },
  sheetTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  signNotice: {
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  signatureInputWrapper: {
    borderCurve: "continuous",
    borderRadius: 13,
    borderWidth: 1.5,
    fontSize: 17,
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  uploadButton: {
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  uploadError: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  uploadIntro: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 2,
  },
  uploadIntroIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  uploadProgressFill: {
    borderRadius: 99,
    height: "100%",
  },
  uploadProgressTrack: {
    borderRadius: 99,
    height: 6,
    overflow: "hidden",
    width: "100%",
  },
  uploadSelectedCard: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 13,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  uploadSourceCard: {
    borderCurve: "continuous",
    borderRadius: 16,
    overflow: "hidden",
  },
  uploadSourceDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 58,
  },
  uploadSourceIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  uploadSourceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  uploadSuccessIcon: {
    alignItems: "center",
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  uploadingState: {
    alignItems: "center",
    gap: 18,
    paddingBottom: 8,
    paddingTop: 16,
  },
})
