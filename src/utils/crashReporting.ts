import * as Sentry from "@sentry/react-native"

/**
 * Crash + error reporting via Sentry.
 *
 * Activation is gated on a DSN supplied at build time
 * (`EXPO_PUBLIC_SENTRY_DSN`) and only runs in production builds — without a DSN
 * (local dev, tests, PR previews) every call here is a safe no-op that still
 * logs to the console in development. To turn it on: set the env var and ship a
 * native build (the Sentry config plugin is registered in app.config.ts).
 */
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN

/** Reporting is live only when a DSN is configured and we're not in dev. */
const isCrashReportingEnabled = Boolean(SENTRY_DSN) && !__DEV__

export const initCrashReporting = () => {
  if (!isCrashReportingEnabled) return

  Sentry.init({
    dsn: SENTRY_DSN,
    // Capture a sampled slice of performance traces; tune from the dashboard.
    tracesSampleRate: 0.2,
  })
}

/**
 * Error classifications used to sort errors on the reporting service.
 */
export enum ErrorType {
  /** A crash-level error (e.g. a caught render failure forcing a restart). */
  FATAL = "Fatal",
  /** A handled error reported for visibility but recovered from. */
  HANDLED = "Handled",
}

/**
 * Manually report a (handled) error. No-ops in dev beyond console logging, and
 * when crash reporting isn't configured.
 */
export const reportCrash = (error: Error, type: ErrorType = ErrorType.FATAL) => {
  if (__DEV__) {
    console.error(error)
    console.log(error.message || "Unknown", type)
    return
  }

  if (!isCrashReportingEnabled) return

  Sentry.captureException(error, { tags: { errorType: type } })
}
