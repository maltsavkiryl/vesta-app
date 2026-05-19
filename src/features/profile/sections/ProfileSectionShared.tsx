import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { LANGUAGE_OPTIONS } from "@/features/profile/profileSections"
import { GroupedSection, SelectionIndicator, SelectionRow, Text, useDesignTokens } from "@/ui"

export { LANGUAGE_OPTIONS }
export type { JoinMode, SectionKey } from "@/features/profile/profileSections"

export function SectionFooter({ text }: { text: string }) {
  const tokens = useDesignTokens()
  return <Text text={text} size="xxs" style={[styles.sectionFooter, { color: tokens.textMuted }]} />
}

export function ThemeOption({
  icon,
  isLast = false,
  label,
  onPress,
  selected,
}: {
  icon: keyof typeof Ionicons.glyphMap
  isLast?: boolean
  label: string
  onPress: () => void
  selected: boolean
}) {
  const tokens = useDesignTokens()
  const subtitle = selected ? "Current appearance" : "Use this appearance"

  return (
    <SelectionRow
      leading={
        <View
          style={[
            styles.themeOptionIcon,
            { backgroundColor: selected ? tokens.accentSoft : tokens.surfaceSecondary },
          ]}
        >
          <Ionicons color={selected ? tokens.accent : tokens.textSecondary} name={icon} size={21} />
        </View>
      }
      onPress={onPress}
      selected={selected}
      style={styles.themeOption}
      subtitle={subtitle}
      title={label}
      trailing={selected ? <SelectionIndicator /> : null}
      backgroundColor={tokens.transparent}
      dividerInset={58}
      grouped
      isLast={isLast}
    />
  )
}

export function AppearanceSection({
  onSelectTheme,
  selectedTheme,
}: {
  onSelectTheme: (themePreference: "system" | "light" | "dark") => void
  selectedTheme: "system" | "light" | "dark"
}) {
  return (
    <GroupedSection title="Appearance">
      {(
        [
          { icon: "phone-portrait-outline", label: "System", value: "system" },
          { icon: "sunny-outline", label: "Light", value: "light" },
          { icon: "moon-outline", label: "Dark", value: "dark" },
        ] satisfies Array<{
          icon: keyof typeof Ionicons.glyphMap
          label: string
          value: "system" | "light" | "dark"
        }>
      ).map((themePreference) => (
        <ThemeOption
          key={themePreference.value}
          icon={themePreference.icon}
          label={themePreference.label}
          selected={selectedTheme === themePreference.value}
          onPress={() => onSelectTheme(themePreference.value)}
          isLast={themePreference.value === "dark"}
        />
      ))}
    </GroupedSection>
  )
}

export function MotionSection({
  onSelectMotionPreference,
  selectedMotionPreference,
}: {
  onSelectMotionPreference: (motionPreference: "system" | "reduced" | "full") => void
  selectedMotionPreference: "system" | "reduced" | "full"
}) {
  return (
    <GroupedSection title="Motion">
      {(
        [
          { icon: "phone-portrait-outline", label: "System", value: "system" },
          { icon: "swap-vertical-outline", label: "Reduced", value: "reduced" },
          { icon: "sparkles-outline", label: "Full", value: "full" },
        ] satisfies Array<{
          icon: keyof typeof Ionicons.glyphMap
          label: string
          value: "system" | "reduced" | "full"
        }>
      ).map((motionPreference) => (
        <ThemeOption
          key={motionPreference.value}
          icon={motionPreference.icon}
          label={motionPreference.label}
          selected={selectedMotionPreference === motionPreference.value}
          onPress={() => onSelectMotionPreference(motionPreference.value)}
          isLast={motionPreference.value === "full"}
        />
      ))}
    </GroupedSection>
  )
}

const styles = StyleSheet.create({
  sectionFooter: {
    paddingHorizontal: 4,
  },
  themeOption: {
    minHeight: 72,
    paddingHorizontal: 16,
  },
  themeOptionIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
})
