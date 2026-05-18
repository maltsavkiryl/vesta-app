/* eslint-disable react-native/no-inline-styles */

import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { GroupedSection, SelectionCard, Text, useDesignTokens } from "@/ui"

export type SectionKey =
  | "personal"
  | "contact"
  | "address"
  | "appearance"
  | "preferences"
  | "language"
  | "employers"
  | "join-employer"
  | "banking"
  | "legal"
  | "security"
  | "privacy"
  | "support"

export const LANGUAGE_OPTIONS = ["English (UK)", "Nederlands", "Français"] as const
export type JoinMode = "code" | "search"

export function SectionFooter({ text }: { text: string }) {
  const tokens = useDesignTokens()
  return <Text text={text} size="xxs" style={[styles.sectionFooter, { color: tokens.textMuted }]} />
}

export function ThemeOption({
  icon,
  label,
  onPress,
  selected,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  selected: boolean
}) {
  const tokens = useDesignTokens()

  return (
    <SelectionCard
      icon={
        <Ionicons color={selected ? tokens.accent : tokens.textSecondary} name={icon} size={21} />
      }
      onPress={onPress}
      selected={selected}
      style={styles.themeOption}
      subtitle={selected ? "Selected" : undefined}
      title={label}
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
      <View style={styles.themeGrid}>
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
          />
        ))}
      </View>
    </GroupedSection>
  )
}

const styles = StyleSheet.create({
  sectionFooter: {
    paddingHorizontal: 4,
  },
  themeGrid: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  themeOption: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    minHeight: 84,
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
})
