import { appQueryKeys, useAppSessionQuery } from "@/services/app/app.queries"

export const authQueryKeys = {
  session: appQueryKeys.session,
}

export function useAuthSessionQuery() {
  return useAppSessionQuery()
}

export function useAuthSession() {
  const query = useAuthSessionQuery()

  return {
    accountId: query.data?.accountId ?? null,
    isSignedIn: query.data?.isSignedIn ?? false,
    needsOnboarding: query.data?.needsOnboarding ?? false,
    session: query.data,
  }
}
