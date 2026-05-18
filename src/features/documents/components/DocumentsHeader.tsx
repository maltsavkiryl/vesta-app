import { Pressable, StyleSheet, TextInput, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Text, appTypography, useDesignTokens } from "@/ui"

type DocumentsHeaderProps = {
  isSearching: boolean
  onCancelSearch: () => void
  onQueryChange: (query: string) => void
  onSearchPress: () => void
  onUploadPress: () => void
  query: string
}

export function DocumentsHeader({
  isSearching,
  onCancelSearch,
  onQueryChange,
  onSearchPress,
  onUploadPress,
  query,
}: DocumentsHeaderProps) {
  const tokens = useDesignTokens()

  if (isSearching) {
    return (
      <View style={styles.searchHeader}>
        <View style={[styles.searchBox, { backgroundColor: tokens.surface }]}>
          <Ionicons color={tokens.textMuted} name="search-outline" size={15} />
          <TextInput
            autoFocus
            onChangeText={onQueryChange}
            onSubmitEditing={onSearchPress}
            placeholder="Search documents..."
            placeholderTextColor={tokens.textMuted}
            style={[styles.searchInput, appTypography.searchInput, { color: tokens.textPrimary }]}
            value={query}
          />
          {query ? (
            <Pressable onPress={() => onQueryChange("")}>
              <Ionicons color={tokens.textMuted} name="close-outline" size={15} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={onCancelSearch}>
          <Text text="Cancel" size="xs" weight="medium" style={{ color: tokens.accent }} />
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.header}>
      <Text
        text="Documents"
        weight="bold"
        style={[appTypography.pageTitle, { color: tokens.textPrimary }]}
      />
      <View style={styles.actions}>
        <Pressable
          onPress={onSearchPress}
          style={[styles.iconButton, { backgroundColor: tokens.surface }]}
        >
          <Ionicons color={tokens.textSecondary} name="search-outline" size={16} />
        </Pressable>
        <Pressable
          onPress={onUploadPress}
          style={[styles.uploadButton, { backgroundColor: tokens.accent }]}
        >
          <Ionicons color={tokens.accentForeground} name="cloud-upload-outline" size={14} />
          <Text
            text="Upload"
            size="xxs"
            weight="medium"
            style={{ color: tokens.accentForeground }}
          />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    alignItems: "center",
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  searchBox: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  searchHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  uploadButton: {
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
})
