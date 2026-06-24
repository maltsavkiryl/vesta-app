import { StyleSheet, View } from "react-native"

import { translate } from "@/i18n/translate"
import { Skeleton, SurfaceCard } from "@/ui"

/**
 * Loading placeholder for the home screen. Mirrors the real layout (header,
 * time card, shifts, earnings) so content does not jump in once data arrives,
 * and avoids rendering fabricated zeros while the overview is still loading.
 */
export function HomeScreenSkeleton() {
  return (
    <View
      accessibilityLabel={translate("home:loadingA11y")}
      accessibilityState={{ busy: true }}
      style={styles.root}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Skeleton height={12} radius={6} width={90} />
          <Skeleton height={30} radius={10} width={180} />
          <Skeleton height={12} radius={6} width={140} />
        </View>
        <Skeleton height={44} radius={22} width={44} />
      </View>

      <View style={styles.stack}>
        <SurfaceCard>
          <Skeleton height={16} width="50%" />
          <Skeleton height={44} radius={14} />
        </SurfaceCard>

        <SurfaceCard>
          <Skeleton height={14} width="40%" />
          <Skeleton height={62} radius={14} />
          <Skeleton height={62} radius={14} />
        </SurfaceCard>

        <SurfaceCard>
          <Skeleton height={12} width="35%" />
          <Skeleton height={30} radius={8} width="60%" />
          <Skeleton height={12} width="45%" />
        </SurfaceCard>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
    gap: 8,
  },
  root: {
    gap: 18,
  },
  stack: {
    gap: 18,
    marginTop: 16,
  },
})
