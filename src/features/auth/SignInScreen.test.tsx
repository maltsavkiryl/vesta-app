import { fireEvent, render } from "@testing-library/react-native"

import { ThemeProvider } from "@/ui"

import { SignInScreen } from "./SignInScreen"

const mockPush = jest.fn()

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
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
  })

  it.each(["Continue with Apple", "Continue with Google"])(
    "wires %s to the shared sign-in flow with an accessible button role",
    (label) => {
      const screen = renderScreen()

      const button = screen.getByLabelText(label)
      expect(button.props.accessibilityRole).toBe("button")

      fireEvent.press(button)
      expect(mockPush).toHaveBeenCalledWith("/(auth)/sign-in-email")
    },
  )
})
