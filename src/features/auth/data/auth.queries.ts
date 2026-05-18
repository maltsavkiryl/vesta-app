import { useQuery } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"

export const authQueryKeys = {
  session: ["auth", "session"] as const,
}

export function useAuthSessionQuery() {
  return useQuery({
    initialData: () => undefined,
    queryFn: () => appRepositories.auth.getSession(),
    queryKey: authQueryKeys.session,
  })
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
