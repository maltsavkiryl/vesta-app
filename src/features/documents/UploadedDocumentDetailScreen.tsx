import { StyleSheet, View } from "react-native"
import { Stack, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

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
import { shareUploadedDocument } from "./documentShare"

export function UploadedDocumentDetailScreen() {
  const tokens = useDesignTokens()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { documents } = useDocumentsStateQuery()
  const document = documents.find((candidate) => candidate.id === id)

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <Stack.Screen options={{ title: document?.title ?? "Uploaded file" }} />
      {document ? (
        <>
          <SurfaceCard style={styles.hero}>
            <View style={[styles.icon, { backgroundColor: `${tokens.warning}14` }]}>
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

          <GroupedSection title="Upload details">
            <DetailItem
              label="Status"
              value={document.status === "processing" ? "Under review" : "Uploaded"}
            />
            <DetailItem label="File name" value={document.uploadedFileName ?? "Unknown"} />
            <DetailItem label="Uploaded" value={document.uploadedAt ?? "Unknown"} />
            <DetailItem isLast label="Format" value={document.uploadedMimeType ?? "Unknown"} />
          </GroupedSection>

          <AppButton
            fullWidth
            label="Share file"
            onPress={() => {
              void shareUploadedDocument(document)
            }}
          />
        </>
      ) : (
        <SurfaceCard style={styles.emptyCard}>
          <Text text="Document not found" weight="semiBold" style={{ color: tokens.textPrimary }} />
          <Text
            text="This uploaded file is no longer available in local storage."
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
