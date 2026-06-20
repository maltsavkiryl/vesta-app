export type PlanningError =
  | { type: "not-found"; message: string }
  | { type: "forbidden"; message: string }
  | { type: "validation"; message: string }
  | { type: "already-claimed"; message: string }
  | { type: "conflict"; message: string }
