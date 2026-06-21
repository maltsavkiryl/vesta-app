import * as LocalAuthentication from "expo-local-authentication"
import { fireEvent, render, waitFor } from "@testing-library/react-native"

import { Text, ThemeProvider } from "@/ui"

import { AppLockProvider } from "./app-lock-provider"

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => {
    const React = require("react")
    const { Text } = require("react-native")
    return React.createElement(Text, null, name)
  },
}))

jest.mock("@/providers/app-provider", () => ({
  useAppSession: () => ({ accountId: "acc-1", isSignedIn: true, needsOnboarding: false }),
}))

jest.mock("@/composition/repositories", () => ({
  appRepositories: { profile: { getProfile: jest.fn() } },
}))

const mockUseQuery = jest.fn()
jest.mock("@tanstack/react-query", () => ({
  useQuery: () => mockUseQuery(),
}))

jest.mock("expo-local-authentication", () => ({
  __esModule: true,
  authenticateAsync: jest.fn(),
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
}))

const authenticateAsync = LocalAuthentication.authenticateAsync as jest.Mock

function renderProvider() {
  return render(
    <ThemeProvider initialContext="light">
      <AppLockProvider>
        <Text text="protected-content" />
      </AppLockProvider>
    </ThemeProvider>,
  )
}

describe("AppLockProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseQuery.mockReturnValue({ data: { security: { faceIdEnabled: true } } })
  })

  it("gates the app behind a biometric unlock and reveals content after success", async () => {
    // The cold-start auto-prompt is cancelled; a manual retry then succeeds.
    authenticateAsync.mockResolvedValueOnce({ success: false })
    authenticateAsync.mockResolvedValue({ success: true })

    const screen = renderProvider()

    // While locked, the branded unlock affordance is shown.
    const unlockButton = await screen.findByLabelText("Unlock", {}, { timeout: 10000 })
    expect(unlockButton).toBeTruthy()

    // After a cancelled prompt the app stays gated (overlay still present).
    await waitFor(() => expect(authenticateAsync).toHaveBeenCalled(), { timeout: 10000 })
    expect(screen.queryByLabelText("Unlock")).toBeTruthy()

    // Wait for the cancelled auto-prompt to settle (button re-enabled) before
    // retrying — otherwise the press is dropped by the in-flight guard and the
    // overlay never clears (the source of the suite-load flake).
    await waitFor(
      () => expect(screen.getByLabelText("Unlock").props.accessibilityState?.disabled).toBe(false),
      { timeout: 10000 },
    )

    // Tapping Unlock re-prompts and succeeds, dismissing the lock overlay.
    fireEvent.press(screen.getByLabelText("Unlock"))
    await waitFor(() => expect(screen.queryByLabelText("Unlock")).toBeNull(), { timeout: 10000 })
    expect(screen.getByText("protected-content")).toBeTruthy()
    // Generous per-test budget: this exercises real biometric-mock async across
    // two unlock cycles and can run slow under heavy parallel suite load.
  }, 20000)

  it("does not lock when biometric app-lock is disabled", () => {
    mockUseQuery.mockReturnValue({ data: { security: { faceIdEnabled: false } } })

    const screen = renderProvider()

    expect(screen.queryByLabelText("Unlock")).toBeNull()
    expect(screen.getByText("protected-content")).toBeTruthy()
  })
})
