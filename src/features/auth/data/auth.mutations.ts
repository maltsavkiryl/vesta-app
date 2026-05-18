import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { AppStoreState } from "@/core/models"
import { setAccountStateCache, setSessionCache } from "@/services/app/app.cache"
import type {
  AuthResult,
  MockBackendSessionDto,
  RegisterPayload,
  SignInPayload,
} from "@/services/app/app.types"

import { useAuthSession } from "./auth.queries"
import { completeOnboarding, signIn, signOut, register, requestPasswordReset } from "./auth.service"

type AuthMutationResult = {
  result: AuthResult
  session: MockBackendSessionDto
  state: AppStoreState | null
}

export function useSignInMutation() {
  const queryClient = useQueryClient()

  return useMutation<AuthMutationResult, Error, SignInPayload>({
    mutationFn: async (payload) => signIn(payload),
    onSuccess: (response) => {
      if (!response.result.ok || !response.session.accountId || !response.state) return
      setSessionCache(queryClient, response.session)
      setAccountStateCache(queryClient, response.session.accountId, response.state)
    },
  })
}

export function useRegisterMutation() {
  const queryClient = useQueryClient()

  return useMutation<AuthMutationResult, Error, RegisterPayload>({
    mutationFn: async (payload) => register(payload),
    onSuccess: (response) => {
      if (!response.result.ok || !response.session.accountId || !response.state) return
      setSessionCache(queryClient, response.session)
      setAccountStateCache(queryClient, response.session.accountId, response.state)
    },
  })
}

export function useSignOutMutation() {
  const queryClient = useQueryClient()

  return useMutation<MockBackendSessionDto, Error, void>({
    mutationFn: async () => signOut(),
    onSuccess: (session) => {
      setSessionCache(queryClient, session)
    },
  })
}

export function useRequestPasswordResetMutation() {
  const queryClient = useQueryClient()

  return useMutation<MockBackendSessionDto, Error, string>({
    mutationFn: async (email) => requestPasswordReset(email),
    onSuccess: (session) => {
      setSessionCache(queryClient, session)
    },
  })
}

export function useCompleteOnboardingMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAuthSession()

  return useMutation<AppStoreState, Error, Parameters<typeof completeOnboarding>[1]>({
    mutationFn: (payload: Parameters<typeof completeOnboarding>[1]) =>
      Promise.resolve(completeOnboarding(accountId!, payload)),
    onSuccess: (state) => {
      if (!accountId) return
      setAccountStateCache(queryClient, accountId, state)
    },
  })
}

export function useAuthActions() {
  const signInMutation = useSignInMutation()
  const registerMutation = useRegisterMutation()
  const signOutMutation = useSignOutMutation()
  const requestPasswordResetMutation = useRequestPasswordResetMutation()
  const completeOnboardingMutation = useCompleteOnboardingMutation()

  return useMemo(
    () => ({
      completeOnboarding: (payload: Parameters<typeof completeOnboarding>[1]) =>
        completeOnboardingMutation.mutateAsync(payload),
      register: (payload: Parameters<typeof register>[0]) => registerMutation.mutateAsync(payload),
      requestPasswordReset: (email: string) => requestPasswordResetMutation.mutateAsync(email),
      signIn: (payload: Parameters<typeof signIn>[0]) => signInMutation.mutateAsync(payload),
      signOut: () => signOutMutation.mutateAsync(),
    }),
    [
      completeOnboardingMutation,
      registerMutation,
      requestPasswordResetMutation,
      signInMutation,
      signOutMutation,
    ],
  )
}
