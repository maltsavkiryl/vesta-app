let pendingEmployerInviteCode: string | null = null

export function setPendingEmployerInviteCode(code: string) {
  pendingEmployerInviteCode = code
}

export function consumePendingEmployerInviteCode() {
  const code = pendingEmployerInviteCode
  pendingEmployerInviteCode = null
  return code
}
