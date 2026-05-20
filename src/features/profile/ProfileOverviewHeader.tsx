import { Image, Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Text, useDesignTokens } from "@/ui"

function ProfileAvatar({ avatarUri, initials }: { avatarUri?: string; initials: string }) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.avatarFrame, { backgroundColor: tokens.surface }]}>
      <View style={[styles.avatar, { backgroundColor: avatarUri ? tokens.surface : tokens.textPrimary }]}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <Text text={initials} size="lg" weight="semiBold" style={{ color: tokens.surface }} />
        )}
      </View>
      <View style={[styles.avatarBadge, { backgroundColor: tokens.accent }]}>
        <Ionicons color="#FFFFFF" name="camera" size={12} />
      </View>
    </View>
  )
}

export function ProfileOverviewHeader({
  avatarUri,
  email,
  fullName,
  initials,
  onAvatarPress,
}: {
  avatarUri?: string
  email: string
  fullName: string
  initials: string
  onAvatarPress: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.profileHeader}>
      <Pressable
        accessibilityHint="Opens profile photo options"
        accessibilityLabel={avatarUri ? "Change profile photo" : "Add profile photo"}
        accessibilityRole="button"
        hitSlop={12}
        onPress={onAvatarPress}
      >
        <ProfileAvatar avatarUri={avatarUri} initials={initials} />
      </Pressable>
      <Text text={fullName} size="xl" weight="bold" style={{ color: tokens.textPrimary }} />
      <Text text={email} size="xs" style={{ color: tokens.textSecondary }} />
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    overflow: "hidden",
    width: 68,
  },
  avatarBadge: {
    alignItems: "center",
    borderRadius: 12,
    bottom: 0,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 24,
  },
  avatarFrame: {
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    marginBottom: 12,
    width: 80,
  },
  avatarImage: {
    height: "100%",
    width: "100%",
  },
  profileHeader: {
    alignItems: "center",
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
})
