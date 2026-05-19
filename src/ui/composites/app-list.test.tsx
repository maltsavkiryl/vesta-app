import { fireEvent, render } from "@testing-library/react-native"
import * as Haptics from "expo-haptics"

import { ThemeProvider } from "@/theme/context"

import { ListRow } from "./app-list"

function setNodeEnv(value: string | undefined) {
  ;(process.env as { NODE_ENV?: string }).NODE_ENV = value
}

describe("ListRow", () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    jest.clearAllMocks()
    setNodeEnv("development")
  })

  afterAll(() => {
    setNodeEnv(originalNodeEnv)
  })

  it("plays a selection haptic before running the press handler", () => {
    const onPress = jest.fn()
    const screen = render(
      <ThemeProvider initialContext="light">
        <ListRow title="Open details" subtitle="Subtitle" onPress={onPress} />
      </ThemeProvider>,
    )

    fireEvent.press(screen.getByText("Open details"))

    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1)
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
