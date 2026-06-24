import { Pressable, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { translate } from "@/i18n/translate"
import { IconButton, SearchField, Text, appTypography, useDesignTokens } from "@/ui"

type DocumentsHeaderProps = {
  isSearching: boolean
  onCancelSearch: () => void
  onQueryChange: (query: string) => void
  onSearchPress?: () => void
  onUploadPress?: () => void
  query: string
  searchPlaceholder?: string
  showSearchButton?: boolean
  showTitle?: boolean
  showUploadButton?: boolean
}

export function DocumentsHeader({
  isSearching,
  onCancelSearch,
  onQueryChange,
  onSearchPress,
  onUploadPress,
  query,
  searchPlaceholder = translate("documents:searchPlaceholder"),
  showSearchButton = true,
  showTitle = true,
  showUploadButton = true,
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
          placeholder={searchPlaceholder}
          rightAccessory={<Ionicons color={tokens.textMuted} name="close-outline" size={15} />}
          value={query}
        />
        <Pressable accessibilityRole="button" onPress={onCancelSearch}>
          <Text
            text={translate("common:actions.cancel")}
            size="xs"
            weight="medium"
            style={{ color: tokens.accent }}
          />
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.header}>
      {showTitle ? (
        <Text
          text={translate("documents:title")}
          weight="bold"
          style={[appTypography.pageTitle, { color: tokens.textPrimary }]}
        />
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <View style={styles.actions}>
        {showSearchButton && onSearchPress ? (
          <IconButton
            accessibilityLabel={translate("documents:searchDocuments")}
            onPress={onSearchPress}
          >
            <Ionicons color={tokens.textSecondary} name="search-outline" size={16} />
          </IconButton>
        ) : null}
        {showUploadButton && onUploadPress ? (
          <IconButton
            accessibilityLabel={translate("documents:uploadDocument")}
            onPress={onUploadPress}
            tone="accent"
            variant="solid"
            style={{ ...tokens.elevation2, shadowColor: tokens.accent }}
          >
            <Ionicons color={tokens.accentForeground} name="add" size={18} />
          </IconButton>
        ) : null}
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
  headerSpacer: {
    flex: 1,
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
})
