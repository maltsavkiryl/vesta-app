import { useMemo } from "react"
import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import SegmentedControl from "@react-native-segmented-control/segmented-control"

import type { Employer } from "@/core/models"
import { TimeHeroCard, timeHeroColors } from "@/features/time/components/TimeHeroCard"
import { AppButton, Text } from "@/ui"
import type { DesignTokens } from "@/ui"

import type { JoinMode } from "./ProfileSectionShared"

export function JoinModeHero({ joinMode, tokens }: { joinMode: JoinMode; tokens: DesignTokens }) {
  const mutedText = timeHeroColors.secondaryText
  const faintText = timeHeroColors.tertiaryText
  const panelColor = `${timeHeroColors.primaryText}14`
  const eyebrowStyle = useMemo(() => [styles.joinModeEyebrow, { color: faintText }], [faintText])
  const titleStyle = useMemo(() => ({ color: timeHeroColors.primaryText }), [])
  const subtitleStyle = useMemo(() => ({ color: mutedText }), [mutedText])
  const iconContainerStyle = useMemo(
    () => [styles.joinModeIcon, { backgroundColor: panelColor }],
    [panelColor],
  )
  const cardStyle = useMemo(
    () => [styles.joinModeCard, { borderColor: tokens.border }],
    [tokens.border],
  )

  return (
    <TimeHeroCard contentStyle={styles.joinModeContent} gradientVariant="compact" style={cardStyle}>
      <View style={styles.joinModeTop}>
        <View style={styles.joinModeCopy}>
          <Text text="JOIN WORKPLACE" size="xxs" weight="semiBold" style={eyebrowStyle} />
          <Text
            text={joinMode === "code" ? "Enter an invite code" : "Find your next employer"}
            size="lg"
            weight="bold"
            style={titleStyle}
          />
          <Text
            text={
              joinMode === "code"
                ? "Use the invite code your manager shared to connect with the right workplace instantly."
                : "Browse open workplaces and choose the one you want to join."
            }
            size="xs"
            style={subtitleStyle}
          />
        </View>
        <View style={iconContainerStyle}>
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
  const options: { label: string; value: JoinMode }[] = [
    { label: "Invite code", value: "code" },
    { label: "Search", value: "search" },
  ]
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === joinMode),
    0,
  )

  return (
    <View style={styles.modePickerCard}>
      <Text
        text="Choose how you want to join"
        size="xs"
        weight="semiBold"
        style={{ color: tokens.textPrimary }}
      />
      <SegmentedControl
        appearance={tokens.isDark ? "dark" : "light"}
        onChange={(event) => {
          const nextOption = options[event.nativeEvent.selectedSegmentIndex]
          if (!nextOption) return
          onChangeMode(nextOption.value)
        }}
        selectedIndex={selectedIndex}
        values={options.map((option) => option.label)}
      />
    </View>
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
  const successCardStyle = useMemo(
    () => [
      styles.joinSuccess,
      { backgroundColor: tokens.successSoft, borderColor: `${tokens.success}33` },
    ],
    [tokens.success, tokens.successSoft],
  )
  const successIconStyle = useMemo(
    () => [styles.joinSuccessIcon, { backgroundColor: tokens.successSoft }],
    [tokens.successSoft],
  )
  const titleStyle = useMemo(
    () => ({ color: tokens.textPrimary, textAlign: "center" as const }),
    [tokens.textPrimary],
  )
  const bodyStyle = useMemo(
    () => ({ color: tokens.textSecondary, textAlign: "center" as const }),
    [tokens.textSecondary],
  )

  return (
    <View style={successCardStyle}>
      <View style={successIconStyle}>
        <Ionicons color={tokens.success} name="checkmark-circle-outline" size={34} />
      </View>
      <Text text="Request sent" size="sm" weight="bold" style={titleStyle} />
      <Text
        text={`You'll be notified when ${joinedEmployer.name} approves your request.`}
        size="xs"
        style={bodyStyle}
      />
      <AppButton
        label="Done"
        variant="secondary"
        onPress={() => {
          if (router.canGoBack()) {
            router.back()
            return
          }

          router.replace("/profile/employers")
        }}
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
  },
})
