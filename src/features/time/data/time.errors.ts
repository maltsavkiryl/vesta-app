export type ClockError =
  | { type: "not-found"; message: string }
  | { type: "already-clocked-in"; message: string }
  | { type: "not-clocked-in"; message: string }
  | { type: "break-invalid"; message: string }
