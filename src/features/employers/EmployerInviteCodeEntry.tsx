import { useRef } from "react"
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Text, useDesignTokens } from "@/ui"

import { normalizeEmployerInviteCode } from "./employerInviteCode"

export function EmployerInviteCodeEntry({
  code,
  helperText,
  onChangeCode,
  onOpenQrScanner,
}: {
  code: string
  helperText: string
  onChangeCode: (value: string) => void
  onOpenQrScanner: () => void
}) {
  const inputRef = useRef<TextInput>(null)
  const tokens = useDesignTokens()

  return (
    <View style={styles.stack}>
      <Pressable
        accessibilityLabel="Invite code input"
        accessibilityRole="button"
        onPress={() => inputRef.current?.focus()}
      >
        <View style={styles.codeRow}>
          {Array.from({ length: 6 }).map((_, index) => {
            const filled = index < code.length

            return (
              <View
                key={index}
                style={[
                  styles.codeBox,
                  {
                    backgroundColor: filled ? tokens.accentSoft : tokens.background,
                    borderColor: filled ? tokens.textPrimary : tokens.border,
                  },
                ]}
              >
                <Text
                  text={code[index] ?? ""}
                  size="lg"
                  weight="bold"
                  style={{ color: tokens.textPrimary }}
                />
              </View>
            )
          })}
        </View>
      </Pressable>

      <TextInput
        ref={inputRef}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
        onChangeText={(value) => onChangeCode(normalizeEmployerInviteCode(value))}
        selectionColor={tokens.accent}
        style={styles.hiddenInput}
        testID="employer-invite-code-hidden-input"
        value={code}
      />

      <Text
        text={helperText}
        size="xxs"
        style={[styles.helperText, { color: tokens.textMuted }]}
      />

      <Pressable
        accessibilityLabel="Scan QR code"
        accessibilityRole="button"
        onPress={onOpenQrScanner}
        style={({ pressed }) => [
          styles.qrAction,
          {
            backgroundColor: tokens.surfaceSecondary,
            borderColor: tokens.border,
            opacity: pressed ? 0.82 : 1,
          },
        ]}
      >
        <Ionicons color={tokens.accent} name="qr-code-outline" size={18} />
        <Text text="Scan QR code" size="xs" weight="semiBold" style={{ color: tokens.textPrimary }} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  codeBox: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    height: 56,
    justifyContent: "center",
    width: 44,
  },
  codeRow: {
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
  },
  helperText: {
    textAlign: "center",
  },
  hiddenInput: {
    height: 0,
    left: -9999,
    opacity: 0,
    position: "absolute",
    width: 1,
  },
  qrAction: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  stack: {
    gap: 10,
  },
})
