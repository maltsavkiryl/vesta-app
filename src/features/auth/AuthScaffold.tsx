import { PropsWithChildren, ReactNode, useMemo } from "react"
import { StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { AppScrollScreen, Banner, Text, useDesignTokens } from "@/ui"

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
  const screenStyle = useMemo(() => ({ backgroundColor: palette.canvas }), [palette.canvas])
  const titleStyle = useMemo(() => [styles.title, { color: palette.heroText }], [palette.heroText])
  const subtitleStyle = useMemo(() => ({ color: palette.heroSubtitle }), [palette.heroSubtitle])
  const cardStyle = useMemo(
    () => [styles.card, { backgroundColor: tokens.surfaceSecondary }],
    [tokens.surfaceSecondary],
  )
  const ringLargeStyle = useMemo(
    () => [styles.ringLarge, { borderColor: palette.ringLarge }],
    [palette.ringLarge],
  )
  const ringMediumStyle = useMemo(
    () => [styles.ringMedium, { borderColor: palette.ringMedium }],
    [palette.ringMedium],
  )
  const ringSmallStyle = useMemo(
    () => [styles.ringSmall, { borderColor: palette.ringSmall }],
    [palette.ringSmall],
  )

  return (
    <AppScrollScreen
      alwaysBounceVertical={scrollEnabled}
      contentContainerStyle={contentContainerStyle}
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={scrollEnabled}
      style={screenStyle}
    >
      <View style={styles.hero}>
        <View style={ringLargeStyle} />
        <View style={ringMediumStyle} />
        <View style={ringSmallStyle} />
        <VestaMark palette={palette} />
        <View style={styles.heroCopy}>
          <Text text={title} weight="bold" style={titleStyle} />
          <Text text={subtitle} size="xs" style={subtitleStyle} />
        </View>
      </View>

      <View style={cardStyle}>
        {children}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </AppScrollScreen>
  )
}

function VestaMark({ palette }: { palette: ReturnType<typeof getAuthPalette> }) {
  const markStyle = useMemo(
    () => [styles.mark, { backgroundColor: palette.markBackground }],
    [palette.markBackground],
  )
  const outerLineStyle = useMemo(
    () => [styles.markLineOuter, { borderColor: palette.heroText }],
    [palette.heroText],
  )
  const innerLineStyle = useMemo(
    () => [styles.markLineInner, { borderColor: palette.markInner }],
    [palette.markInner],
  )

  return (
    <View style={markStyle}>
      <View style={outerLineStyle} />
      <View style={innerLineStyle} />
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
    heroSubtitle: `${heroText}6B`,
    heroText,
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
  title: {
    fontSize: 34,
    lineHeight: 39,
  },
})
