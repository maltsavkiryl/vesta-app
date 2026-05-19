import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Text, useDesignTokens } from "@/ui"

function ProfileAvatar({ initials }: { initials: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.avatarFrame}>
      <View
        style={[
          styles.avatarProgressRing,
          { borderColor: tokens.accent, backgroundColor: tokens.surface },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: tokens.textPrimary }]}>
          <Text text={initials} size="lg" weight="semiBold" style={{ color: tokens.surface }} />
        </View>
      </View>
      <View
        style={[
          styles.cameraButton,
          { backgroundColor: tokens.surface, borderColor: tokens.border },
        ]}
      >
        <Ionicons color={tokens.textPrimary} name="camera-outline" size={12} />
      </View>
    </View>
  )
}

export function ProfileOverviewHeader({
  email,
  fullName,
  initials,
  role,
}: {
  email: string
  fullName: string
  initials: string
  role: string
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.profileHeader}>
      <ProfileAvatar initials={initials} />
      <Text text={fullName} size="xl" weight="bold" style={{ color: tokens.textPrimary }} />
      <Text text={email} size="xs" style={{ color: tokens.textSecondary }} />
      <View style={[styles.employerPill, { backgroundColor: tokens.accentSoft }]}>
        <View style={[styles.statusDot, { backgroundColor: tokens.success }]} />
        <Text
          text={role}
          numberOfLines={1}
          size="xxs"
          weight="medium"
          style={{ color: tokens.accent }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    width: 80,
  },
  avatarFrame: {
    alignSelf: "center",
    marginBottom: 14,
  },
  avatarProgressRing: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 45,
    borderWidth: 3,
    height: 90,
    justifyContent: "center",
    width: 90,
  },
  cameraButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1.5,
    bottom: 3,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: 3,
    width: 24,
  },
  employerPill: {
    alignItems: "center",
    alignSelf: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    maxWidth: "92%",
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  profileHeader: {
    alignItems: "center",
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  statusDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
})
