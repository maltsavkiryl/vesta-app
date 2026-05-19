import { Alert, Linking, Platform } from "react-native"
import Constants from "expo-constants"

import Config from "@/config"

type SupportDiagnostics = {
  accountEmail?: string
  accountId?: string | null
  analyticsEnabled: boolean
  crashReportsEnabled: boolean
  currentRoute?: string
  employerDataSharingEnabled: boolean
}

function buildMailtoUrl({ body, subject, to }: { body: string; subject: string; to: string }) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

async function openEmail({ body, subject }: { body: string; subject: string }) {
  try {
    const MailComposer = await import("expo-mail-composer")
    if (await MailComposer.isAvailableAsync()) {
      await MailComposer.composeAsync({
        body,
        recipients: [Config.SUPPORT_EMAIL],
        subject,
      })
      return true
    }
  } catch {}

  const mailtoUrl = buildMailtoUrl({
    body,
    subject,
    to: Config.SUPPORT_EMAIL,
  })

  try {
    if (await Linking.canOpenURL(mailtoUrl)) {
      await Linking.openURL(mailtoUrl)
      return true
    }
  } catch {}

  Alert.alert("Email unavailable", "Set up a mail app on this device to contact Vesta support.")
  return false
}

function buildDiagnosticsFooter(diagnostics: SupportDiagnostics) {
  const appVersion = Constants.expoConfig?.version ?? "unknown"
  const buildProfile = Constants.expoConfig?.extra?.build?.profile ?? "local"

  return [
    "",
    "---",
    "Diagnostics",
    `App version: ${appVersion}`,
    `Build profile: ${String(buildProfile)}`,
    `Platform: ${Platform.OS}`,
    `Current route: ${diagnostics.currentRoute ?? "unknown"}`,
    `Account email: ${diagnostics.accountEmail ?? "unknown"}`,
    `Account id: ${diagnostics.accountId ?? "unknown"}`,
    `Analytics enabled: ${diagnostics.analyticsEnabled ? "yes" : "no"}`,
    `Crash reports enabled: ${diagnostics.crashReportsEnabled ? "yes" : "no"}`,
    `Employer sharing enabled: ${diagnostics.employerDataSharingEnabled ? "yes" : "no"}`,
    `Created at: ${new Date().toISOString()}`,
  ].join("\n")
}

export function openSupportComposer(diagnostics: SupportDiagnostics) {
  return openEmail({
    body: [
      "Hi Vesta support,",
      "",
      "I need help with the employee mobile app.",
      "",
      "What happened:",
      "",
      buildDiagnosticsFooter(diagnostics),
    ].join("\n"),
    subject: "Vesta mobile support request",
  })
}

export function reportProblem(diagnostics: SupportDiagnostics) {
  return openEmail({
    body: [
      "Hi Vesta support,",
      "",
      "I'm reporting a problem in the employee mobile app.",
      "",
      "Expected behavior:",
      "",
      "Actual behavior:",
      "",
      "Steps to reproduce:",
      "",
      buildDiagnosticsFooter(diagnostics),
    ].join("\n"),
    subject: "Vesta mobile problem report",
  })
}
