export type DocumentUploadError =
  | { type: "not-found"; message: string }
  | { type: "validation"; message: string }
  | { type: "upload-failed"; message: string }
