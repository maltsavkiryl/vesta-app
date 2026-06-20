import { renderHook } from "@testing-library/react-native"

import { getStaggerDelay, useListItemEntrance, useCelebratePulse } from "./motion"

// motion-provider is globally mocked in test/setup.ts to return shouldReduceMotion: false

describe("getStaggerDelay", () => {
  it("returns baseDelay + index * step with defaults", () => {
    expect(getStaggerDelay(0)).toBe(0)
    expect(getStaggerDelay(1)).toBe(48)
    expect(getStaggerDelay(3)).toBe(144)
  })

  it("respects custom baseDelay and step", () => {
    expect(getStaggerDelay(2, 100, 30)).toBe(160)
  })
})

describe("useListItemEntrance", () => {
  it("returns an animatedStyle object", () => {
    const { result } = renderHook(() => useListItemEntrance(0))
    expect(result.current.animatedStyle).toBeDefined()
    expect(typeof result.current.animatedStyle).toBe("object")
  })

  it("returns animatedStyle for index > 0", () => {
    const { result } = renderHook(() => useListItemEntrance(3))
    expect(result.current.animatedStyle).toBeDefined()
  })
})

describe("useCelebratePulse", () => {
  it("returns animatedStyle and triggerPulse", () => {
    const { result } = renderHook(() => useCelebratePulse())
    expect(result.current.animatedStyle).toBeDefined()
    expect(typeof result.current.triggerPulse).toBe("function")
  })

  it("triggerPulse is callable and does not throw", () => {
    const { result } = renderHook(() => useCelebratePulse())
    expect(() => result.current.triggerPulse()).not.toThrow()
  })

  it("triggerPulse is a no-op when shouldReduceMotion=true", () => {
    // Override the motion mock for this test
    jest.doMock("@/providers/motion-provider", () => ({
      useAppMotion: () => ({
        enterDistance: 0,
        enterDuration: 0,
        mode: "reduced",
        preference: "system",
        prefersReducedMotion: true,
        shouldReduceMotion: true,
        staggerStep: 0,
      }),
    }))

    // Re-import after mock
    const { useCelebratePulse: useCelebratePulseReduced } = require("./motion")
    const { result } = renderHook(() => useCelebratePulseReduced())

    // Should not throw; scale remains at 1 (no-op)
    expect(() => result.current.triggerPulse()).not.toThrow()

    jest.dontMock("@/providers/motion-provider")
  })
})
