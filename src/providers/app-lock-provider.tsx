import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { AppState, type AppStateStatus, Pressable, StyleSheet, View } from "react-native"
import * as LocalAuthentication from "expo-local-authentication"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import { useAppSession } from "@/providers/app-provider"
import { appQueryKeys } from "@/services/app/app.queries"
import { Text, useDesignTokens } from "@/ui"

export interface AppLockContextValue {
  /** True only while the biometric gate is active and the app is locked. */
  isLocked: boolean
  /** True when biometric lock is enabled but the device can't satisfy it (fail-open). */
  isUnavailable: boolean
  /** Re-runs the biometric prompt. */
  unlock: () => void
}

const AppLockContext = createContext<AppLockContextValue | null>(null)

/**
 * Gates the authenticated app behind device biometrics when the signed-in user
 * has `profile.security.faceIdEnabled` turned on.
 *
 * Behaviour:
 *  - Locks on cold start and whenever the app returns to the foreground after
 *    being backgrounded.
 *  - Renders a branded lock overlay on top of the app while locked; the app
 *    tree stays mounted so navigation state is preserved across unlocks.
 *
 * Fail-open policy: if the lock is enabled but the device has no biometric
 * hardware / no enrolled biometrics (or the prompt errors unexpectedly), we
 * deliberately unlock and surface an `isUnavailable` flag rather than hard-lock
 * the user out of their own account.
 */
export function AppLockProvider({ children }: PropsWithChildren) {
  const { accountId, isSignedIn } = useAppSession()

  const profileQuery = useQuery({
    enabled: Boolean(accountId),
    queryFn: () => appRepositories.profile.getProfile(accountId!),
    queryKey: appQueryKeys.profile(accountId),
  })
  const faceIdEnabled = profileQuery.data?.security.faceIdEnabled ?? false
  const lockEnabled = isSignedIn && faceIdEnabled

  // Seed the lock state from the initial gate so cold start does not flash
  // protected content before the first effect runs.
  const [locked, setLocked] = useState(lockEnabled)
  const [unavailable, setUnavailable] = useState(false)
  const [authenticating, setAuthenticating] = useState(false)

  const appStateRef = useRef<AppStateStatus>(AppState.currentState)
  // Guards against re-prompting on every render once a lock cycle has started.
  const promptedForCurrentLock = useRef(false)

  const unlock = useCallback(async () => {
    if (authenticating) return
    setAuthenticating(true)
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()

      if (!hasHardware || !isEnrolled) {
        // Fail open: never trap a user who can no longer satisfy biometrics.
        setUnavailable(true)
        setLocked(false)
        return
      }

      setUnavailable(false)
      const result = await LocalAuthentication.authenticateAsync({
        fallbackLabel: "Use passcode",
        promptMessage: "Unlock Vesta",
      })

      if (result.success) {
        setLocked(false)
      }
    } catch {
      // Unexpected failure (e.g. native module unavailable in dev) — fail open.
      setUnavailable(true)
      setLocked(false)
    } finally {
      setAuthenticating(false)
    }
  }, [authenticating])

  // Keep the lock state in sync with the enabled gate (sign-out, toggling the
  // setting off, switching accounts, etc.).
  useEffect(() => {
    if (lockEnabled) {
      setLocked(true)
    } else {
      setLocked(false)
      setUnavailable(false)
      promptedForCurrentLock.current = false
    }
  }, [lockEnabled])

  // Re-lock when returning to the foreground after being backgrounded.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const previousState = appStateRef.current
      appStateRef.current = nextState
      if (!lockEnabled) return
      if (/inactive|background/.test(previousState) && nextState === "active") {
        promptedForCurrentLock.current = false
        setLocked(true)
      }
    })
    return () => subscription.remove()
  }, [lockEnabled])

  // Auto-prompt once whenever we enter a locked state. The ref guard prevents a
  // prompt loop if the user cancels — they re-prompt via the Unlock button.
  useEffect(() => {
    if (!locked) {
      promptedForCurrentLock.current = false
      return
    }
    if (lockEnabled && !promptedForCurrentLock.current) {
      promptedForCurrentLock.current = true
      void unlock()
    }
  }, [locked, lockEnabled, unlock])

  const value = useMemo<AppLockContextValue>(
    () => ({
      isLocked: lockEnabled && locked,
      isUnavailable: unavailable,
      unlock: () => void unlock(),
    }),
    [lockEnabled, locked, unavailable, unlock],
  )

  return (
    <AppLockContext.Provider value={value}>
      {children}
      {value.isLocked ? (
        <AppLockOverlay authenticating={authenticating} onUnlock={() => void unlock()} />
      ) : null}
    </AppLockContext.Provider>
  )
}

function AppLockOverlay({
  authenticating,
  onUnlock,
}: {
  authenticating: boolean
  onUnlock: () => void
}) {
  const tokens = useDesignTokens()

  return (
    <View
      accessibilityViewIsModal
      style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: tokens.background }]}
    >
      <View style={styles.content}>
        <View style={[styles.iconBadge, { backgroundColor: tokens.surface }]}>
          <Ionicons color={tokens.accent} name="lock-closed" size={28} />
        </View>
        <Text
          size="lg"
          text="Vesta is locked"
          weight="bold"
          style={{ color: tokens.textPrimary }}
        />
        <Text
          size="xs"
          text="Unlock with biometrics to continue."
          style={[styles.subtitle, { color: tokens.textSecondary }]}
        />
      </View>
      <View style={styles.action}>
        <Pressable
          accessibilityLabel="Unlock"
          accessibilityRole="button"
          accessibilityState={{ disabled: authenticating }}
          disabled={authenticating}
          onPress={onUnlock}
          style={({ pressed }) => [
            styles.unlockButton,
            { backgroundColor: tokens.accent, opacity: pressed || authenticating ? 0.7 : 1 },
          ]}
        >
          <Text
            size="xs"
            text={authenticating ? "Unlocking…" : "Unlock"}
            weight="semiBold"
            style={{ color: tokens.background }}
          />
        </Pressable>
      </View>
    </View>
  )
}

export function useAppLock() {
  const context = useContext(AppLockContext)
  if (!context) {
    throw new Error("useAppLock must be used within AppLockProvider")
  }
  return context
}

const styles = StyleSheet.create({
  action: {
    alignSelf: "stretch",
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconBadge: {
    alignItems: "center",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    marginBottom: 8,
    width: 56,
  },
  overlay: {
    zIndex: 1000,
  },
  subtitle: {
    textAlign: "center",
  },
  unlockButton: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 999,
    height: 52,
    justifyContent: "center",
  },
})
