import { StyleSheet } from "react-native"

import { AppScrollScreen, MotionView } from "@/ui"

import {
  ProfileCompletenessCard,
  ProfileOverviewHeader,
  ProfileOverviewSectionCard,
  ProfileVersionFooter,
} from "./ProfileOverviewParts"
import { useProfileOverview } from "./useProfileOverview"

export function ProfileScreen() {
  const screen = useProfileOverview()

  return (
    <AppScrollScreen variant="grouped" contentContainerStyle={styles.screenContent}>
      <MotionView>
        <ProfileOverviewHeader
          email={screen.email}
          fullName={screen.fullName}
          initials={screen.initials}
          role={screen.role}
        />
      </MotionView>
      <MotionView delay={55}>
        <ProfileCompletenessCard setupStatus={screen.profileSetupStatus} />
      </MotionView>

      {screen.sectionOrder.map((section) => (
        <MotionView key={section} delay={110 + screen.sectionOrder.indexOf(section) * 45}>
          <ProfileOverviewSectionCard
            items={screen.sections[section]}
            title={screen.sectionTitles[section]}
          />
        </MotionView>
      ))}
      <MotionView delay={290}>
        <ProfileOverviewSectionCard items={[screen.signOutRow]} title="" />
      </MotionView>
      <MotionView delay={335}>
        <ProfileVersionFooter label={screen.versionLabel} />
      </MotionView>
    </AppScrollScreen>
  )
}

const styles = StyleSheet.create({
  screenContent: {
    gap: 16,
    paddingHorizontal: 16,
  },
})
