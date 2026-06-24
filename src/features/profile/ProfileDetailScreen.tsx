import { StyleSheet } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"

import {
  renderProfileDetailSection,
  isDetailSectionEditable,
} from "@/features/profile/ProfileDetailContent"
import { SectionFooter } from "@/features/profile/ProfileDetailSections"
import { getProfileSection, getProfileSectionMeta } from "@/features/profile/profileSections"
import { useProfileDetailScreen } from "@/features/profile/useProfileDetailScreen"
import { translate } from "@/i18n/translate"
import { AppScrollScreen, createHeaderActionOptions } from "@/ui"

export function ProfileDetailScreen() {
  const router = useRouter()
  const { section: rawSection } = useLocalSearchParams<{ section?: string }>()
  const section = getProfileSection(rawSection)
  const screen = useProfileDetailScreen(section)

  const currentSectionIsDirty =
    section in screen.dirtyState
      ? screen.dirtyState[section as keyof typeof screen.dirtyState]
      : false
  const canSaveCurrentSection = isDetailSectionEditable(section)
  const closeSection = () => {
    if (section === "join-employer") {
      if (router.canGoBack()) {
        router.back()
        return
      }

      router.replace("/profile/employers")
      return
    }

    router.back()
  }
  const headerActions = createHeaderActionOptions(screen.theme, {
    left: { kind: "close", onPress: closeSection },
    right: canSaveCurrentSection
      ? {
          disabled: !currentSectionIsDirty,
          kind: "confirm",
          haptic: "none",
          label: translate("common:actions.save"),
          onPress: screen.saveCurrentSection,
        }
      : undefined,
  })

  const sectionMeta = getProfileSectionMeta(section)

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <Stack.Screen
        options={{
          headerBackVisible: false,
          ...headerActions,
          title: sectionMeta.title,
        }}
      />
      {sectionMeta.subtitle ? <SectionFooter text={sectionMeta.subtitle} /> : null}
      {renderProfileDetailSection(section, screen)}
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  screen: {
    gap: 12,
    paddingHorizontal: 16,
  },
})
