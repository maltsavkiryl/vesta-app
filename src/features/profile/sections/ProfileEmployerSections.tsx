/* eslint-disable react-native/no-inline-styles */

import { Alert, Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import type { Employer } from "@/core/models"
import {
  AppButton,
  AppSegmentedControl,
  GroupedSection,
  ListRow,
  MetricGrid,
  StatusBadge,
  Text,
  TextField,
  useDesignTokens,
} from "@/ui"
import type { DesignTokens } from "@/ui"

import type { JoinMode } from "./ProfileSectionShared"

function getEmployerInitial(name: string) {
  return name.slice(0, 1).toUpperCase()
}

export function switchEmployerWithConfirmation({
  employerId,
  employers,
  router,
  switchEmployer,
}: {
  employerId: string
  employers: Employer[]
  router: ReturnType<typeof useRouter>
  switchEmployer: (employerId: string) => void
}) {
  const employer = employers.find((candidate) => candidate.id === employerId)
  if (!employer || employer.active) return

  Alert.alert(
    `Switch to ${employer.name}?`,
    "Your schedule and time tracking will update accordingly.",
    [
      { style: "cancel", text: "Cancel" },
      {
        text: "Switch",
        onPress: () => {
          switchEmployer(employerId)
          router.replace("/profile/employers")
        },
      },
    ],
  )
}

export function EmployerSwitchCard({
  active,
  city,
  name,
  onPress,
  rating,
  tokens,
  type,
}: {
  active: boolean
  city: string
  name: string
  onPress: () => void
  rating: number
  tokens: DesignTokens
  type: string
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={active}
      onPress={onPress}
      style={({ pressed }) => [
        styles.employerSwitchCard,
        {
          backgroundColor: tokens.surface,
          borderColor: active ? tokens.accent : tokens.transparent,
          opacity: pressed ? 0.72 : 1,
          shadowColor: tokens.shadow,
        },
      ]}
    >
      <View
        style={[
          styles.employerInitial,
          { backgroundColor: active ? tokens.accent : tokens.textPrimary },
        ]}
      >
        <Text
          text={getEmployerInitial(name)}
          size="sm"
          weight="bold"
          style={{ color: tokens.accentForeground }}
        />
      </View>
      <View style={styles.employerSwitchCopy}>
        <Text text={name} size="xs" weight="semiBold" style={{ color: tokens.textPrimary }} />
        <Text text={`${type} - ${city}`} size="xxs" style={{ color: tokens.textSecondary }} />
        <View style={styles.ratingRow}>
          <Ionicons color={tokens.warning} name="star" size={11} />
          <Text text={String(rating)} size="xxs" style={{ color: tokens.textSecondary }} />
        </View>
      </View>
      {active ? (
        <View style={styles.activeStatus}>
          <View style={[styles.activeDot, { backgroundColor: tokens.success }]} />
          <Text text="Active" size="xxs" weight="semiBold" style={{ color: tokens.success }} />
        </View>
      ) : (
        <View
          style={[
            styles.switchPill,
            { backgroundColor: tokens.backgroundMuted, borderColor: tokens.border },
          ]}
        >
          <Text text="Switch" size="xxs" weight="medium" style={{ color: tokens.textSecondary }} />
        </View>
      )}
    </Pressable>
  )
}

export function EmployerPreviewCard({
  employer,
  onJoin,
}: {
  employer: Employer
  onJoin: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <View
      style={[
        styles.joinPreviewCard,
        {
          backgroundColor: tokens.surface,
          borderColor: tokens.accent,
          shadowColor: tokens.shadow,
        },
      ]}
    >
      <View style={styles.joinPreviewHeader}>
        <View style={[styles.employerInitial, { backgroundColor: tokens.accent }]}>
          <Text
            text={getEmployerInitial(employer.name)}
            size="sm"
            weight="bold"
            style={{ color: tokens.accentForeground }}
          />
        </View>
        <View style={styles.employerSwitchCopy}>
          <Text
            text={employer.name}
            size="sm"
            weight="semiBold"
            style={{ color: tokens.textPrimary }}
          />
          <Text
            text={`${employer.type} - ${employer.city}`}
            size="xxs"
            style={{ color: tokens.textSecondary }}
          />
        </View>
        <View style={styles.ratingRow}>
          <Ionicons color={tokens.warning} name="star" size={13} />
          <Text
            text={String(employer.rating)}
            size="xxs"
            weight="medium"
            style={{ color: tokens.textPrimary }}
          />
        </View>
      </View>
      <MetricGrid
        items={[
          { label: "People", value: String(employer.teamSize) },
          { label: "Status", value: "Hiring" },
          { label: "Type", value: employer.type },
        ]}
      />
      <AppButton label="Request to join" onPress={onJoin} />
    </View>
  )
}

export function EmployersSection({
  availableEmployers,
  employers,
  onJoinEmployer,
  onOpenJoinEmployer,
  onSwitchEmployer,
  tokens,
}: {
  availableEmployers: Employer[]
  employers: Employer[]
  onJoinEmployer: (employerId: string) => void
  onOpenJoinEmployer: () => void
  onSwitchEmployer: (employerId: string) => void
  tokens: DesignTokens
}) {
  return (
    <>
      <GroupedSection actionLabel="Join" title="Linked workplaces" onAction={onOpenJoinEmployer}>
        {employers.map((employer, index) => (
          <ListRow
            key={employer.id}
            title={employer.name}
            subtitle={`${employer.type} - ${employer.city} - ${employer.teamSize} people`}
            isLast={index === employers.length - 1}
            onPress={() => onSwitchEmployer(employer.id)}
            leading={<Ionicons color={tokens.accent} name="business-outline" size={18} />}
            trailing={
              <StatusBadge
                label={employer.active ? "Active" : "Linked"}
                tone={employer.active ? "success" : "neutral"}
              />
            }
          />
        ))}
      </GroupedSection>

      {availableEmployers.length > 0 ? (
        <GroupedSection
          actionLabel="Search"
          title="Available invitations"
          onAction={onOpenJoinEmployer}
        >
          {availableEmployers.map((employer, index) => (
            <ListRow
              key={employer.id}
              title={employer.name}
              subtitle={`${employer.type} - ${employer.city}`}
              isLast={index === availableEmployers.length - 1}
              onPress={() => onJoinEmployer(employer.id)}
              leading={
                <Ionicons color={tokens.textSecondary} name="add-circle-outline" size={18} />
              }
              trailing={
                <Text text="Join" size="xs" weight="semiBold" style={{ color: tokens.accent }} />
              }
            />
          ))}
        </GroupedSection>
      ) : null}
    </>
  )
}

export function JoinEmployerSection(props: {
  availableEmployers: Employer[]
  codeMatchedEmployer?: Employer
  joinCode: string
  joinedEmployer?: Employer
  joinMode: JoinMode
  joinSearch: string
  onChangeMode: (mode: JoinMode) => void
  onChangeSearch: (value: string) => void
  onJoinSelectedEmployer: () => void
  onSetJoinCode: (value: string) => void
  onSelectEmployer: (employerId: string) => void
  router: ReturnType<typeof useRouter>
  searchResults: Employer[]
  selectedJoinEmployer?: Employer
  selectedJoinEmployerId?: string
  tokens: DesignTokens
}) {
  const {
    availableEmployers,
    codeMatchedEmployer,
    joinCode,
    joinedEmployer,
    joinMode,
    joinSearch,
    onChangeMode,
    onChangeSearch,
    onJoinSelectedEmployer,
    onSelectEmployer,
    onSetJoinCode,
    router,
    searchResults,
    selectedJoinEmployer,
    selectedJoinEmployerId,
    tokens,
  } = props

  return (
    <>
      <AppSegmentedControl
        onChange={onChangeMode}
        options={[
          { label: "Invite code", value: "code" },
          { label: "Search", value: "search" },
        ]}
        style={styles.joinModeControl}
        value={joinMode}
      />

      {joinMode === "code" ? (
        <GroupedSection title="Invite code">
          <View style={styles.joinCodeContent}>
            <Text
              text="Ask your manager for the workplace invite code."
              size="xs"
              style={{ color: tokens.textSecondary, textAlign: "center" }}
            />
            <TextField
              autoCapitalize="characters"
              autoCorrect={false}
              containerStyle={styles.joinCodeField}
              inputStyle={styles.joinCodeInput}
              label="Invite code"
              labelCase="default"
              maxLength={6}
              onChangeText={onSetJoinCode}
              placeholder={availableEmployers[0]?.code ?? "ABC123"}
              value={joinCode}
            />
            <Text
              text={
                joinCode.length === 0
                  ? "Enter a 6-character code"
                  : joinCode.length < 6
                    ? `${6 - joinCode.length} more`
                    : codeMatchedEmployer
                      ? `Found: ${codeMatchedEmployer.name}`
                      : "No employer found for this code"
              }
              size="xxs"
              style={{
                color:
                  joinCode.length === 6 && codeMatchedEmployer ? tokens.success : tokens.textMuted,
                textAlign: "center",
              }}
            />
          </View>
        </GroupedSection>
      ) : null}

      {joinMode === "search" ? (
        <>
          <TextField
            autoCapitalize="words"
            label="Search"
            labelCase="default"
            leftAccessory={<Ionicons color={tokens.textMuted} name="search-outline" size={16} />}
            onChangeText={onChangeSearch}
            placeholder="Search by name, type or city"
            value={joinSearch}
          />

          <GroupedSection title="Results">
            {searchResults.length > 0 ? (
              searchResults.map((employer, index) => {
                const selected = selectedJoinEmployerId === employer.id

                return (
                  <ListRow
                    key={employer.id}
                    title={employer.name}
                    subtitle={`${employer.type} - ${employer.city}`}
                    isLast={index === searchResults.length - 1}
                    onPress={() => onSelectEmployer(employer.id)}
                    leading={
                      <View
                        style={[
                          styles.searchInitial,
                          { backgroundColor: selected ? tokens.accent : tokens.textPrimary },
                        ]}
                      >
                        <Text
                          text={getEmployerInitial(employer.name)}
                          size="xxs"
                          weight="bold"
                          style={{ color: tokens.accentForeground }}
                        />
                      </View>
                    }
                    trailing={
                      selected ? (
                        <Ionicons color={tokens.accent} name="checkmark-circle" size={20} />
                      ) : (
                        <View style={styles.searchMeta}>
                          <View style={styles.ratingRow}>
                            <Ionicons color={tokens.warning} name="star" size={11} />
                            <Text
                              text={String(employer.rating)}
                              size="xxs"
                              style={{ color: tokens.textSecondary }}
                            />
                          </View>
                          <Text
                            text={`${employer.teamSize} staff`}
                            size="xxs"
                            style={{ color: tokens.textMuted }}
                          />
                        </View>
                      )
                    }
                  />
                )
              })
            ) : (
              <View style={styles.emptyJoinState}>
                <Text
                  text={`No results${joinSearch ? ` for "${joinSearch}"` : ""}`}
                  size="xs"
                  weight="medium"
                  style={{ color: tokens.textPrimary, textAlign: "center" }}
                />
                <Text
                  text="Try a different search term or ask your manager for an invite code."
                  size="xxs"
                  style={{ color: tokens.textMuted, textAlign: "center" }}
                />
              </View>
            )}
          </GroupedSection>
        </>
      ) : null}

      {selectedJoinEmployer && !joinedEmployer ? (
        <EmployerPreviewCard employer={selectedJoinEmployer} onJoin={onJoinSelectedEmployer} />
      ) : null}

      {joinedEmployer ? (
        <View
          style={[
            styles.joinSuccess,
            { backgroundColor: tokens.successSoft, borderColor: `${tokens.success}33` },
          ]}
        >
          <View style={[styles.joinSuccessIcon, { backgroundColor: tokens.successSoft }]}>
            <Ionicons color={tokens.success} name="checkmark-circle-outline" size={34} />
          </View>
          <Text
            text="Request sent"
            size="sm"
            weight="bold"
            style={{ color: tokens.textPrimary, textAlign: "center" }}
          />
          <Text
            text={`You'll be notified when ${joinedEmployer.name} approves your request.`}
            size="xs"
            style={{ color: tokens.textSecondary, textAlign: "center" }}
          />
          <AppButton
            label="Done"
            variant="secondary"
            onPress={() => router.replace("/profile/employers")}
          />
        </View>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  activeDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  activeStatus: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  employerInitial: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 13,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  employerSwitchCard: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 13,
    minHeight: 74,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
  },
  employerSwitchCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  emptyJoinState: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  joinCodeContent: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  joinCodeField: {
    width: "100%",
  },
  joinCodeInput: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 2,
    minHeight: 30,
    textAlign: "center",
  },
  joinModeControl: {
    borderCurve: "continuous",
    borderRadius: 10,
  },
  joinPreviewCard: {
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
  },
  joinPreviewHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  joinSuccess: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 24,
  },
  joinSuccessIcon: {
    alignItems: "center",
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    marginTop: 3,
  },
  searchInitial: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 11,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  searchMeta: {
    alignItems: "flex-end",
    gap: 2,
  },
  switchPill: {
    borderCurve: "continuous",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
})
