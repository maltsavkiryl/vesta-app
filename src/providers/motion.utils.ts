export type MotionPreference = "system" | "reduced" | "full"
export type MotionMode = "full" | "reduced"

export function normalizeMotionPreference(value: string | undefined): MotionPreference {
  return value === "full" || value === "reduced" || value === "system" ? value : "system"
}

export function resolveMotionMode(
  preference: MotionPreference,
  prefersReducedMotion: boolean,
): MotionMode {
  if (preference === "full") {
    return "full"
  }

  if (preference === "reduced") {
    return "reduced"
  }

  return prefersReducedMotion ? "reduced" : "full"
}
