import { render } from "@testing-library/react-native"

import { ThemeProvider } from "@/theme/context"

import { Text } from "./Text"

function renderText(ui: React.ReactElement) {
  return render(<ThemeProvider initialContext="light">{ui}</ThemeProvider>)
}

describe("Text dynamic type", () => {
  it("enables font scaling and caps body copy at 1.6x", () => {
    const screen = renderText(<Text text="Body copy" />)
    const node = screen.getByText("Body copy")

    expect(node.props.allowFontScaling).toBe(true)
    expect(node.props.maxFontSizeMultiplier).toBe(1.6)
  })

  it("uses a tighter cap for large display headings", () => {
    const screen = renderText(<Text preset="heading" text="Big heading" />)
    const node = screen.getByText("Big heading")

    // heading preset resolves to 36pt -> 1.3x cap.
    expect(node.props.maxFontSizeMultiplier).toBe(1.3)
  })

  it("lets callers override the scaling cap", () => {
    const screen = renderText(<Text maxFontSizeMultiplier={1.1} text="Capped" />)
    const node = screen.getByText("Capped")

    expect(node.props.maxFontSizeMultiplier).toBe(1.1)
  })
})
