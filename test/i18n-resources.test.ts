import type { i18n as I18nType } from "i18next"

import en from "../src/i18n/en"
import fr from "../src/i18n/fr"
import nl from "../src/i18n/nl"

// The global test setup mocks i18next; use the real implementation here so we
// can exercise resource resolution and language switching for real.
const actual = jest.requireActual("i18next")
const i18next = (actual.default ?? actual) as typeof import("i18next").default

describe("i18n resources", () => {
  let instance: I18nType

  beforeAll(async () => {
    instance = i18next.createInstance()
    await instance.init({
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      lng: "en",
      resources: { en, fr, nl },
    })
  })

  it("resolves a common key in English", () => {
    expect(instance.t("common:actions.save")).toBe("Save")
  })

  it("resolves a Dutch (nl-BE) string after changeLanguage", async () => {
    await instance.changeLanguage("nl")
    expect(instance.t("common:actions.save")).toBe("Opslaan")
    expect(instance.t("notifications:emptyTitle")).toBe("Helemaal bij")
  })

  it("resolves a French (fr-BE) string after changeLanguage", async () => {
    await instance.changeLanguage("fr")
    expect(instance.t("common:actions.cancel")).toBe("Annuler")
  })

  it("interpolates count values", async () => {
    await instance.changeLanguage("nl")
    expect(instance.t("notifications:unread", { count: 3 })).toBe("3 ongelezen")
  })

  it("falls back to en for a key missing in the active language", async () => {
    const fallbackInstance = i18next.createInstance()
    await fallbackInstance.init({
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      lng: "nl",
      resources: {
        en: { sample: { hello: "Hello" } },
        nl: { sample: {} },
      },
    })

    expect(fallbackInstance.t("sample:hello")).toBe("Hello")
  })
})
