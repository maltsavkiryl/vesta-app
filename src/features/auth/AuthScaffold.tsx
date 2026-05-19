import { PropsWithChildren, ReactNode, useMemo } from "react"
import { StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { AppScrollScreen, Banner, Text, appTypography, useDesignTokens } from "@/ui"

export function AuthScaffold({
  children,
  footer,
  scrollEnabled = true,
  subtitle,
  title,
}: PropsWithChildren<{
  footer?: ReactNode
  scrollEnabled?: boolean
  subtitle: string
  title: string
}>) {
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const palette = useMemo(() => getAuthPalette(tokens), [tokens])

  const contentContainerStyle = useMemo(
    () => [
      styles.screen,
      {
        backgroundColor: palette.canvas,
        paddingTop: insets.top + 52,
      },
    ],
    [insets.top, palette.canvas],
  )

  return (
    <AppScrollScreen
      alwaysBounceVertical={scrollEnabled}
      contentContainerStyle={contentContainerStyle}
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={scrollEnabled}
      style={{ backgroundColor: palette.canvas }}
    >
      <View style={styles.hero}>
        <View style={[styles.ringLarge, { borderColor: palette.ringLarge }]} />
        <View style={[styles.ringMedium, { borderColor: palette.ringMedium }]} />
        <View style={[styles.ringSmall, { borderColor: palette.ringSmall }]} />
        <VestaMark palette={palette} />
        <View style={styles.heroCopy}>
          <Text
            text={title}
            weight="bold"
            style={[appTypography.authHeroTitle, { color: palette.heroText }]}
          />
          <Text text={subtitle} size="xs" style={{ color: palette.heroSubtitle }} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: tokens.surfaceSecondary }]}>
        {children}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </AppScrollScreen>
  )
}

function VestaMark({ palette }: { palette: ReturnType<typeof getAuthPalette> }) {
  return (
    <View style={[styles.mark, { backgroundColor: palette.markBackground }]}>
      <View style={[styles.markLineOuter, { borderColor: palette.heroText }]} />
      <View style={[styles.markLineInner, { borderColor: palette.markInner }]} />
    </View>
  )
}

export function AuthError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <Banner tone="danger">
      <Text text={message} size="xxs" />
    </Banner>
  )
}

function getAuthPalette(tokens: ReturnType<typeof useDesignTokens>) {
  const heroText = tokens.accentForeground

  return {
    canvas: tokens.isDark ? tokens.backgroundMuted : tokens.textPrimary,
    heroSubtitle: tokens.isDark ? tokens.heroTextMuted : `${heroText}6B`,
    heroText: tokens.isDark ? tokens.heroText : heroText,
    markBackground: `${heroText}1F`,
    markInner: `${heroText}8C`,
    ringLarge: `${heroText}08`,
    ringMedium: `${heroText}0A`,
    ringSmall: `${heroText}0D`,
  }
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
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    overflow: "hidden",
    width: 52,
  },
  markLineInner: {
    borderBottomWidth: 0,
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
    borderLeftWidth: 3,
    borderRightWidth: 3,
    height: 28,
    transform: [{ rotate: "45deg" }],
    width: 28,
  },
  ringLarge: {
    borderRadius: 170,
    borderWidth: 1,
    height: 340,
    position: "absolute",
    right: 20,
    top: -60,
    width: 340,
  },
  ringMedium: {
    borderRadius: 140,
    borderWidth: 1,
    height: 280,
    position: "absolute",
    right: 50,
    top: 0,
    width: 280,
  },
  ringSmall: {
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
