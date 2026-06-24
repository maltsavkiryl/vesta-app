import { StyleSheet, View } from "react-native"
import { Stack, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { translate } from "@/i18n/translate"
import {
  AppButton,
  AppScrollScreen,
  GroupedSection,
  SurfaceCard,
  Text,
  appLayout,
  useDesignTokens,
} from "@/ui"

import { useDocumentsStateQuery } from "./data/documents.queries"
import { useOpenDocument } from "./useOpenDocument"

function formatMimeType(mimeType: string): string {
  const lower = mimeType.toLowerCase()
  if (lower === "application/pdf") return "PDF"
  if (lower.startsWith("image/jpeg") || lower.startsWith("image/jpg")) return "JPEG"
  if (lower.startsWith("image/png")) return "PNG"
  if (lower.startsWith("image/")) return "Image"
  if (
    lower === "application/msword" ||
    lower === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "Word"
  if (lower === "text/plain") return "Text"
  // Strip subtype prefix for unknown types (e.g. "application/zip" → "zip")
  const slash = mimeType.lastIndexOf("/")
  return slash >= 0 ? mimeType.slice(slash + 1).toUpperCase() : mimeType
}

export function UploadedDocumentDetailScreen() {
  const tokens = useDesignTokens()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { documents } = useDocumentsStateQuery()
  const document = documents.find((candidate) => candidate.id === id)
  const openDocument = useOpenDocument()

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <Stack.Screen options={{ title: document?.title ?? translate("documents:title") }} />
      {document ? (
        <>
          <SurfaceCard elevationLevel={1} style={styles.hero}>
            <View style={[styles.icon, { backgroundColor: tokens.warningSoft }]}>
              <Ionicons color={tokens.warning} name="document-text-outline" size={22} />
            </View>
            <View style={styles.copy}>
              <Text
                text={document.title}
                size="sm"
                weight="semiBold"
                style={{ color: tokens.textPrimary }}
              />
              <Text text={document.subtitle} size="xs" style={{ color: tokens.textSecondary }} />
            </View>
          </SurfaceCard>

          <GroupedSection title={translate("documents:uploadDetails")}>
            <DetailItem
              label={translate("documents:status")}
              value={
                document.status === "processing"
                  ? translate("documents:underReview")
                  : translate("documents:uploaded")
              }
            />
            <DetailItem
              label={translate("documents:fileName")}
              value={document.uploadedFileName ?? translate("documents:unknown")}
            />
            <DetailItem
              label={translate("documents:uploaded")}
              value={document.uploadedAt ?? translate("documents:unknown")}
            />
            <DetailItem
              isLast
              label={translate("documents:format")}
              value={
                document.uploadedMimeType
                  ? formatMimeType(document.uploadedMimeType)
                  : translate("documents:unknownFormat")
              }
            />
          </GroupedSection>

          <AppButton
            fullWidth
            label={translate("documents:shareFile")}
            onPress={() => {
              void openDocument(document)
            }}
          />
        </>
      ) : (
        <SurfaceCard elevationLevel={1} style={styles.emptyCard}>
          <Text
            tx="documents:documentNotFound"
            weight="semiBold"
            style={{ color: tokens.textPrimary }}
          />
          <Text
            tx="documents:documentNotFoundSubtitle"
            size="xs"
            style={{ color: tokens.textSecondary }}
          />
        </SurfaceCard>
      )}
    </AppScrollScreen>
  )
}

function DetailItem({
  isLast = false,
  label,
  value,
}: {
  isLast?: boolean
  label: string
  value: string
}) {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.detailRow,
        !isLast
          ? { borderBottomColor: tokens.border, borderBottomWidth: StyleSheet.hairlineWidth }
          : null,
      ]}
    >
      <Text text={label} size="xs" style={{ color: tokens.textSecondary }} />
      <Text
        text={value}
        size="xs"
        weight="medium"
        style={[styles.detailValue, { color: tokens.textPrimary }]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: 4,
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
  },
  emptyCard: {
    gap: 8,
    padding: 18,
  },
  hero: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    padding: 18,
  },
  icon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  screen: {
    gap: appLayout.screenGap,
    paddingHorizontal: appLayout.screenPaddingHorizontal,
    paddingTop: appLayout.sheetPaddingTop,
  },
})
