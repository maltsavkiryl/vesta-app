import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { EmployerInviteCodeEntry } from "@/features/employers/EmployerInviteCodeEntry"
import {
  AppButton,
  AppSegmentedControl,
  SelectionIndicator,
  SelectionRow,
  Text,
  appTypography,
  useDesignTokens,
} from "@/ui"

import { AuthTextField } from "../AuthTextField"
import { onboardingStyles } from "./onboarding.styles"
import type { OnboardingEmployer as OnboardingEmployerType } from "./types"

export interface OnboardingEmployerProps {
  code: string
  codeHelperText: string
  joined: boolean
  joinMode: "code" | "search"
  previewEmployer?: OnboardingEmployerType
  search: string
  searchResults: OnboardingEmployerType[]
  selectedEmployerId: string
  onCodeChange: (value: string) => void
  onJoin: () => void
  onModeChange: (mode: "code" | "search") => void
  onOpenQrScanner: () => void
  onSearchChange: (value: string) => void
  onSelectEmployer: (id: string) => void
}

export function OnboardingEmployer({
  code,
  codeHelperText,
  joined,
  joinMode,
  previewEmployer,
  search,
  searchResults,
  selectedEmployerId,
  onCodeChange,
  onJoin,
  onModeChange,
  onOpenQrScanner,
  onSearchChange,
  onSelectEmployer,
}: OnboardingEmployerProps) {
  const tokens = useDesignTokens()

  return (
    <View style={onboardingStyles.section}>
      <View style={onboardingStyles.titleBlock}>
        <Text
          text="Join your employer"
          weight="bold"
          style={[appTypography.onboardingTitle, { color: tokens.textPrimary }]}
        />
        <Text
          text="Use your invite code or choose the workplace you want to start with."
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>

      <AppSegmentedControl
        onChange={onModeChange}
        options={[
          { label: "Invite code", value: "code" },
          { label: "Search", value: "search" },
        ]}
        style={styles.segmentedControl}
        value={joinMode}
      />

      {joinMode === "code" ? (
        <View style={styles.stack}>
          <EmployerInviteCodeEntry
            code={code}
            helperText={codeHelperText}
            onChangeCode={onCodeChange}
            onOpenQrScanner={onOpenQrScanner}
          />
        </View>
      ) : (
        <View style={styles.stack}>
          <AuthTextField
            label="Search"
            labelCase="default"
            onChangeText={onSearchChange}
            placeholder="Search by name or city..."
            value={search}
          />
          {searchResults.map((employer) => (
            <EmployerRow
              key={employer.id}
              employer={employer}
              selected={selectedEmployerId === employer.id}
              onPress={() => onSelectEmployer(employer.id)}
            />
          ))}
        </View>
      )}

      {previewEmployer ? (
        <View
          style={[
            styles.employerPreview,
            { backgroundColor: tokens.surfaceSecondary, borderColor: tokens.border },
          ]}
        >
          <View style={styles.employerHeader}>
            <View style={[styles.employerInitial, { backgroundColor: tokens.textPrimary }]}>
              <Text
                text={previewEmployer.name[0]}
                size="sm"
                weight="bold"
                style={{ color: tokens.background }}
              />
            </View>
            <View style={styles.flex}>
              <Text
                text={previewEmployer.name}
                size="sm"
                weight="semiBold"
                style={{ color: tokens.textPrimary }}
              />
              <Text
                text={`${previewEmployer.type} · ${previewEmployer.city}`}
                size="xxs"
                style={{ color: tokens.textSecondary }}
              />
            </View>
            <View style={styles.rating}>
              <Ionicons color={tokens.warning} name="star" size={13} />
              <Text
                text={String(previewEmployer.rating)}
                size="xxs"
                weight="medium"
                style={{ color: tokens.textPrimary }}
              />
            </View>
          </View>
          <View style={styles.previewStats}>
            <PreviewStat label="City" value={previewEmployer.city} />
            <PreviewStat label="Code" value={previewEmployer.code} />
          </View>
          <AppButton label={joined ? "Selected" : "Use this employer"} onPress={onJoin} />
        </View>
      ) : null}

      {joined && previewEmployer ? (
        <View
          style={[
            styles.joinedCard,
            { backgroundColor: tokens.successSoft, borderColor: tokens.success },
          ]}
        >
          <Ionicons color={tokens.success} name="checkmark-circle-outline" size={24} />
          <View style={styles.flex}>
            <Text
              text="Employer selected"
              size="xs"
              weight="semiBold"
              style={{ color: tokens.textPrimary }}
            />
            <Text
              text={`${previewEmployer.name} will be used when you finish onboarding.`}
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          </View>
        </View>
      ) : null}
    </View>
  )
}

function EmployerRow({
  employer,
  selected,
  onPress,
}: {
  employer: OnboardingEmployerType
  selected: boolean
  onPress: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <SelectionRow
      onPress={onPress}
      selected={selected}
      subtitle={`${employer.type} · ${employer.city}`}
      title={employer.name}
      leading={
        <View style={[styles.searchIcon, { backgroundColor: tokens.background }]}>
          <Ionicons color={tokens.textSecondary} name="location-outline" size={15} />
        </View>
      }
      trailing={
        <View style={styles.trailingContent}>
          <View style={styles.rating}>
            <Ionicons color={tokens.warning} name="star" size={11} />
            <Text
              text={String(employer.rating)}
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          </View>
          {selected ? <SelectionIndicator /> : null}
        </View>
      }
    />
  )
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.previewStat, { backgroundColor: tokens.background }]}>
      <Text
        text={value}
        size="xs"
        weight="semiBold"
        style={[onboardingStyles.centeredText, styles.previewValue, { color: tokens.textPrimary }]}
      />
      <Text
        text={label}
        style={[
          onboardingStyles.caption,
          onboardingStyles.centeredText,
          { color: tokens.textSecondary },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  employerHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  employerInitial: {
    alignItems: "center",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  employerPreview: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  flex: {
    flex: 1,
  },
  joinedCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  previewStat: {
    borderRadius: 10,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  previewStats: {
    flexDirection: "row",
    gap: 8,
  },
  previewValue: {
    textAlign: "center",
  },
  rating: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
  },
  searchIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  segmentedControl: {
    borderRadius: 14,
  },
  stack: {
    gap: 10,
  },
  trailingContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
})
