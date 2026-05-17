import type { Theme } from "@/theme/types"

export function createNativeSheetOptions(
  theme: Theme,
  title?: string,
  options: { backgroundColor?: string } = {},
) {
  const backgroundColor = options.backgroundColor ?? (theme.isDark ? "#000000" : "#FFFFFF")

  return {
    presentation: "formSheet" as const,
    sheetAllowedDetents: [0.6, 0.92],
    sheetCornerRadius: 24,
    sheetGrabberVisible: true,
    sheetInitialDetentIndex: "last" as const,
    headerShown: true,
    headerShadowVisible: false,
    headerStyle: { backgroundColor },
    headerTintColor: theme.colors.text,
    ...(title ? { title } : {}),
  }
}
