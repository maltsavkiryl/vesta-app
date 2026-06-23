import { analytics, setAnalyticsClient, type AnalyticsClient } from "./analytics"

function fakeClient(): jest.Mocked<AnalyticsClient> {
  return {
    track: jest.fn(),
    identify: jest.fn(),
    screen: jest.fn(),
    reset: jest.fn(),
  }
}

describe("analytics", () => {
  afterEach(() => {
    setAnalyticsClient(null)
  })

  it("is a safe no-op when no client is registered", () => {
    expect(() => {
      analytics.track("app_started", { source: "cold" })
      analytics.identify("emp-1")
      analytics.screen("Home")
      analytics.reset()
    }).not.toThrow()
  })

  it("forwards calls to the registered client with props", () => {
    const client = fakeClient()
    setAnalyticsClient(client)

    analytics.track("shift_claimed", { shiftId: "s1" })
    analytics.identify("emp-1", { plan: "pro" })
    analytics.screen("Schedule")
    analytics.reset()

    expect(client.track).toHaveBeenCalledWith("shift_claimed", { shiftId: "s1" })
    expect(client.identify).toHaveBeenCalledWith("emp-1", { plan: "pro" })
    expect(client.screen).toHaveBeenCalledWith("Schedule", undefined)
    expect(client.reset).toHaveBeenCalledTimes(1)
  })

  it("stops forwarding once the client is cleared", () => {
    const client = fakeClient()
    setAnalyticsClient(client)
    analytics.track("first")
    setAnalyticsClient(null)
    analytics.track("second")

    expect(client.track).toHaveBeenCalledTimes(1)
    expect(client.track).toHaveBeenCalledWith("first", undefined)
  })
})
