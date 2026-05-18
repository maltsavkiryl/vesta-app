export interface AuthSessionDto {
  accountId: string | null
  needsOnboarding: boolean
  signedInAt?: string
}

export interface SignInDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  firstName: string
  lastName: string
  password: string
}
