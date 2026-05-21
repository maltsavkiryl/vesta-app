import { useEffect } from "react"
import { Appearance } from "react-native"
import { render, waitFor } from "@testing-library/react-native"

import { ThemeProvider, useAppTheme } from "./context"

jest.mock("expo-system-ui", () => ({
  setBackgroundColorAsync: jest.fn(),
}))

function ThemeOverrideProbe({ mode }: { mode: "light" | "dark" | undefined }) {
  const { setThemeContextOverride } = useAppTheme()

  useEffect(() => {
    setThemeContextOverride(mode)
  }, [mode, setThemeContextOverride])

  return null
}

describe("ThemeProvider", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("pins the native appearance when a light override is active", async () => {
    const setColorSchemeSpy = jest.spyOn(Appearance, "setColorScheme")

    render(
      <ThemeProvider initialContext="light">
        <ThemeOverrideProbe mode="light" />
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(setColorSchemeSpy).toHaveBeenCalledWith("light")
    })
  })

  it("returns native appearance control to the system when the override is cleared", async () => {
    const setColorSchemeSpy = jest.spyOn(Appearance, "setColorScheme")

    const { rerender } = render(
      <ThemeProvider>
        <ThemeOverrideProbe mode="light" />
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(setColorSchemeSpy).toHaveBeenCalledWith("light")
    })

    rerender(
      <ThemeProvider>
        <ThemeOverrideProbe mode={undefined} />
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(setColorSchemeSpy).toHaveBeenCalledWith("unspecified")
    })
  })
})
