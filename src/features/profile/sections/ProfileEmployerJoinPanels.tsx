/* eslint-disable react-native/no-inline-styles */

import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import type { Employer } from "@/core/models"
import { EmployerInviteCodeEntry } from "@/features/employers/EmployerInviteCodeEntry"
import { translate } from "@/i18n/translate"
import { Banner, GroupedSection, ListRow, SurfaceCard, Text, TextField } from "@/ui"
import type { DesignTokens } from "@/ui"

import { EmployerInitialBadge } from "./ProfileEmployerShared"

export function InviteCodePanel({
  codeMatchedEmployer,
  joinCode,
  onOpenQrScanner,
  onSetJoinCode,
  tokens,
}: {
  codeMatchedEmployer?: Employer
  joinCode: string
  onOpenQrScanner: () => void
  onSetJoinCode: (value: string) => void
  tokens: DesignTokens
}) {
  return (
    <>
      <View style={styles.joinCodeHint}>
        <Ionicons color={tokens.textSecondary} name="sparkles-outline" size={16} />
        <Text
          text={translate("profile:employer.askManagerCode")}
          size="xs"
          style={{ color: tokens.textSecondary }}
        />
      </View>

      <View style={styles.joinCodeContent}>
        <EmployerInviteCodeEntry
          code={joinCode}
          helperText={
            joinCode.length === 0
              ? translate("profile:employerJoin.enterCodeError")
              : joinCode.length < 6
                ? translate("profile:employerJoin.codeMoreNeeded", { count: 6 - joinCode.length })
                : codeMatchedEmployer
                  ? translate("profile:employerJoin.codeMatched", {
                      name: codeMatchedEmployer.name,
                    })
                  : translate("profile:employerJoin.noWorkplaceForCode")
          }
          onChangeCode={onSetJoinCode}
          onOpenQrScanner={onOpenQrScanner}
        />
      </View>
    </>
  )
}

export function EmployerSearchPanel({
  joinSearch,
  onChangeSearch,
  onSelectEmployer,
  searchResults,
  selectedJoinEmployerId,
  tokens,
}: {
  joinSearch: string
  onChangeSearch: (value: string) => void
  onSelectEmployer: (employerId: string) => void
  searchResults: Employer[]
  selectedJoinEmployerId?: string
  tokens: DesignTokens
}) {
  return (
    <>
      <Banner
        icon={<Ionicons color={tokens.accent} name="business-outline" size={16} />}
        title={translate("profile:employer.browseWorkplaces")}
        tone="accent"
      >
        {translate("profile:employer.searchByHint")}
      </Banner>

      <View style={styles.searchField}>
        <TextField
          autoCapitalize="words"
          leftAccessory={<Ionicons color={tokens.textMuted} name="search-outline" size={16} />}
          onChangeText={onChangeSearch}
          placeholder={translate("profile:employer.searchPlaceholder")}
          value={joinSearch}
        />
      </View>

      <GroupedSection title={translate("profile:employer.results")}>
        {searchResults.length > 0 ? (
          searchResults.map((employer, index) => {
            const selected = selectedJoinEmployerId === employer.id

            return (
              <ListRow
                key={employer.id}
                title={employer.name}
                subtitle={`${employer.type} - ${employer.city}`}
                isLast={index === searchResults.length - 1}
                onPress={() => onSelectEmployer(employer.id)}
                leading={
                  <EmployerInitialBadge
                    backgroundColor={selected ? tokens.accent : tokens.textPrimary}
                    name={employer.name}
                  />
                }
                trailing={
                  selected ? (
                    <Ionicons color={tokens.accent} name="checkmark-circle" size={20} />
                  ) : (
                    <View style={styles.searchMeta}>
                      <View style={styles.ratingRow}>
                        <Ionicons color={tokens.warning} name="star" size={11} />
                        <Text
                          text={String(employer.rating)}
                          size="xxs"
                          style={{ color: tokens.textSecondary }}
                        />
                      </View>
                      <Text
                        text={translate("profile:employer.staffCount", {
                          count: employer.teamSize,
                        })}
                        size="xxs"
                        style={{ color: tokens.textMuted }}
                      />
                    </View>
                  )
                }
              />
            )
          })
        ) : (
          <SurfaceCard elevated style={styles.emptyJoinState}>
            <View style={[styles.emptyJoinStateIcon, { backgroundColor: tokens.accentSoft }]}>
              <Ionicons color={tokens.accent} name="search-outline" size={18} />
            </View>
            <Text
              text={
                joinSearch
                  ? translate("profile:employer.noResultsFor", { query: joinSearch })
                  : translate("profile:employer.noResults")
              }
              size="xs"
              weight="semiBold"
              style={{ color: tokens.textPrimary, textAlign: "center" }}
            />
            <Text
              text={translate("profile:employer.noResultsHint")}
              size="xxs"
              style={{ color: tokens.textMuted, textAlign: "center" }}
            />
          </SurfaceCard>
        )}
      </GroupedSection>
    </>
  )
}

const styles = StyleSheet.create({
  emptyJoinState: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 18,
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 26,
  },
  emptyJoinStateIcon: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  joinCodeContent: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
  },
  joinCodeHint: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    marginTop: 3,
  },
  searchField: {
    paddingHorizontal: 4,
  },
  searchMeta: {
    alignItems: "flex-end",
    gap: 2,
  },
})
