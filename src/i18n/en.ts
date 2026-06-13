const en = {
  common: {
    actions: {
      back: "Back",
      cancel: "Cancel",
      close: "Close",
      done: "Done",
      ok: "OK",
      retry: "Retry",
      save: "Save",
    },
    states: {
      empty: "Nothing here yet",
      error: "Something went wrong",
      loading: "Loading…",
      retry: "Try again",
    },
  },
  errorScreen: {
    friendlySubtitle:
      "The app ran into an unexpected problem. You can try again — if it keeps happening, please contact Vesta support.",
    reset: "Restart app",
    title: "Something went wrong",
  },
  notifications: {
    actions: {
      editTemplate: "Edit template",
      open: "Open",
      reviewContract: "Review contract",
      reviewContracts: "Review contracts",
      reviewDocuments: "Review documents",
      reviewPayslip: "Review payslip",
      reviewPayslips: "Review payslips",
      reviewPlanning: "Review planning",
      reviewProfile: "Review profile",
      reviewRequest: "Review request",
      reviewShift: "Review shift",
      reviewTime: "Review time",
      setHours: "Set hours",
      uploadNow: "Upload now",
      viewShift: "View shift",
      viewTasks: "View tasks",
      viewUpdate: "View update",
    },
    clearAll: "Clear all notifications",
    emptyBody:
      "No notifications right now. We'll let you know when something needs your attention.",
    emptyTitle: "All caught up",
    groups: {
      earlier: "Earlier this week",
      today: "Today",
      yesterday: "Yesterday",
    },
    markAllRead: "Mark all read",
    title: "Notifications",
    unread: "{{count}} unread",
  },
}

export default en
export type Translations = typeof en
