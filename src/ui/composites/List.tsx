import { PropsWithChildren, ReactNode } from "react"
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native"

import { useDesignTokens } from "@/ui/foundations/tokens"
import { Text } from "@/ui/primitives/Text"

import { SurfaceCard } from "./AppPrimitives"
import { MotionView } from "./app-motion"
import { SectionTitle } from "./SectionTitle"

export function SectionBlock({
  actionLabel,
  badgeLabel,
  children,
  motionDelay = 0,
  onAction,
  trailing,
  title,
}: PropsWithChildren<{
  actionLabel?: string
  badgeLabel?: string
  motionDelay?: number
  onAction?: () => void
  trailing?: ReactNode
  title: string
}>) {
  return (
    <MotionView delay={motionDelay} style={styles.section}>
      <SectionTitle
        actionLabel={actionLabel}
        badgeLabel={badgeLabel}
        onAction={onAction}
        trailing={trailing}
        title={title}
        titleSize="sm"
      />
      {children}
    </MotionView>
  )
}

export function ListCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <SurfaceCard style={[styles.card, style]}>{children}</SurfaceCard>
}

export function ListCardItem({
  isLast,
  leading,
  onPress,
  style,
  subtitle,
  subtitleStyle,
  title,
  titleStyle,
  trailing,
}: {
  isLast?: boolean
  leading?: ReactNode
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  subtitle?: string
  subtitleStyle?: StyleProp<any>
  title: string
  titleStyle?: StyleProp<any>
  trailing?: ReactNode
}) {
  const tokens = useDesignTokens()
  const Wrapper = onPress ? Pressable : View

  return (
    <Wrapper
      {...(onPress ? { onPress } : undefined)}
      style={[
        styles.row,
        style,
        !isLast && {
          borderBottomColor: tokens.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      {leading}
      <View style={styles.copy}>
        <Text text={title} numberOfLines={1} size="xs" weight="medium" style={titleStyle} />
        {subtitle ? (
          <Text text={subtitle} numberOfLines={1} size="xxs" style={subtitleStyle} />
        ) : null}
      </View>
      {trailing}
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  card: {
    borderCurve: "continuous",
    borderRadius: 16,
    gap: 0,
    overflow: "hidden",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 61,
    paddingLeft: 14,
    paddingRight: 12,
    paddingVertical: 13,
  },
  section: {
    gap: 10,
  },
})
