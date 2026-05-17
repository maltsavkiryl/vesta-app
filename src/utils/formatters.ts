export function formatCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("en-BE", {
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value)
}

export function formatCompactCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("en-BE", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value)
}

export function maskIban(iban?: string) {
  if (!iban?.trim()) return "Not added"

  const compact = iban.replace(/\s/g, "")
  if (compact.length <= 8) return `${compact.slice(0, 2)}•• ••••`

  return `${compact.slice(0, 2)}•• •••• •••• ${compact.slice(-4)}`
}

export function maskSensitiveId(value?: string) {
  if (!value?.trim()) return "Not added"

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
