import { StyleSheet } from "react-native"

import { timeHeroColors } from "./TimeHeroCard"

export const styles = StyleSheet.create({
  actionGrid: {
    flexDirection: "row",
    gap: 8,
  },
  actionSection: {
    paddingTop: 12,
  },
  activeHeroValue: {
    marginTop: 0,
  },
  animatedSectionHost: {
    position: "relative",
  },
  breakButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14,
  },
  caps: {
    letterSpacing: 0,
  },
  cardPressable: {
    width: "100%",
  },
  collapseToggle: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  dangerAction: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14,
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  heroContent: {
    gap: 16,
    zIndex: 1,
  },
  heroContentCollapsed: {
    gap: 0,
  },
  heroDetailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  heroDivider: {
    backgroundColor: timeHeroColors.divider,
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 4,
  },
  heroInfoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  heroPrimaryStack: {
    flex: 1,
    gap: 8,
  },
  heroStatusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
    minWidth: 0,
  },
  heroTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  heroValue: {
    marginTop: 2,
  },
  hiddenMeasure: {
    left: 0,
    opacity: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: -1,
  },
  idleDetailsContent: {
    gap: 12,
  },
  idleDetailsViewport: {
    overflow: "hidden",
  },
  idleLowerContent: {
    gap: 0,
  },
  secondaryAction: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14,
  },
  staticExpandedSection: {
    gap: 0,
  },
  staticIdleDetails: {
    marginBottom: 12,
  },
  timerPanel: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 10,
  },
})
