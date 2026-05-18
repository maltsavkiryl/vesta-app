export type ScheduleError =
  | { type: "not-found"; message: string }
  | { type: "validation"; message: string }
