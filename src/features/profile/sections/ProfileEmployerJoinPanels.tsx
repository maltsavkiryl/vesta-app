/* eslint-disable react-native/no-inline-styles */

import { StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import type { Employer } from "@/core/models"
import { EmployerInviteCodeEntry } from "@/features/employers/EmployerInviteCodeEntry"
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
      <Banner
        icon={<Ionicons color={tokens.accent} name="sparkles-outline" size={16} />}
        title="Quick join"
        tone="accent"
      >
        Ask your manager for the 6-character workplace code.
      </Banner>

      <SurfaceCard elevated style={styles.joinCodeCard}>
        <View style={styles.joinCodeContent}>
          <Text
            text="Invite code"
            size="sm"
            weight="semiBold"
            style={{ color: tokens.textPrimary, textAlign: "center" }}
          />
          <Text
            text="We'll use it to match you with the correct team and branch."
            size="xs"
            style={{ color: tokens.textSecondary, textAlign: "center" }}
          />
          <EmployerInviteCodeEntry
            code={joinCode}
            helperText={
              joinCode.length === 0
                ? "Enter a 6-character code to continue."
                : joinCode.length < 6
                  ? `${6 - joinCode.length} more characters needed.`
                  : codeMatchedEmployer
                    ? `Matched with ${codeMatchedEmployer.name}.`
                    : "No workplace found for this code."
            }
            onChangeCode={onSetJoinCode}
            onOpenQrScanner={onOpenQrScanner}
          />
        </View>
      </SurfaceCard>
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
        title="Browse workplaces"
        tone="accent"
      >
        Search by name, city, type, or invite code.
      </Banner>

      <SurfaceCard elevated style={styles.searchCard}>
        <TextField
          autoCapitalize="words"
          label="Search"
          labelCase="default"
          leftAccessory={<Ionicons color={tokens.textMuted} name="search-outline" size={16} />}
          onChangeText={onChangeSearch}
          placeholder="Search by name, type or city"
          value={joinSearch}
        />
      </SurfaceCard>

      <GroupedSection title="Results">
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
                        text={`${employer.teamSize} staff`}
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
              text={`No results${joinSearch ? ` for "${joinSearch}"` : ""}`}
              size="xs"
              weight="semiBold"
              style={{ color: tokens.textPrimary, textAlign: "center" }}
            />
            <Text
              text="Try a different term or ask your manager for an invite code."
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
  joinCodeCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  joinCodeContent: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    marginTop: 3,
  },
  searchCard: {
    padding: 12,
  },
  searchMeta: {
    alignItems: "flex-end",
    gap: 2,
  },
})
