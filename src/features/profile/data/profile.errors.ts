export type ProfileError =
  | { type: "not-found"; message: string }
  | { type: "validation"; message: string }
  | { type: "employer-not-found"; message: string }
  | { type: "employer-already-joined"; message: string }
