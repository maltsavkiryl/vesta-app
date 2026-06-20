// Note the syntax of these imports from the date-fns library.
// If you import with the syntax: import { format } from "date-fns" the ENTIRE library
// will be included in your production bundle (even if you only use one function).
// This is because react-native does not support tree-shaking.
import { format } from "date-fns/format"
import { parseISO } from "date-fns/parseISO"

import { getDateFnsLocale } from "@/core/format"

type Options = Parameters<typeof format>[2]

/**
 * Kept for backwards compatibility. Locale resolution now happens lazily per
 * call via {@link getDateFnsLocale}, so there is nothing to preload.
 */
export const loadDateFnsLocale = () => {}

export const formatDate = (date: string, dateFormat?: string, options?: Options) => {
  const dateOptions = {
    ...options,
    locale: getDateFnsLocale(),
  }
  return format(parseISO(date), dateFormat ?? "MMM dd, yyyy", dateOptions)
}
