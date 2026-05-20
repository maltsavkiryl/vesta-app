import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef } from "react"
import { useQuery } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import { DEMO_AUTH_CREDENTIALS } from "@/services/app/app.transformer"
import { useAppSessionQuery } from "@/services/app/app.queries"
import {
  createClockLiveActivityPayload,
  endClockLiveActivity,
  isClockLiveActivitySupported,
  startClockLiveActivity,
  updateClockLiveActivity,
} from "@/services/liveActivity/clockLiveActivity"

export interface AppContextValue {
  accountId: string | null
  isSignedIn: boolean
  needsOnboarding: boolean
}

const AppContext = createContext<AppContextValue | null>(null)
export { DEMO_AUTH_CREDENTIALS }

export function AppProvider({ children }: PropsWithChildren) {
  const sessionQuery = useAppSessionQuery()
  const accountId = sessionQuery.data?.accountId ?? null
  const isSignedIn = sessionQuery.data?.isSignedIn ?? false
  const needsOnboarding = sessionQuery.data?.needsOnboarding ?? false
  const clockSessionQuery = useQuery({
    enabled: Boolean(accountId),
    queryFn: () => appRepositories.time.getClockSession(accountId!),
    queryKey: ["app-shell", accountId, "clock-session"],
  })
  const clockSession = clockSessionQuery.data
  const lastClockLiveActivitySessionId = useRef<string | null>(null)

  useEffect(() => {
    const payload = clockSession ? createClockLiveActivityPayload(clockSession) : null
    const previousSessionId = lastClockLiveActivitySessionId.current

    void (async () => {
      if (!(await isClockLiveActivitySupported())) {
        lastClockLiveActivitySessionId.current = payload?.sessionId ?? null
        return
      }

      try {
        if (!payload) {
          if (previousSessionId) {
            await endClockLiveActivity(previousSessionId)
          }
          return
        }

        if (!previousSessionId) {
          await startClockLiveActivity(payload)
          return
        }

        if (previousSessionId !== payload.sessionId) {
          await endClockLiveActivity(previousSessionId)
          await startClockLiveActivity(payload)
          return
        }

        await updateClockLiveActivity(payload)
      } catch (error) {
        if (__DEV__) {
          console.warn("Unable to sync Live Activity", error)
        }
      } finally {
        lastClockLiveActivitySessionId.current = payload?.sessionId ?? null
      }
    })()
  }, [clockSession])

  const value = useMemo<AppContextValue>(
    () => ({
      accountId,
      isSignedIn,
      needsOnboarding,
    }),
    [accountId, isSignedIn, needsOnboarding],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppSession() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppSession must be used within AppProvider")
  }
  return context
}
