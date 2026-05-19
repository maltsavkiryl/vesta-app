import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { IconButton, SearchField, Text, appTypography, useDesignTokens } from "@/ui"

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
        <SearchField
          autoFocus
          inputStyle={[styles.searchInput, appTypography.searchInput]}
          leftAccessory={<Ionicons color={tokens.textMuted} name="search-outline" size={15} />}
          onChangeText={onQueryChange}
          onClear={() => onQueryChange("")}
          onSubmitEditing={onSearchPress}
          placeholder="Search documents..."
          rightAccessory={<Ionicons color={tokens.textMuted} name="close-outline" size={15} />}
          value={query}
        />
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
        <IconButton accessibilityLabel="Search documents" onPress={onSearchPress}>
          <Ionicons color={tokens.textSecondary} name="search-outline" size={16} />
        </IconButton>
        <IconButton
          accessibilityLabel="Upload document"
          onPress={onUploadPress}
          style={[styles.uploadIconButton, { shadowColor: tokens.accent }]}
          tone="accent"
          variant="soft"
        >
          <Ionicons color={tokens.accentForeground} name="add" size={18} />
        </IconButton>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
  uploadIconButton: {
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
})
