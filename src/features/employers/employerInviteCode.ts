import type { Employer } from "@/core/models"

const TEST_EMPLOYER_ID = "bistro-noir"
const TEST_INVITE_CODE = "111111"

export function normalizeEmployerInviteCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)
}

export function findEmployerByInviteCode(employers: Employer[], rawCode: string) {
  const normalizedCode = normalizeEmployerInviteCode(rawCode)
  if (!normalizedCode) return undefined

  if (normalizedCode === TEST_INVITE_CODE) {
    return employers.find((employer) => employer.id === TEST_EMPLOYER_ID)
  }

  return employers.find(
    (employer) => normalizeEmployerInviteCode(employer.code) === normalizedCode,
  )
}

export function parseQrInviteCodePayload(payload: string) {
  const trimmedPayload = payload.trim()
  return /^[0-9]{6}$/.test(trimmedPayload) ? trimmedPayload : null
}
