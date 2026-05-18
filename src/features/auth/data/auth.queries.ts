import { useMemo } from "react"

import { useCurrentAppStateQuery, useAppSessionQuery } from "@/services/app/app.queries"

export function useAuthSession() {
  const sessionQuery = useAppSessionQuery()
  const accountId = sessionQuery.data?.accountId ?? null
  const stateQuery = useCurrentAppStateQuery(accountId)

  return useMemo(
    () => ({
      accountId,
      isSignedIn: Boolean(accountId),
      needsOnboarding:
        stateQuery.data?.authStatus === "signedIn" && !stateQuery.data.profile.onboardingComplete,
      session: sessionQuery.data,
      state: stateQuery.data,
    }),
    [accountId, sessionQuery.data, stateQuery.data],
  )
}
