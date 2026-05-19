import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

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
  joined: boolean
  joinMode: "code" | "search"
  previewEmployer?: OnboardingEmployerType
  search: string
  searchResults: OnboardingEmployerType[]
  selectedEmployerId: string
  onCodeChange: (value: string) => void
  onJoin: () => void
  onModeChange: (mode: "code" | "search") => void
  onSearchChange: (value: string) => void
  onSelectEmployer: (id: string) => void
}

export function OnboardingEmployer({
  code,
  joined,
  joinMode,
  previewEmployer,
  search,
  searchResults,
  selectedEmployerId,
  onCodeChange,
  onJoin,
  onModeChange,
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
          text="Enter the 6-digit code from your manager or search by name."
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
          <CodeBoxes code={code} />
          <AuthTextField
            autoCapitalize="characters"
            label="Invite code"
            maxLength={6}
            onChangeText={onCodeChange}
            value={code}
          />
          <Text
            text={
              code.length === 0
                ? "Type or paste your invite code"
                : code.length < 6
                  ? `${6 - code.length} more character${code.length === 5 ? "" : "s"}`
                  : previewEmployer
                    ? "Employer found!"
                    : "Code not recognized"
            }
            size="xxs"
            style={[onboardingStyles.centeredText, styles.helperText, { color: tokens.textMuted }]}
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
            <PreviewStat label="Employees" value={String(previewEmployer.teamSize)} />
            <PreviewStat label="Hiring" value="Open" />
          </View>
          <AppButton label={joined ? "Request sent" : "Request to join"} onPress={onJoin} />
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
              text="Request sent!"
              size="xs"
              weight="semiBold"
              style={{ color: tokens.textPrimary }}
            />
            <Text
              text={`You'll be notified when ${previewEmployer.name} approves you.`}
              size="xxs"
              style={{ color: tokens.textSecondary }}
            />
          </View>
        </View>
      ) : null}
    </View>
  )
}

function CodeBoxes({ code }: { code: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.codeRow}>
      {Array.from({ length: 6 }).map((_, index) => {
        const filled = index < code.length
        return (
          <View
            key={index}
            style={[
              styles.codeBox,
              {
                backgroundColor: filled ? tokens.accentSoft : tokens.background,
                borderColor: filled ? tokens.textPrimary : tokens.border,
              },
            ]}
          >
            <Text
              text={code[index] ?? ""}
              weight="bold"
              style={[onboardingStyles.metricValue, { color: tokens.textPrimary }]}
            />
          </View>
        )
      })}
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
  codeBox: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    height: 56,
    justifyContent: "center",
    width: 44,
  },
  codeRow: {
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
  },
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
  helperText: {
    textAlign: "center",
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
