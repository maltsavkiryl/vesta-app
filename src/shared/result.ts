export type Result<TSuccess, TError> =
  | {
      ok: true
      data: TSuccess
    }
  | {
      ok: false
      error: TError
    }

export function success<TSuccess>(data: TSuccess): Result<TSuccess, never> {
  return { ok: true, data }
}

export function failure<TError>(error: TError): Result<never, TError> {
  return { ok: false, error }
}
