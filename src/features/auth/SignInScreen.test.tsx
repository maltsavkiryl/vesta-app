import { fireEvent, render, waitFor } from "@testing-library/react-native"

import { ThemeProvider } from "@/ui"

import { SignInScreen } from "./SignInScreen"

const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockSignInWithGoogle = jest.fn()

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}))

jest.mock("@/features/auth/data/auth.mutations", () => ({
  useAuthActions: () => ({ signInWithGoogle: mockSignInWithGoogle }),
}))

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => {
    const React = require("react")
    const { Text } = require("react-native")
    return React.createElement(Text, null, name)
  },
}))

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}))

jest.mock("./AuthLogo", () => ({
  AuthLogo: () => null,
}))

function renderScreen() {
  return render(
    <ThemeProvider initialContext="light">
      <SignInScreen />
    </ThemeProvider>,
  )
}

describe("SignInScreen social sign-in buttons", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSignInWithGoogle.mockResolvedValue({ ok: true, data: { kind: "signed-in", session: {} } })
  })

  it("routes Continue with Apple to the email flow with an accessible button role", () => {
    const screen = renderScreen()

    const button = screen.getByLabelText("Continue with Apple")
    expect(button.props.accessibilityRole).toBe("button")

    fireEvent.press(button)
    expect(mockPush).toHaveBeenCalledWith("/(auth)/sign-in-email")
  })

  it("triggers Google sign-in and routes home on success", async () => {
    const screen = renderScreen()

    const button = screen.getByLabelText("Continue with Google")
    expect(button.props.accessibilityRole).toBe("button")

    fireEvent.press(button)
    await waitFor(() => expect(mockSignInWithGoogle).toHaveBeenCalled())
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"))
    expect(mockPush).not.toHaveBeenCalledWith("/(auth)/sign-in-email")
  })

  it("routes a multi-employer Google sign-in to the employer picker", async () => {
    mockSignInWithGoogle.mockResolvedValue({
      ok: true,
      data: { kind: "select-employer", employers: [] },
    })
    const screen = renderScreen()

    fireEvent.press(screen.getByLabelText("Continue with Google"))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/(auth)/select-employer"))
  })
})
