import { act, renderHook } from "@testing-library/react-native"

import { useSignInScreen } from "./useSignInScreen"

const mockReplace = jest.fn()
const mockPush = jest.fn()
const mockSignIn = jest.fn()

jest.mock("expo-router", () => ({
  useRouter: () => ({ canGoBack: () => false, push: mockPush, replace: mockReplace }),
}))

jest.mock("@/features/auth/data/auth.mutations", () => ({
  useAuthActions: () => ({ signIn: mockSignIn }),
}))

describe("useSignInScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("opens with empty credentials (no demo prefill)", () => {
    const { result } = renderHook(() => useSignInScreen())

    expect(result.current.email).toBe("")
    expect(result.current.password).toBe("")
  })

  it("exposes a dev-only demo autofill that populates both fields", () => {
    const { result } = renderHook(() => useSignInScreen())

    // __DEV__ is true under jest, so the affordance exists.
    expect(typeof result.current.fillDemoCredentials).toBe("function")

    act(() => {
      result.current.fillDemoCredentials?.()
    })

    expect(result.current.email.length).toBeGreaterThan(0)
    expect(result.current.password.length).toBeGreaterThan(0)
  })
})
