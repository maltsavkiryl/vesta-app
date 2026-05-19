import { Alert, Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import type { Employer } from "@/core/models"
import { GroupedSection, ListRow, StatusBadge, Text } from "@/ui"
import type { DesignTokens } from "@/ui"

import { EmployerInitialBadge } from "./ProfileEmployerShared"

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
      <EmployerInitialBadge
        backgroundColor={active ? tokens.accent : tokens.textPrimary}
        name={name}
      />
      <View style={styles.employerCopy}>
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
  employerCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
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
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    marginTop: 3,
  },
  switchPill: {
    borderCurve: "continuous",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
})
