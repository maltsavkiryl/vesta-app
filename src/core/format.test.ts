import { formatCurrency, formatLocalizedDate, formatNumber } from "./format"

// Intl inserts non-breaking / narrow no-break spaces as group separators in
// some locales; normalise them so assertions stay readable.
const normalize = (value: string) => value.replace(/[\u00a0\u202f]/g, " ")

describe("formatLocalizedDate", () => {
  const date = "2026-01-15T12:00:00.000Z"

  it("renders the Dutch month name", () => {
    expect(formatLocalizedDate(date, "full", "nl")).toContain("januari")
  })

  it("renders the French month name", () => {
    expect(formatLocalizedDate(date, "full", "fr")).toContain("janvier")
  })

  it("renders the English month name", () => {
    expect(formatLocalizedDate(date, "full", "en")).toContain("January")
  })

  it("returns an empty string for invalid input", () => {
    expect(formatLocalizedDate("not-a-date", "short", "en")).toBe("")
  })
})

describe("formatCurrency", () => {
  it("formats EUR the Dutch (BE) way", () => {
    const result = normalize(formatCurrency(1234.56, { locale: "nl" }))
    expect(result).toContain("1.234,56")
    expect(result).toContain("€")
  })

  it("formats EUR the English way", () => {
    const result = normalize(formatCurrency(1234.56, { locale: "en" }))
    expect(result).toContain("1,234.56")
    expect(result).toContain("€")
  })

  it("formats EUR the French (BE) way", () => {
    const result = normalize(formatCurrency(1234.56, { locale: "fr" }))
    expect(result).toContain("1 234,56")
    expect(result).toContain("€")
  })
})

describe("formatNumber", () => {
  it("uses locale-aware grouping and decimal separators", () => {
    expect(normalize(formatNumber(1234.5, "nl"))).toBe("1.234,5")
    expect(normalize(formatNumber(1234.5, "en"))).toBe("1,234.5")
  })
})
