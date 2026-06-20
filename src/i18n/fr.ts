import { Translations } from "./en"

const fr: Translations = {
  common: {
    actions: {
      back: "Retour",
      cancel: "Annuler",
      close: "Fermer",
      done: "Terminé",
      ok: "OK",
      retry: "Réessayer",
      save: "Enregistrer",
    },
    states: {
      empty: "Rien pour le moment",
      error: "Une erreur est survenue",
      loading: "Chargement…",
      retry: "Réessayer",
    },
  },
  errorScreen: {
    friendlySubtitle:
      "L'application a rencontré un problème inattendu. Vous pouvez réessayer — si cela persiste, veuillez contacter le support Vesta.",
    reset: "Redémarrer l'application",
    title: "Une erreur est survenue",
  },
  notifications: {
    actions: {
      editTemplate: "Modifier le modèle",
      open: "Ouvrir",
      reviewContract: "Consulter le contrat",
      reviewContracts: "Consulter les contrats",
      reviewDocuments: "Consulter les documents",
      reviewPayslip: "Consulter la fiche de paie",
      reviewPayslips: "Consulter les fiches de paie",
      reviewPlanning: "Consulter le planning",
      reviewProfile: "Consulter le profil",
      reviewRequest: "Consulter la demande",
      reviewShift: "Consulter le service",
      reviewTime: "Consulter les heures",
      setHours: "Définir les heures",
      uploadNow: "Téléverser",
      viewShift: "Voir le service",
      viewTasks: "Voir les tâches",
      viewUpdate: "Voir la mise à jour",
    },
    clearAll: "Effacer toutes les notifications",
    emptyBody:
      "Aucune notification pour l'instant. Nous vous préviendrons dès que quelque chose nécessite votre attention.",
    emptyTitle: "Tout est à jour",
    groups: {
      earlier: "Plus tôt cette semaine",
      today: "Aujourd'hui",
      yesterday: "Hier",
    },
    markAllRead: "Tout marquer comme lu",
    title: "Notifications",
    unread: "{{count}} non lues",
  },
}

export default fr
