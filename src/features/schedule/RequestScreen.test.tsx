import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native"

import { RequestScreen } from "./RequestScreen"

const mockBack = jest.fn()
const mockCreateRequest = jest.fn()
const originalConsoleError = console.error

let mockParams: { category?: string; shiftId?: string } = {}
let mockState: {
  planningWindows: Array<{ deadline: string; endDate: string; startDate: string; status: "open" | "closed" | "submitted" }>
  shifts: Array<{
    date: string
    dayLabel: string
    endTime: string
    id: string
    role: string
    startTime: string
    venueName: string
  }>
} = {
  planningWindows: [
    {
      deadline: "2099-05-18",
      endDate: "2099-05-24",
      startDate: "2099-05-18",
      status: "open",
    },
  ],
  shifts: [
    {
      date: "2099-05-20",
      dayLabel: "Wed",
      endTime: "23:30",
      id: "shift-1",
      role: "Waiter",
      startTime: "18:00",
      venueName: "Bistro Noir",
    },
    {
      date: "2099-05-22",
      dayLabel: "Fri",
      endTime: "00:00",
      id: "shift-2",
      role: "Bartender",
      startTime: "17:00",
      venueName: "Bar Clara",
    },
  ],
}

jest.mock("expo-router", () => ({
  Stack: {
    Screen: () => null,
  },
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({
    back: mockBack,
  }),
}))

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  }),
}))

jest.mock("react-native-keyboard-controller", () => {
  const React = require("react")
  const { ScrollView } = require("react-native")

  return {
    KeyboardAwareScrollView: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <ScrollView ref={ref} {...props}>
        {children}
      </ScrollView>
    )),
  }
})

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => {
    const React = require("react")
    const { Text } = require("react-native")
    return React.createElement(Text, null, name)
  },
}))

jest.mock("@/theme/context", () => ({
  useAppTheme: () => ({
    themeContext: "light",
    theme: {
      colors: {
        text: "#1C1C1E",
      },
      isDark: false,
    },
    themed: (value: any) => {
      const entries = [value].flat(4)
      return Object.assign(
        {},
        ...entries.map((entry) =>
          typeof entry === "function" ? entry({ colors: { text: "#1C1C1E" }, isDark: false }) : entry,
        ),
      )
    },
  }),
}))

jest.mock("@/features/schedule/data/schedule.mutations", () => ({
  useScheduleActions: () => ({
    createRequest: mockCreateRequest,
  }),
}))

jest.mock("@/features/schedule/data/schedule.queries", () => ({
  useScheduleStateQuery: () => ({
    state: mockState,
  }),
}))

function pressTextLabel(label: string) {
  const node = screen.getByText(label)
  fireEvent.press(node.parent?.parent ?? node.parent ?? node)
}

describe("RequestScreen", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation((...args) => {
      const firstArg = args[0]
      if (typeof firstArg === "string" && firstArg.includes("not wrapped in act")) {
        return
      }

      originalConsoleError(...args)
    })
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  beforeEach(() => {
    mockBack.mockReset()
    mockCreateRequest.mockReset()
    mockCreateRequest.mockResolvedValue({ ok: true })
    mockParams = {}
    mockState = {
      planningWindows: [
        {
          deadline: "2099-05-18",
          endDate: "2099-05-24",
          startDate: "2099-05-18",
          status: "open",
        },
      ],
      shifts: [
        {
          date: "2099-05-20",
          dayLabel: "Wed",
          endTime: "23:30",
          id: "shift-1",
          role: "Waiter",
          startTime: "18:00",
          venueName: "Bistro Noir",
        },
        {
          date: "2099-05-22",
          dayLabel: "Fri",
          endTime: "00:00",
          id: "shift-2",
          role: "Bartender",
          startTime: "17:00",
          venueName: "Bar Clara",
        },
      ],
    }
  })

  it("keeps submit disabled until a shift and reason are selected", () => {
    mockParams = { category: "shift_change" }

    render(<RequestScreen />)

    const submitButton = screen.getByRole("button", { name: "Send shift swap" })

    expect(screen.getByText("Pick the exact shift that needs support so everyone reviews the right context.")).toBeTruthy()
    fireEvent.press(submitButton)
    expect(mockCreateRequest).not.toHaveBeenCalled()

    pressTextLabel("Wed · 18:00 - 23:30")

    fireEvent.press(submitButton)
    expect(mockCreateRequest).not.toHaveBeenCalled()

    pressTextLabel("Need replacement")

    fireEvent.press(screen.getByRole("button", { name: "Send shift swap" }))
    expect(mockCreateRequest).toHaveBeenCalledTimes(1)
  })

  it("uses action-specific copy for time off requests", () => {
    mockParams = { category: "time_off" }

    render(<RequestScreen />)

    expect(screen.getByRole("button", { name: "Send time off" })).toBeTruthy()
    expect(screen.queryByText("Submit request")).toBeNull()

    pressTextLabel("May 18")
    pressTextLabel("Personal")

    fireEvent.press(screen.getByRole("button", { name: "Send time off" }))

    expect(mockCreateRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "time_off",
        reason: "Personal",
        target: expect.objectContaining({
          kind: "dates",
          label: "May 18",
        }),
      }),
    )
  })

  it("shows the success state after a successful submit", async () => {
    mockParams = { category: "shift_change", shiftId: "shift-1" }

    render(<RequestScreen />)

    pressTextLabel("Need replacement")
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Send shift swap" }))
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(mockCreateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "shift_change",
          reason: "Need replacement",
          target: expect.objectContaining({
            kind: "shift",
            label: "Wed · 18:00 - 23:30",
            shiftId: "shift-1",
          }),
        }),
      )
    })

    expect(await screen.findByText("Request submitted")).toBeTruthy()
    expect(screen.getByText("Need replacement")).toBeTruthy()
    expect(screen.getByText("Done")).toBeTruthy()
  })
})
