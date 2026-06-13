import { act, renderHook } from "@testing-library/react-native"

import type { Employer } from "@/core/models"

import { useTimeClockActions } from "./useTimeClockActions"

const mockResolveClockStart = jest.fn()
const mockCaptureLocation = jest.fn()
const mockCaptureProof = jest.fn()
const mockShowEmployerOptions = jest.fn()

jest.mock("@/features/time/data/time.mutations", () => ({
  useTimeActions: () => ({}),
}))

jest.mock("@/features/time/data/time.workflow", () => ({
  resolveClockStart: (...args: unknown[]) => mockResolveClockStart(...args),
  formatClockStartDistance: () => null,
}))

jest.mock("./showClockEmployerOptions", () => ({
  showClockEmployerOptions: (...args: unknown[]) => mockShowEmployerOptions(...args),
}))

jest.mock("./timeCapture", () => ({
  captureLocationSnapshot: (...args: unknown[]) => mockCaptureLocation(...args),
  captureClockInProofPhoto: (...args: unknown[]) => mockCaptureProof(...args),
}))

function buildEmployer(id: string, proofRequired?: boolean): Employer {
  return {
    id,
    code: id.toUpperCase(),
    name: id,
    type: "Cafe",
    city: "Brussels",
    teamSize: 5,
    rating: 4.5,
    clockConfig: { requiresScheduledShift: false, proofRequired },
  }
}

function renderActions(employers: Employer[], startClock: jest.Mock) {
  return renderHook(() =>
    useTimeClockActions({
      employers,
      endBreak: jest.fn(),
      profileRole: "Waiter",
      shifts: [],
      startBreak: jest.fn(),
      startClock,
    }),
  )
}

describe("useTimeClockActions clock-in proof", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCaptureLocation.mockResolvedValue(undefined)
    mockResolveClockStart.mockImplementation((input: { employers: Employer[] }) => {
      const employer = input.employers[0]
      const option = {
        context: { employerId: employer.id, source: "employer", venueName: employer.name },
        employerId: employer.id,
        employerName: employer.name,
        inGeofence: true,
        locationLabel: "Here",
      }
      return { ok: true, data: { mode: "single-employer", options: [option], recommendedOption: option } }
    })
  })

  it("skips the selfie capture entirely when the employer does not require proof", async () => {
    const startClock = jest.fn().mockResolvedValue({ ok: true })
    const { result } = renderActions([buildEmployer("grand-cafe", false)], startClock)

    await act(async () => {
      await result.current.handleClockIn()
    })

    expect(mockCaptureProof).not.toHaveBeenCalled()
    expect(startClock).toHaveBeenCalledTimes(1)
    expect(startClock.mock.calls[0][0]).toMatchObject({ proofPhoto: undefined })
  })

  it("captures a proof selfie when the employer requires proof", async () => {
    mockCaptureProof.mockResolvedValue({ uri: "file://selfie.jpg" })
    const startClock = jest.fn().mockResolvedValue({ ok: true })
    const { result } = renderActions([buildEmployer("secure-site", true)], startClock)

    await act(async () => {
      await result.current.handleClockIn()
    })

    expect(mockCaptureProof).toHaveBeenCalledTimes(1)
    expect(startClock.mock.calls[0][0]).toMatchObject({
      proofPhoto: { uri: "file://selfie.jpg" },
    })
  })

  it("aborts the clock-in when a required proof selfie is cancelled", async () => {
    mockCaptureProof.mockResolvedValue(null)
    const startClock = jest.fn().mockResolvedValue({ ok: true })
    const { result } = renderActions([buildEmployer("secure-site", true)], startClock)

    await act(async () => {
      await result.current.handleClockIn()
    })

    expect(mockCaptureProof).toHaveBeenCalledTimes(1)
    expect(startClock).not.toHaveBeenCalled()
  })
})
