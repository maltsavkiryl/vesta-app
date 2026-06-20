import { fireEvent, render, screen } from "@testing-library/react-native"

import type { PayrollProfileGap } from "@/features/profile/payrollProfile"
import { ThemeProvider } from "@/ui"

import { PayrollProfileNudge } from "./PayrollProfileNudge"

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => {
    const React = require("react")
    const { Text } = require("react-native")
    return React.createElement(Text, null, name)
  },
}))

const gaps: PayrollProfileGap[] = [
  { key: "iban", label: "Bank account (IBAN)" },
  { key: "address", label: "Home address" },
]

function renderNudge(overrides: Partial<Parameters<typeof PayrollProfileNudge>[0]> = {}) {
  return render(
    <ThemeProvider initialContext="light">
      <PayrollProfileNudge gaps={gaps} onPress={jest.fn()} onDismiss={jest.fn()} {...overrides} />
    </ThemeProvider>,
  )
}

describe("PayrollProfileNudge", () => {
  it("renders the title and a subtitle naming the gaps", () => {
    renderNudge()

    expect(screen.getByText("Finish setting up payroll")).toBeTruthy()
    expect(
      screen.getByText("Add your bank account and home address so you get paid on time."),
    ).toBeTruthy()
  })

  it("fires onPress when the primary action is pressed", () => {
    const onPress = jest.fn()
    renderNudge({ onPress })

    fireEvent.press(screen.getByText("Complete profile"))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it("fires onDismiss when the dismiss control is pressed", () => {
    const onDismiss = jest.fn()
    renderNudge({ onDismiss })

    fireEvent.press(screen.getByLabelText("Dismiss"))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it("hides the dismiss control when no onDismiss is provided", () => {
    renderNudge({ onDismiss: undefined })

    expect(screen.queryByLabelText("Dismiss")).toBeNull()
  })

  it("phrases a single gap naturally", () => {
    renderNudge({ gaps: [{ key: "phone", label: "Phone number" }] })

    expect(screen.getByText("Add your phone number so you get paid on time.")).toBeTruthy()
  })
})
