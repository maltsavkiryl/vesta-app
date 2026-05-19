import { type ErrorInfo } from "react"
import { ScrollView, type TextStyle, View, type ViewStyle } from "react-native"

import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { AppButton } from "@/ui/composites/AppPrimitives"
import { Icon } from "@/ui/primitives/Icon"
import { Screen } from "@/ui/primitives/Screen"
import { Text } from "@/ui/primitives/Text"

export interface ErrorDetailsProps {
  error: Error
  errorInfo: ErrorInfo | null
  onReset(): void
}

export function ErrorDetails(props: ErrorDetailsProps) {
  const { themed } = useAppTheme()

  return (
    <Screen
      contentContainerStyle={themed(contentContainer)}
      preset="fixed"
      safeAreaEdges={["top", "bottom"]}
    >
      <View style={topSection}>
        <Icon icon="ladybug" size={64} />
        <Text preset="subheading" style={themed(heading)} tx="errorScreen:title" />
        <Text tx="errorScreen:friendlySubtitle" />
      </View>

      <ScrollView
        contentContainerStyle={themed(errorSectionContentContainer)}
        style={themed(errorSection)}
      >
        <Text style={themed(errorContent)} text={`${props.error}`.trim()} weight="bold" />
        <Text
          selectable
          style={themed(errorBacktrace)}
          text={`${props.errorInfo?.componentStack ?? ""}`.trim()}
        />
      </ScrollView>

      <AppButton label={translate("errorScreen:reset")} onPress={props.onReset} variant="danger" />
    </Screen>
  )
}

const contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flex: 1,
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
})

const topSection: ViewStyle = {
  alignItems: "center",
  flex: 1,
}

const heading: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.md,
})

const errorSection: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.separator,
  borderRadius: 6,
  flex: 2,
  marginVertical: spacing.md,
})

const errorSectionContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
})

const errorContent: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
})

const errorBacktrace: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.md,
})
