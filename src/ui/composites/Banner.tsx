import { PropsWithChildren, ReactNode } from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { getTonePalette, type Emphasis, type Tone } from "@/ui/foundations/variants"
import { useDesignTokens } from "@/ui/foundations/tokens"
import { Text } from "@/ui/primitives/Text"

export function Banner({
  children,
  emphasis = "soft",
  icon,
  onPress,
  title,
  tone = "neutral",
  trailing,
}: PropsWithChildren<{
  emphasis?: Emphasis
  icon?: ReactNode
  onPress?: () => void
  title?: string
  tone?: Tone
  trailing?: ReactNode
}>) {
  const tokens = useDesignTokens()
  const palette = getTonePalette(tokens, tone, emphasis)
  const Wrapper = onPress ? Pressable : View

  return (
    <Wrapper
      {...(onPress ? { onPress } : undefined)}
      style={[
        styles.container,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
      ]}
    >
      {icon}
      <View style={styles.copy}>
        {title ? (
          <Text text={title} size="xxs" weight="semiBold" style={{ color: palette.color }} />
        ) : null}
        {children ? (
          typeof children === "string" ? (
            <Text text={children} size="xxs" style={{ color: palette.color }} />
          ) : (
            children
          )
        ) : null}
      </View>
      {trailing}
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
})
