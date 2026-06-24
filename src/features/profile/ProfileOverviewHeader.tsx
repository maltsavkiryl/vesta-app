import { ActivityIndicator, Image, Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { translate } from "@/i18n/translate"
import { Text, useDesignTokens } from "@/ui"

function ProfileAvatar({
  avatarUri,
  initials,
  isUploading,
}: {
  avatarUri?: string
  initials: string
  isUploading: boolean
}) {
  const tokens = useDesignTokens()

  return (
    <View style={[styles.avatarFrame, { backgroundColor: tokens.surface }]}>
      <View
        style={[
          styles.avatar,
          { backgroundColor: avatarUri ? tokens.surface : tokens.textPrimary },
          isUploading ? styles.avatarFaded : null,
        ]}
      >
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <Text text={initials} size="lg" weight="semiBold" style={{ color: tokens.surface }} />
        )}
      </View>
      <View style={[styles.avatarBadge, { backgroundColor: tokens.accent }]}>
        {isUploading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Ionicons color="#FFFFFF" name="camera" size={12} />
        )}
      </View>
    </View>
  )
}

export function ProfileOverviewHeader({
  avatarUri,
  email,
  fullName,
  initials,
  isUploadingPhoto = false,
  onAvatarPress,
}: {
  avatarUri?: string
  email: string
  fullName: string
  initials: string
  isUploadingPhoto?: boolean
  onAvatarPress: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <View style={styles.profileHeader}>
      <Pressable
        accessibilityHint={translate("profile:photo.optionsA11y")}
        accessibilityLabel={
          avatarUri ? translate("profile:photo.change") : translate("profile:photo.add")
        }
        accessibilityRole="button"
        accessibilityState={{ busy: isUploadingPhoto }}
        disabled={isUploadingPhoto}
        hitSlop={12}
        onPress={onAvatarPress}
      >
        <ProfileAvatar avatarUri={avatarUri} initials={initials} isUploading={isUploadingPhoto} />
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
  avatarFaded: {
    opacity: 0.6,
  },
  avatarFrame: {
    alignItems: "center",
    alignSelf: "center",
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
