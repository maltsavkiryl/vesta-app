import { Translations } from "./en"

const nl: Translations = {
  common: {
    actions: {
      back: "Terug",
      cancel: "Annuleren",
      close: "Sluiten",
      done: "Klaar",
      ok: "Oké",
      retry: "Opnieuw proberen",
      save: "Opslaan",
    },
    states: {
      empty: "Hier is nog niets",
      error: "Er is iets misgegaan",
      loading: "Laden…",
      retry: "Probeer opnieuw",
    },
  },
  errorScreen: {
    friendlySubtitle:
      "De app liep tegen een onverwacht probleem aan. Je kunt het opnieuw proberen — als het blijft gebeuren, neem dan contact op met Vesta-support.",
    reset: "App herstarten",
    title: "Er is iets misgegaan",
  },
  notifications: {
    actions: {
      editTemplate: "Sjabloon bewerken",
      open: "Openen",
      reviewContract: "Contract bekijken",
      reviewContracts: "Contracten bekijken",
      reviewDocuments: "Documenten bekijken",
      reviewPayslip: "Loonbrief bekijken",
      reviewPayslips: "Loonbrieven bekijken",
      reviewPlanning: "Planning bekijken",
      reviewProfile: "Profiel bekijken",
      reviewRequest: "Aanvraag bekijken",
      reviewShift: "Shift bekijken",
      reviewTime: "Tijd bekijken",
      setHours: "Uren instellen",
      uploadNow: "Nu uploaden",
      viewShift: "Shift bekijken",
      viewTasks: "Taken bekijken",
      viewUpdate: "Update bekijken",
    },
    clearAll: "Alle meldingen wissen",
    emptyBody:
      "Op dit moment geen meldingen. We laten het je weten zodra er iets je aandacht nodig heeft.",
    emptyTitle: "Helemaal bij",
    groups: {
      earlier: "Eerder deze week",
      today: "Vandaag",
      yesterday: "Gisteren",
    },
    markAllRead: "Alles als gelezen markeren",
    title: "Meldingen",
    unread: "{{count}} ongelezen",
  },
}

export default nl
