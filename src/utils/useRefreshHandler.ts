import { useCallback, useState } from "react"

import { useIsMounted } from "@/utils/useIsMounted"

/**
 * Wraps a (possibly async) refetch into a `RefreshControl`-friendly pair:
 * an `onRefresh` callback that flips `refreshing` true for the duration of the
 * refetch and back to false when it settles. Safe against unmount.
 */
export function useRefreshHandler(refetch: () => unknown | Promise<unknown>) {
  const isMounted = useIsMounted()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    void Promise.resolve(refetch()).finally(() => {
      if (isMounted()) {
        setRefreshing(false)
      }
    })
  }, [isMounted, refetch])

  return { onRefresh, refreshing }
}
