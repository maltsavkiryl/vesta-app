export function formatSeconds(seconds: number) {
  const safeSeconds = Math.max(seconds, 0)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainingSeconds = safeSeconds % 60

  return [hours, minutes, remainingSeconds].map((part) => String(part).padStart(2, "0")).join(":")
}

export function formatHours(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours === 0) return `${minutes}m`
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}
