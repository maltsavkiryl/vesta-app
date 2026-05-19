import { useMemo } from "react"
import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { Button, Host, Image, Menu } from "@expo/ui/swift-ui"
import { background, foregroundStyle, padding, shadow, shapes } from "@expo/ui/swift-ui/modifiers"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { requestCategoryConfig, requestCategoryOrder } from "@/features/schedule/requestCategories"
import { useDesignTokens } from "@/ui"

const IOS_TAB_BAR_HEIGHT = 49
const FLOATING_BUTTON_GAP = 12

export function RequestComposeAccessory() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const tokens = useDesignTokens()
  const positionStyle = useMemo(
    () => ({ bottom: insets.bottom + IOS_TAB_BAR_HEIGHT + FLOATING_BUTTON_GAP }),
    [insets.bottom],
  )

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, styles.horizontalOffset, positionStyle]}
    >
      <Host matchContents>
        <Menu
          label={
            <Image
              color="#FFFFFF"
              modifiers={[
                padding({ all: 16 }),
                background(tokens.accent, shapes.circle()),
                shadow({ color: "#00000033", radius: 16, y: 8 }),
              ]}
              size={22}
              systemName="plus"
            />
          }
          modifiers={[foregroundStyle(tokens.textPrimary)]}
        >
          {requestCategoryOrder.map((category) => {
            const option = requestCategoryConfig[category]

            return (
              <Button
                key={category}
                label={option.title}
                onPress={() => {
                  router.push(`/(app)/request?category=${category}` as never)
                }}
                systemImage={option.systemImage}
              />
            )
          })}
        </Menu>
      </Host>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    position: "absolute",
  },
  horizontalOffset: {
    right: 20,
  },
})
