import { useCallback, useState } from "react"
import { Alert, Linking } from "react-native"

import { fireHaptic } from "@/utils/haptics"

import { getCalendarFeedUrl } from "./data/calendar.service"

/**
 * Lets the employee subscribe their phone calendar to their Vesta shift feed.
 * Opens the feed as a `webcal://` URL (which triggers the OS "subscribe to
 * calendar" flow) and falls back to the plain https URL when that's unsupported.
 */
export function useCalendarSync() {
  const [isSyncing, setIsSyncing] = useState(false)

  const syncToCalendar = useCallback(async () => {
    setIsSyncing(true)
    try {
      const url = await getCalendarFeedUrl()
      if (!url) {
        Alert.alert("Calendar unavailable", "Vesta couldn't set up your calendar feed right now.")
        return
      }

      const subscribeUrl = url.replace(/^https?:\/\//, "webcal://")
      const target = (await Linking.canOpenURL(subscribeUrl)) ? subscribeUrl : url
      await Linking.openURL(target)
      fireHaptic("success")
    } catch {
      Alert.alert("Calendar unavailable", "Vesta couldn't open your calendar feed.")
    } finally {
      setIsSyncing(false)
    }
  }, [])

  return { isSyncing, syncToCalendar }
}
