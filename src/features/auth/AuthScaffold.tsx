/* eslint-disable react-native/no-color-literals, react-native/no-inline-styles */

import { PropsWithChildren, ReactNode } from "react"
import { StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Text } from "@/components/Text"
import { AppScrollScreen } from "@/design-system/primitives"
import { useDesignTokens } from "@/design-system/tokens"

export function AuthScaffold({
  children,
  footer,
  subtitle,
  title,
}: PropsWithChildren<{
  footer?: ReactNode
  subtitle: string
  title: string
}>) {
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()

  return (
    <AppScrollScreen
      contentContainerStyle={[
        styles.screen,
        {
          backgroundColor: "#0D0D0F",
          paddingTop: insets.top + 52,
        },
      ]}
      style={{ backgroundColor: "#0D0D0F" }}
    >
      <View style={styles.hero}>
        <View style={styles.ringLarge} />
        <View style={styles.ringMedium} />
        <View style={styles.ringSmall} />
        <VestaMark />
        <View style={styles.heroCopy}>
          <Text
            text={title}
            weight="bold"
            style={{ color: "#FFFFFF", fontSize: 34, lineHeight: 39 }}
          />
          <Text text={subtitle} size="xs" style={{ color: "rgba(255, 255, 255, 0.42)" }} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: tokens.surfaceSecondary }]}>
        {children}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </AppScrollScreen>
  )
}

function VestaMark() {
  return (
    <View style={styles.mark}>
      <View style={styles.markLineOuter} />
      <View style={styles.markLineInner} />
    </View>
  )
}

export function AuthError({ message }: { message?: string }) {
  const tokens = useDesignTokens()

  if (!message) return null

  return (
    <View
      style={[
        styles.error,
        { backgroundColor: `${tokens.danger}10`, borderColor: `${tokens.danger}22` },
      ]}
    >
      <Text text={message} size="xxs" style={{ color: tokens.danger }} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flex: 1,
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  error: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  footer: {
    alignItems: "center",
    marginTop: 8,
  },
  hero: {
    minHeight: 250,
    overflow: "hidden",
    paddingBottom: 40,
    paddingHorizontal: 28,
  },
  heroCopy: {
    gap: 8,
    marginTop: 20,
  },
  mark: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    overflow: "hidden",
    width: 52,
  },
  markLineInner: {
    borderBottomWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.55)",
    borderLeftWidth: 2,
    borderRightWidth: 2,
    height: 18,
    position: "absolute",
    top: 14,
    transform: [{ rotate: "45deg" }],
    width: 18,
  },
  markLineOuter: {
    borderBottomWidth: 0,
    borderColor: "#FFFFFF",
    borderLeftWidth: 3,
    borderRightWidth: 3,
    height: 28,
    transform: [{ rotate: "45deg" }],
    width: 28,
  },
  ringLarge: {
    borderColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 170,
    borderWidth: 1,
    height: 340,
    position: "absolute",
    right: 20,
    top: -60,
    width: 340,
  },
  ringMedium: {
    borderColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 140,
    borderWidth: 1,
    height: 280,
    position: "absolute",
    right: 50,
    top: 0,
    width: 280,
  },
  ringSmall: {
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 100,
    borderWidth: 1,
    height: 200,
    position: "absolute",
    right: 20,
    top: 20,
    width: 200,
  },
  screen: {
    flexGrow: 1,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
})
