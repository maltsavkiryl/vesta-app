import { DARK_DESIGN_TOKENS, LIGHT_DESIGN_TOKENS } from "./tokens"

// Minimal WCAG 2.x relative-luminance + contrast-ratio helper (sRGB hex only).
function channelLuminance(channel: number): number {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "")
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground)
  const l2 = relativeLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

const WCAG_AA_BODY = 4.5

describe("textMuted contrast (WCAG AA)", () => {
  it("light textMuted clears 4.5:1 against the light background", () => {
    const ratio = contrastRatio(LIGHT_DESIGN_TOKENS.textMuted, LIGHT_DESIGN_TOKENS.background)
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_BODY)
  })

  it("dark textMuted clears 4.5:1 against the dark card surface", () => {
    const ratio = contrastRatio(DARK_DESIGN_TOKENS.textMuted, DARK_DESIGN_TOKENS.surface)
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_BODY)
  })

  it("dark textMuted clears 4.5:1 against the darkest grouped background", () => {
    const ratio = contrastRatio(DARK_DESIGN_TOKENS.textMuted, DARK_DESIGN_TOKENS.background)
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_BODY)
  })

  it("sanity-checks the helper against a known failing/passing pair", () => {
    // Pure black on white is the canonical 21:1 maximum.
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0)
    // The old #AEAEB2 muted grey failed AA on white (~2.2:1).
    expect(contrastRatio("#AEAEB2", "#FFFFFF")).toBeLessThan(WCAG_AA_BODY)
  })
})
