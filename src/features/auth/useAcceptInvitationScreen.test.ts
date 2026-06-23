import { renderHook, waitFor } from "@testing-library/react-native"

import { useAcceptInvitationScreen } from "./useAcceptInvitationScreen"

const mockReplace = jest.fn()
const mockAcceptInvitation = jest.fn()
const mockParams: { token?: string } = {}

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => mockParams,
}))
jest.mock("@/features/auth/data/auth.mutations", () => ({
  useAuthActions: () => ({ acceptInvitation: mockAcceptInvitation }),
}))
jest.mock("@/utils/haptics", () => ({ fireHaptic: jest.fn() }))

describe("useAcceptInvitationScreen", () => {
  beforeEach(() => {
    mockReplace.mockClear()
    mockAcceptInvitation.mockReset()
    delete mockParams.token
  })

  it("errors without calling accept when the link has no token", async () => {
    const { result } = renderHook(() => useAcceptInvitationScreen())

    await waitFor(() => expect(result.current.status).toBe("error"))
    expect(mockAcceptInvitation).not.toHaveBeenCalled()
    expect(result.current.error).toMatch(/code/i)
  })

  it("routes home when a single-membership invitation is accepted", async () => {
    mockParams.token = "tok-1"
    mockAcceptInvitation.mockResolvedValue({
      ok: true,
      data: { kind: "signed-in", session: { accountId: "emp-1" } },
    })

    renderHook(() => useAcceptInvitationScreen())

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"))
  })

  it("routes to the employer picker for a multi-employer invitation", async () => {
    mockParams.token = "tok-1"
    mockAcceptInvitation.mockResolvedValue({
      ok: true,
      data: { kind: "select-employer", employers: [] },
    })

    renderHook(() => useAcceptInvitationScreen())

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/(auth)/select-employer"))
  })

  it("surfaces the error message when acceptance fails", async () => {
    mockParams.token = "bad"
    mockAcceptInvitation.mockResolvedValue({
      ok: false,
      error: { type: "validation", message: "This invitation is invalid or has expired." },
    })

    const { result } = renderHook(() => useAcceptInvitationScreen())

    await waitFor(() => expect(result.current.status).toBe("error"))
    expect(result.current.error).toMatch(/invalid or has expired/)
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
