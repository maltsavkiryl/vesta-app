import { getVenueMapUrl, openVenueInMaps } from "./openVenueInMaps"

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

  it("opens the venue in maps when the device can handle the URL", async () => {
    const canOpenURL = jest.fn().mockResolvedValue(true)
    const openURL = jest.fn().mockResolvedValue(undefined)
    const showAlert = jest.fn()

    await expect(
      openVenueInMaps("Rue de la Loi 123, Brussels", {
        canOpenURL,
        openURL,
        platformName: "ios",
        showAlert,
      }),
    ).resolves.toBe(true)

    expect(canOpenURL).toHaveBeenCalledWith(
      "http://maps.apple.com/?q=Rue%20de%20la%20Loi%20123%2C%20Brussels",
    )
    expect(openURL).toHaveBeenCalledWith(
      "http://maps.apple.com/?q=Rue%20de%20la%20Loi%20123%2C%20Brussels",
    )
    expect(showAlert).not.toHaveBeenCalled()
  })

  it("shows the fallback alert when the URL cannot be opened", async () => {
    const canOpenURL = jest.fn().mockResolvedValue(false)
    const openURL = jest.fn()
    const showAlert = jest.fn()

    await expect(
      openVenueInMaps("Rue de la Loi 123, Brussels", {
        canOpenURL,
        openURL,
        platformName: "ios",
        showAlert,
      }),
    ).resolves.toBe(false)

    expect(openURL).not.toHaveBeenCalled()
    expect(showAlert).toHaveBeenCalledWith(
      "Maps unavailable",
      "Set up a maps app on this device to open the shift location.",
    )
  })
})
