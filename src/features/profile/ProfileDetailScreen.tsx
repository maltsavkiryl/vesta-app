import { StyleSheet } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"

import {
  renderProfileDetailSection,
  isDetailSectionEditable,
} from "@/features/profile/ProfileDetailContent"
import { SectionFooter } from "@/features/profile/ProfileDetailSections"
import { PROFILE_SECTION_META, getProfileSection } from "@/features/profile/profileSections"
import { useProfileDetailScreen } from "@/features/profile/useProfileDetailScreen"
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
          label: "Save",
          onPress: screen.saveCurrentSection,
        }
      : undefined,
  })

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screen}>
      <Stack.Screen
        options={{
          headerBackVisible: false,
          ...headerActions,
          title: PROFILE_SECTION_META[section].title,
        }}
      />
      {PROFILE_SECTION_META[section].subtitle ? (
        <SectionFooter text={PROFILE_SECTION_META[section].subtitle} />
      ) : null}
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
