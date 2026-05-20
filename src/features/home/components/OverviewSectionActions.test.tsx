import { fireEvent, render, screen } from "@testing-library/react-native"

import type { HomeTask, NotificationItem, Shift, TimeEntry } from "@/core/models"
import { RecentEntries, TimeEntriesListScreen } from "@/features/time/components/TimeEntriesList"
import { ThemeProvider } from "@/ui"

import { HomeTasksSection, HomeUpdatesSection } from "./HomeTaskSections"
import { UpcomingShiftsSection } from "./UpcomingShiftsSection"

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
  const KeyboardAwareScrollView = React.forwardRef(({ children, ...props }: any, ref: any) => (
    <ScrollView ref={ref} {...props}>
      {children}
    </ScrollView>
  ))
  KeyboardAwareScrollView.displayName = "KeyboardAwareScrollView"

  return {
    KeyboardAwareScrollView,
  }
})

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  }),
}))

const sampleShift: Shift = {
  id: "shift-1",
  date: "2099-05-20",
  dayLabel: "Wed",
  endTime: "23:30",
  role: "Waiter",
  startTime: "18:00",
  status: "confirmed",
  venueAddress: "Grand Place 1",
  venueName: "Bistro Noir",
}

const sampleTask: HomeTask = {
  action: { route: "/(app)/tasks", type: "navigate" },
  actionLabel: "Upload",
  id: "task-1",
  subtitle: "Complete your profile",
  title: "Upload ID card",
  urgency: "high",
}

const sampleNotification: NotificationItem = {
  body: "Please review your next shift update.",
  id: "notification-1",
  kind: "schedule",
  relativeTime: "2h ago",
  title: "Shift update",
  unread: true,
}

const sampleTimeEntry: TimeEntry = {
  breakSeconds: 900,
  clockInAt: "2099-05-20T18:00:00.000Z",
  clockOutAt: "2099-05-20T23:30:00.000Z",
  date: "2099-05-20",
  employerId: "bistro-noir",
  earningsAmount: 82.5,
  events: [],
  grossSeconds: 19800,
  id: "entry-1",
  source: "shift",
  shiftLabel: "Evening shift",
  status: "approved",
  venueAddress: "Grand Place 1",
  venueName: "Bistro Noir",
  workedSeconds: 18900,
}

function renderWithTheme(node: React.ReactElement) {
  return render(<ThemeProvider initialContext="light">{node}</ThemeProvider>)
}

describe("overview section actions", () => {
  it("uses View all for upcoming shifts", () => {
    const onViewAll = jest.fn()

    renderWithTheme(
      <UpcomingShiftsSection
        shifts={[sampleShift]}
        onShiftPress={() => undefined}
        onViewAll={onViewAll}
      />,
    )

    fireEvent.press(screen.getByText("View all"))

    expect(onViewAll).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("See all")).toBeNull()
  })

  it("uses View all for home tasks", () => {
    const onViewAll = jest.fn()

    renderWithTheme(
      <HomeTasksSection tasks={[sampleTask]} onComplete={() => undefined} onViewAll={onViewAll} />,
    )

    fireEvent.press(screen.getByText("View all"))

    expect(onViewAll).toHaveBeenCalledTimes(1)
  })

  it("hides home tasks when there are no pending tasks", () => {
    renderWithTheme(
      <HomeTasksSection tasks={[]} onComplete={() => undefined} onViewAll={() => undefined} />,
    )

    expect(screen.queryByText("Tasks")).toBeNull()
    expect(screen.queryByText("All tasks done!")).toBeNull()
    expect(screen.queryByText("History")).toBeNull()
    expect(screen.queryByText("View all")).toBeNull()
  })

  it("uses View all for home updates", () => {
    const onViewAll = jest.fn()

    renderWithTheme(
      <HomeUpdatesSection
        notifications={[sampleNotification]}
        onNotificationPress={() => undefined}
        onViewAll={onViewAll}
      />,
    )

    fireEvent.press(screen.getByText("View all"))

    expect(onViewAll).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("All")).toBeNull()
  })

  it("hides home updates when there are no notifications", () => {
    renderWithTheme(
      <HomeUpdatesSection
        notifications={[]}
        onNotificationPress={() => undefined}
        onViewAll={() => undefined}
      />,
    )

    expect(screen.queryByText("Updates")).toBeNull()
    expect(screen.queryByText("View all")).toBeNull()
  })

  it("keeps View all for recent entries", () => {
    const onViewAll = jest.fn()

    renderWithTheme(
      <RecentEntries
        entries={[sampleTimeEntry]}
        onOpenEntry={() => undefined}
        onViewAll={onViewAll}
      />,
    )

    fireEvent.press(screen.getByText("View all"))

    expect(onViewAll).toHaveBeenCalledTimes(1)
  })

  it("shows an empty state when there are no upcoming shifts", () => {
    renderWithTheme(
      <UpcomingShiftsSection
        shifts={[]}
        onShiftPress={() => undefined}
        onViewAll={() => undefined}
      />,
    )

    expect(screen.getByText("No upcoming shifts")).toBeTruthy()
    expect(
      screen.getByText(
        "Your next assigned shifts will appear here as soon as planning is published.",
      ),
    ).toBeTruthy()
  })

  it("shows the employer on upcoming cards without the role pill", () => {
    renderWithTheme(
      <UpcomingShiftsSection
        shifts={[sampleShift]}
        onShiftPress={() => undefined}
        onViewAll={() => undefined}
      />,
    )

    expect(screen.getByText("Bistro Noir")).toBeTruthy()
    expect(screen.queryByText("Waiter")).toBeNull()
  })

  it("shows an empty state when there are no recent entries", () => {
    renderWithTheme(
      <RecentEntries entries={[]} onOpenEntry={() => undefined} onViewAll={() => undefined} />,
    )

    expect(screen.getByText("No time entries yet")).toBeTruthy()
    expect(
      screen.getByText("Clock in and out from the Time tab to start building your history."),
    ).toBeTruthy()
  })

  it("shows an empty state on the full time entries screen when there are no entries", () => {
    renderWithTheme(
      <TimeEntriesListScreen groupedEntries={{}} onOpenEntry={() => undefined} totalEntries={0} />,
    )

    expect(screen.getByText("No time entries yet")).toBeTruthy()
    expect(
      screen.getByText(
        "Your completed time entries will appear here once you start clocking time.",
      ),
    ).toBeTruthy()
  })
})
