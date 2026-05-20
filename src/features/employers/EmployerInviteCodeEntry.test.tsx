import { fireEvent, render, screen } from "@testing-library/react-native"

import { ThemeProvider } from "@/theme/context"

import { EmployerInviteCodeEntry } from "./EmployerInviteCodeEntry"

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => {
    const React = require("react")
    const { Text } = require("react-native")
    return React.createElement(Text, null, name)
  },
}))

jest.mock("react-native-keyboard-controller", () => {
  const React = require("react")
  const { ScrollView } = require("react-native")

  return {
    KeyboardAwareScrollView: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement(ScrollView, { ...props, ref }, children),
    ),
  }
})

function renderWithTheme(node: React.ReactElement) {
  return render(<ThemeProvider initialContext="light">{node}</ThemeProvider>)
}

describe("EmployerInviteCodeEntry", () => {
  it("renders code boxes without a duplicate invite-code field label", () => {
    renderWithTheme(
      <EmployerInviteCodeEntry
        code="AB1"
        helperText="3 more characters needed."
        onChangeCode={() => undefined}
        onOpenQrScanner={() => undefined}
      />,
    )

    expect(screen.getByLabelText("Invite code input")).toBeTruthy()
    expect(screen.getByText("A")).toBeTruthy()
    expect(screen.getByText("B")).toBeTruthy()
    expect(screen.getByText("1")).toBeTruthy()
    expect(screen.queryByText("Invite code")).toBeNull()
  })

  it("normalizes hidden-input changes before forwarding them", () => {
    const onChangeCode = jest.fn()

    renderWithTheme(
      <EmployerInviteCodeEntry
        code=""
        helperText="Type or paste your invite code"
        onChangeCode={onChangeCode}
        onOpenQrScanner={() => undefined}
      />,
    )

    fireEvent.changeText(screen.getByTestId("employer-invite-code-hidden-input"), "ab-12!3")

    expect(onChangeCode).toHaveBeenCalledWith("AB123")
  })

  it("opens the QR scanner from the shared action", () => {
    const onOpenQrScanner = jest.fn()

    renderWithTheme(
      <EmployerInviteCodeEntry
        code=""
        helperText="Type or paste your invite code"
        onChangeCode={() => undefined}
        onOpenQrScanner={onOpenQrScanner}
      />,
    )

    fireEvent.press(screen.getByLabelText("Scan QR code"))

    expect(onOpenQrScanner).toHaveBeenCalledTimes(1)
  })
})
