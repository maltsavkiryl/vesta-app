import { render, screen } from "@testing-library/react-native"

import { ThemeProvider } from "@/ui"

import { EarningsSummaryCard } from "./EarningsSummaryCard"

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => {
    const React = require("react")
    const { Text } = require("react-native")
    return React.createElement(Text, null, name)
  },
}))

function renderCard(overrides: Partial<Parameters<typeof EarningsSummaryCard>[0]> = {}) {
  return render(
    <ThemeProvider initialContext="light">
      <EarningsSummaryCard
        averageHourlyRate={12}
        earnedAmount={1200}
        hoursWorked={100}
        monthLabel="May 2026"
        onPayslipPress={jest.fn()}
        shiftsWorked={12}
        targetAmount={2400}
        {...overrides}
      />
    </ThemeProvider>,
  )
}

describe("EarningsSummaryCard", () => {
  it("renders earned amount, target progress, hours and shifts worked", () => {
    renderCard()

    // 1200 of 2400 = 50% toward target.
    expect(screen.getByText("50%")).toBeTruthy()
    expect(screen.getByText("100h")).toBeTruthy()
    expect(screen.getByText("12")).toBeTruthy()
    expect(screen.getByText("Hours worked")).toBeTruthy()
    expect(screen.getByText("Shifts worked")).toBeTruthy()
    // Honest earnings, not a fake €0 trend.
    expect(screen.getAllByText(/1,200/).length).toBeGreaterThan(0)
  })

  it("celebrates when the monthly target is reached", () => {
    renderCard({ earnedAmount: 2600, targetAmount: 2400 })

    // Clamps to 100% rather than overshooting.
    expect(screen.getByText("100%")).toBeTruthy()
    expect(screen.getByText("Monthly target reached — nice work")).toBeTruthy()
  })
})
