import type { Employer } from "@/core/models"

import {
  findEmployerByInviteCode,
  normalizeEmployerInviteCode,
  parseQrInviteCodePayload,
} from "./employerInviteCode"

const employers: Employer[] = [
  {
    city: "Brussels",
    clockConfig: { requiresScheduledShift: true },
    code: "BIST01",
    id: "bistro-noir",
    name: "Bistro Noir",
    rating: 4.8,
    teamSize: 12,
    type: "Restaurant",
  },
  {
    city: "Brussels",
    clockConfig: { requiresScheduledShift: false },
    code: "GRAN02",
    id: "grand-cafe",
    name: "Grand Cafe",
    rating: 4.6,
    teamSize: 8,
    type: "Cafe",
  },
]

describe("employer invite codes", () => {
  it("normalizes manual invite-code input", () => {
    expect(normalizeEmployerInviteCode(" ab-12!3 ")).toBe("AB123")
  })

  it("matches real alphanumeric employer codes", () => {
    expect(findEmployerByInviteCode(employers, "gran02")?.id).toBe("grand-cafe")
  })

  it("maps the 111111 test code to Bistro Noir", () => {
    expect(findEmployerByInviteCode(employers, "111111")?.id).toBe("bistro-noir")
  })

  it("returns undefined for unknown codes", () => {
    expect(findEmployerByInviteCode(employers, "ZZZZZZ")).toBeUndefined()
  })

  it("accepts plain 6-digit QR payloads only", () => {
    expect(parseQrInviteCodePayload("111111")).toBe("111111")
    expect(parseQrInviteCodePayload(" BIST01 ")).toBeNull()
    expect(parseQrInviteCodePayload("https://vesta.test/invite?code=111111")).toBeNull()
  })
})
