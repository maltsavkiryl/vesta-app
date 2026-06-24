import { translate } from "@/i18n/translate"

export function maskIban(iban?: string) {
  if (!iban?.trim()) return translate("common:states.notAdded")

  const compact = iban.replace(/\s/g, "")
  if (compact.length <= 8) return `${compact.slice(0, 2)}•• ••••`

  return `${compact.slice(0, 2)}•• •••• •••• ${compact.slice(-4)}`
}

export function maskSensitiveId(value?: string) {
  if (!value?.trim()) return translate("common:states.notAdded")

  const visible = value.replace(/\D/g, "").slice(-2)
  return visible ? `••••••-•••-${visible}` : "••••••-•••"
}

export function formatDurationFromMinutes(minutes: number) {
  const safeMinutes = Math.max(minutes, 0)
  const hours = Math.floor(safeMinutes / 60)
  const remainingMinutes = safeMinutes % 60

  if (hours === 0) return `${remainingMinutes}m`
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}
