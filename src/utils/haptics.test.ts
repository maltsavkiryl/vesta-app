import * as Haptics from "expo-haptics"

import { triggerHaptic } from "./haptics"

function setNodeEnv(value: string | undefined) {
  ;(process.env as { NODE_ENV?: string }).NODE_ENV = value
}

describe("haptics", () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    jest.clearAllMocks()
    setNodeEnv("development")
  })

  afterAll(() => {
    setNodeEnv(originalNodeEnv)
  })

  it("maps selection and toggle intents to the expected native APIs", async () => {
    await triggerHaptic("selection")
    await triggerHaptic("toggle")

    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1)
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light)
  })

  it("maps outcome intents to notification haptics", async () => {
    await triggerHaptic("success")
    await triggerHaptic("warning")
    await triggerHaptic("error")

    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(
      1,
      Haptics.NotificationFeedbackType.Success,
    )
    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(
      2,
      Haptics.NotificationFeedbackType.Warning,
    )
    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(
      3,
      Haptics.NotificationFeedbackType.Error,
    )
  })
})
