/**
 * Product analytics / observability.
 *
 * Vendor-neutral by design: call sites use `analytics.track/identify/screen`,
 * and a concrete provider (PostHog, Segment, Amplitude, …) is injected via
 * {@link setAnalyticsClient} once the team picks one — no SDK or paid dependency
 * is baked in here. Until a client is set (and outside production) every call is
 * a safe no-op that logs to the console in development.
 *
 * Activation mirrors crash reporting: gated on a key supplied at build time
 * (`EXPO_PUBLIC_ANALYTICS_KEY`) and only live in production builds.
 */

export type AnalyticsPropValue = string | number | boolean | null | undefined
export interface AnalyticsProps {
  [key: string]: AnalyticsPropValue
}

/** Implemented by a concrete provider adapter and injected at startup. */
export interface AnalyticsClient {
  track(event: string, props?: AnalyticsProps): void
  identify(userId: string, traits?: AnalyticsProps): void
  screen(name: string, props?: AnalyticsProps): void
  reset(): void
}

const ANALYTICS_KEY = process.env.EXPO_PUBLIC_ANALYTICS_KEY

/** Live only when a key is configured and we're not in dev. */
export const isAnalyticsEnabled = Boolean(ANALYTICS_KEY) && !__DEV__

let client: AnalyticsClient | null = null

/**
 * Register the provider adapter. Call once at startup after constructing the
 * provider SDK. Passing null disables analytics (e.g. on sign-out teardown).
 */
export function setAnalyticsClient(next: AnalyticsClient | null): void {
  client = next
}

function devLog(method: string, name: string, props?: AnalyticsProps): void {
  if (__DEV__) {
    console.log(`[analytics] ${method}: ${name}`, props ?? {})
  }
}

export const analytics = {
  /** Record a user action / domain event. */
  track(event: string, props?: AnalyticsProps): void {
    devLog("track", event, props)
    client?.track(event, props)
  },
  /** Associate subsequent events with a user (e.g. after sign-in). */
  identify(userId: string, traits?: AnalyticsProps): void {
    devLog("identify", userId, traits)
    client?.identify(userId, traits)
  },
  /** Record a screen / route view. */
  screen(name: string, props?: AnalyticsProps): void {
    devLog("screen", name, props)
    client?.screen(name, props)
  },
  /** Clear the identified user and queued state (e.g. on sign-out). */
  reset(): void {
    devLog("reset", "")
    client?.reset()
  },
}

/**
 * Initialise analytics at app startup. Currently a seam: when a provider is
 * chosen, construct its SDK here (gated on {@link isAnalyticsEnabled}) and call
 * {@link setAnalyticsClient}. No-op until then so call sites are safe today.
 */
export function initAnalytics(): void {
  if (!isAnalyticsEnabled) return
  // e.g. setAnalyticsClient(createPostHogClient(ANALYTICS_KEY))
}
