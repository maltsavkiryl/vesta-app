import { getVenueMapUrl } from "./openVenueInMaps"

describe("getVenueMapUrl", () => {
  it("builds an Apple Maps URL on iOS", () => {
    expect(getVenueMapUrl("Rue de la Loi 123, Brussels", "ios")).toBe(
      "http://maps.apple.com/?q=Rue%20de%20la%20Loi%20123%2C%20Brussels",
    )
  })

  it("builds a geo URL on Android", () => {
    expect(getVenueMapUrl("Rue de la Loi 123, Brussels", "android")).toBe(
      "geo:0,0?q=Rue%20de%20la%20Loi%20123%2C%20Brussels",
    )
  })
})
