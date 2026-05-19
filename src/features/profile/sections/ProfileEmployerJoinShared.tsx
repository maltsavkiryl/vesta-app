/* eslint-disable react-native/no-inline-styles */

import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import type { Employer } from "@/core/models"
import { TimeHeroCard, timeHeroColors } from "@/features/time/components/TimeHeroCard"
import { AppButton, AppSegmentedControl, SurfaceCard, Text } from "@/ui"
import type { DesignTokens } from "@/ui"

import type { JoinMode } from "./ProfileSectionShared"

export function JoinModeHero({
  joinMode,
  tokens: _tokens,
}: {
  joinMode: JoinMode
  tokens: DesignTokens
}) {
  const mutedText = timeHeroColors.secondaryText
  const faintText = timeHeroColors.tertiaryText
  const panelColor = "rgba(255, 255, 255, 0.08)"

  return (
    <TimeHeroCard
      contentStyle={styles.joinModeContent}
      gradientVariant="compact"
      style={styles.joinModeCard}
    >
      <View style={styles.joinModeTop}>
        <View style={styles.joinModeCopy}>
          <Text
            text="JOIN WORKPLACE"
            size="xxs"
            weight="semiBold"
            style={[styles.joinModeEyebrow, { color: faintText }]}
          />
          <Text
            text={joinMode === "code" ? "Enter an invite code" : "Find your next employer"}
            size="lg"
            weight="bold"
            style={{ color: timeHeroColors.primaryText }}
          />
          <Text
            text={
              joinMode === "code"
                ? "Use the invite code your manager shared to connect with the right workplace instantly."
                : "Browse open workplaces and choose the one you want to join."
            }
            size="xs"
            style={{ color: mutedText }}
          />
        </View>
        <View style={[styles.joinModeIcon, { backgroundColor: panelColor }]}>
          <Ionicons
            color={timeHeroColors.primaryText}
            name={joinMode === "code" ? "key-outline" : "search-outline"}
            size={18}
          />
        </View>
      </View>
    </TimeHeroCard>
  )
}

export function JoinModePicker({
  joinMode,
  onChangeMode,
  tokens,
}: {
  joinMode: JoinMode
  onChangeMode: (mode: JoinMode) => void
  tokens: DesignTokens
}) {
  return (
    <SurfaceCard elevated style={styles.modePickerCard}>
      <Text
        text="Choose how you want to join"
        size="xs"
        weight="semiBold"
        style={{ color: tokens.textPrimary }}
      />
      <AppSegmentedControl
        onChange={onChangeMode}
        options={[
          { label: "Invite code", value: "code" },
          { label: "Search", value: "search" },
        ]}
        style={styles.joinModeControl}
        value={joinMode}
      />
    </SurfaceCard>
  )
}

export function JoinSuccessCard({
  joinedEmployer,
  router,
  tokens,
}: {
  joinedEmployer: Employer
  router: ReturnType<typeof useRouter>
  tokens: DesignTokens
}) {
  return (
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
  )
}

const styles = StyleSheet.create({
  joinModeCard: {
    borderRadius: 22,
  },
  joinModeContent: {
    gap: 0,
  },
  joinModeControl: {
    borderCurve: "continuous",
    borderRadius: 10,
  },
  joinModeCopy: {
    flex: 1,
    gap: 4,
  },
  joinModeEyebrow: {
    letterSpacing: 0.4,
  },
  joinModeIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  joinModeTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
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
  modePickerCard: {
    gap: 10,
    padding: 14,
  },
})
