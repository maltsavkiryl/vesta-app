import { useMemo } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import type { PayrollProfileGap } from "@/features/profile/payrollProfile"
import type { TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import { AppButton, MotionView, SurfaceCard, Text, useDesignTokens } from "@/ui"

// Short, conversational fragments used to weave the gaps into a single sentence.
// Keep these warm and plain — they read as "Add your bank account and home address…".
const GAP_PHRASE_KEYS: Record<string, TxKeyPath> = {
  firstName: "home:payrollNudge.gaps.name",
  lastName: "home:payrollNudge.gaps.name",
  email: "home:payrollNudge.gaps.emailAddress",
  phone: "home:payrollNudge.gaps.phoneNumber",
  iban: "home:payrollNudge.gaps.bankAccount",
  ssin: "home:payrollNudge.gaps.nationalNumber",
  address: "home:payrollNudge.gaps.homeAddress",
}

function buildSubtitle(gaps: PayrollProfileGap[]): string {
  // De-duplicate phrases (first/last name both map to "name") while preserving order.
  const phrases = gaps
    .map((gap) =>
      GAP_PHRASE_KEYS[gap.key] ? translate(GAP_PHRASE_KEYS[gap.key]) : gap.label.toLowerCase(),
    )
    .filter((phrase, index, all) => all.indexOf(phrase) === index)

  let list: string
  if (phrases.length === 1) {
    list = phrases[0]
  } else if (phrases.length === 2) {
    list = translate("home:payrollNudge.listTwo", { a: phrases[0], b: phrases[1] })
  } else {
    list = translate("home:payrollNudge.listMany", {
      head: phrases.slice(0, -1).join(", "),
      last: phrases[phrases.length - 1],
    })
  }

  return translate("home:payrollNudge.subtitle", { list })
}

export function PayrollProfileNudge({
  gaps,
  onPress,
  onDismiss,
}: {
  gaps: PayrollProfileGap[]
  onPress: () => void
  onDismiss?: () => void
}) {
  const tokens = useDesignTokens()
  const subtitle = useMemo(() => buildSubtitle(gaps), [gaps])

  const cardStyle = useMemo(
    () => ({ backgroundColor: tokens.warningSoft, borderColor: tokens.warning }),
    [tokens.warning, tokens.warningSoft],
  )
  const iconBadgeStyle = useMemo(
    () => [styles.iconBadge, { backgroundColor: tokens.accentSoft }],
    [tokens.accentSoft],
  )

  const accessibilityLabel = translate("home:payrollNudge.a11y", { subtitle })

  return (
    <MotionView>
      <SurfaceCard style={[styles.card, cardStyle]}>
        <View
          accessible
          accessibilityRole="summary"
          accessibilityLabel={accessibilityLabel}
          style={styles.header}
        >
          <View accessible={false} style={iconBadgeStyle}>
            <Ionicons color={tokens.accent} name="wallet-outline" size={20} />
          </View>
          <View accessible={false} style={styles.headerText}>
            <Text
              text={translate("home:payrollNudge.title")}
              weight="semiBold"
              style={{ color: tokens.textPrimary }}
            />
            <Text text={subtitle} size="xs" style={{ color: tokens.textSecondary }} />
          </View>
          {onDismiss ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={translate("home:payrollNudge.dismiss")}
              hitSlop={8}
              onPress={onDismiss}
              style={styles.dismiss}
            >
              <Ionicons color={tokens.textSecondary} name="close" size={18} />
            </Pressable>
          ) : null}
        </View>

        <AppButton
          accessibilityLabel={translate("home:payrollNudge.cta")}
          fullWidth
          label={translate("home:payrollNudge.cta")}
          onPress={onPress}
        />
      </SurfaceCard>
    </MotionView>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  dismiss: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    marginTop: -2,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  iconBadge: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
})
