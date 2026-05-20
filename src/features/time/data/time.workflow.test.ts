import type { Employer, LocationSnapshot, Shift } from "@/core/models"

import { resolveClockStart } from "./time.workflow"

const employers: Employer[] = [
  {
    city: "Brussels",
    clockConfig: { requiresScheduledShift: false },
    code: "ALPHA",
    id: "alpha",
    name: "Alpha Cafe",
    rating: 4.7,
    teamSize: 12,
    type: "Cafe",
    worksite: {
      addressLabel: "Alpha Street 1, Brussels",
      latitude: 50.85,
      longitude: 4.35,
      radiusMeters: 150,
    },
  },
  {
    city: "Brussels",
    clockConfig: { requiresScheduledShift: false },
    code: "BRAVO",
    id: "bravo",
    name: "Bravo Bistro",
    rating: 4.8,
    teamSize: 18,
    type: "Restaurant",
    worksite: {
      addressLabel: "Bravo Street 2, Brussels",
      latitude: 50.852,
      longitude: 4.37,
      radiusMeters: 150,
    },
  },
  {
    city: "Brussels",
    clockConfig: { requiresScheduledShift: true },
    code: "CHARLIE",
    id: "charlie",
    name: "Charlie Hotel",
    rating: 4.9,
    teamSize: 40,
    type: "Hotel",
    worksite: {
      addressLabel: "Charlie Avenue 3, Brussels",
      latitude: 50.86,
      longitude: 4.39,
      radiusMeters: 200,
    },
  },
]

const todayShift: Shift = {
  date: "2026-05-20",
  dayLabel: "Today",
  employerId: "charlie",
  endTime: "17:00",
  id: "shift-1",
  role: "Reception",
  startTime: "09:00",
  status: "confirmed",
  venueAddress: "Charlie Avenue 3, Brussels",
  venueName: "Charlie Hotel",
}

const nearbyLocation: LocationSnapshot = {
  accuracyMeters: 12,
  addressLabel: "Near Bravo",
  latitude: 50.8521,
  longitude: 4.3701,
}

describe("resolveClockStart", () => {
  it("prefers today's shift over employer fallback", () => {
    const result = resolveClockStart({
      employers,
      profileRole: "Reception",
      shifts: [todayShift],
      today: "2026-05-20",
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.mode).toBe("shift")
    expect(result.data.recommendedOption.context.shiftId).toBe("shift-1")
    expect(result.data.recommendedOption.context.employerId).toBe("charlie")
  })

  it("starts immediately when there is one eligible employer", () => {
    const result = resolveClockStart({
      employers: [employers[2], employers[0]],
      profileRole: "Barista",
      shifts: [],
      today: "2026-05-20",
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.mode).toBe("single-employer")
    expect(result.data.recommendedOption.context.source).toBe("employer")
    expect(result.data.recommendedOption.context.employerId).toBe("alpha")
  })

  it("orders multiple eligible employers by geofence and distance", () => {
    const result = resolveClockStart({
      employers,
      location: nearbyLocation,
      profileRole: "Server",
      shifts: [],
      today: "2026-05-20",
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.mode).toBe("multiple-employers")
    expect(result.data.options[0].employerId).toBe("bravo")
    expect(result.data.options[0].inGeofence).toBe(true)
  })

  it("falls back to linked order when location is unavailable", () => {
    const result = resolveClockStart({
      employers: [employers[1], employers[0], employers[2]],
      profileRole: "Server",
      shifts: [],
      today: "2026-05-20",
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.options[0].employerId).toBe("bravo")
    expect(result.data.options[1].employerId).toBe("alpha")
  })

  it("returns an error when no linked employer allows manual timer starts", () => {
    const result = resolveClockStart({
      employers: [employers[2]],
      profileRole: "Reception",
      shifts: [],
      today: "2026-05-20",
    })

    expect(result).toEqual({
      error: {
        message: "No linked employer currently allows timer starts without a scheduled shift.",
        type: "no-clock-context",
      },
      ok: false,
    })
  })
})
