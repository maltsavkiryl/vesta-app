/* eslint-disable react-native/no-inline-styles */

import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { SelectionRow, Text, useDesignTokens } from "@/ui"

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
  const backgroundColor = selected ? tokens.accentSoft : tokens.surface

  return (
    <SelectionRow
      leading={
        <View
          style={[
            styles.themeOptionIcon,
            { backgroundColor: selected ? tokens.accentSoft : tokens.surfaceSecondary },
          ]}
        >
          <Ionicons
            color={selected ? tokens.accent : tokens.textSecondary}
            name={icon}
            size={21}
          />
        </View>
      }
      onPress={onPress}
      selected={selected}
      style={styles.themeOption}
      subtitle={selected ? "Selected" : "Use this appearance"}
      title={label}
      trailing={
        selected ? <Ionicons color={tokens.accent} name="checkmark-outline" size={18} /> : null
      }
      backgroundColor={backgroundColor}
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
  const tokens = useDesignTokens()

  return (
    <View style={styles.appearanceSection}>
      <Text
        text="Appearance"
        size="xxs"
        weight="semiBold"
        style={[styles.sectionLabel, { color: tokens.textMuted }]}
      />
      <View style={styles.themeList}>
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
    </View>
  )
}

const styles = StyleSheet.create({
  appearanceSection: {
    gap: 10,
  },
  sectionFooter: {
    paddingHorizontal: 4,
  },
  sectionLabel: {
    letterSpacing: 0,
  },
  themeOption: {
    borderRadius: 16,
    minHeight: 72,
  },
  themeOptionIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  themeList: {
    gap: 10,
  },
})
