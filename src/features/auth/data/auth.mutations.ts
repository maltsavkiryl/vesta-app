import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { appRepositories } from "@/composition/repositories"
import type { AppSession } from "@/features/auth/data/auth.transformer"

import { authQueryKeys, useAuthSession } from "./auth.queries"
import { completeOnboardingWorkflow } from "./auth.workflow"

const resourceRoots = ["profile", "schedule", "time", "documents", "notifications", "home"]

function invalidateSignedInResources(
  queryClient: ReturnType<typeof useQueryClient>,
  accountId: string,
) {
  for (const root of resourceRoots) {
    void queryClient.invalidateQueries({ queryKey: [root, accountId] })
  }
}

export function useSignInMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Parameters<typeof appRepositories.auth.signIn>[0]) =>
      appRepositories.auth.signIn(payload),
    onSuccess: (result) => {
      if (!result.ok) return
      queryClient.setQueryData(authQueryKeys.session, result.data)
      if (result.data.accountId) {
        invalidateSignedInResources(queryClient, result.data.accountId)
      }
    },
  })
}

export function useRegisterMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Parameters<typeof appRepositories.auth.register>[0]) =>
      appRepositories.auth.register(payload),
    onSuccess: (result) => {
      if (!result.ok) return
      queryClient.setQueryData(authQueryKeys.session, result.data)
      if (result.data.accountId) {
        invalidateSignedInResources(queryClient, result.data.accountId)
      }
    },
  })
}

export function useSignOutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => appRepositories.auth.signOut(),
    onSuccess: (session) => {
      queryClient.setQueryData(authQueryKeys.session, session)
      for (const root of resourceRoots) {
        void queryClient.removeQueries({ queryKey: [root] })
      }
    },
  })
}

export function useRequestPasswordResetMutation() {
  return useMutation({
    mutationFn: (email: string) => appRepositories.auth.requestPasswordReset(email),
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ email, nextPassword }: { email: string; nextPassword: string }) =>
      appRepositories.auth.resetPassword(email, nextPassword),
  })
}

export function useChangePasswordMutation() {
  const { accountId } = useAuthSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      currentPassword,
      nextPassword,
    }: {
      currentPassword: string
      nextPassword: string
    }) => appRepositories.auth.changePassword(accountId!, currentPassword, nextPassword),
    onSuccess: (result) => {
      if (!accountId || !result.ok) return
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.session })
      invalidateSignedInResources(queryClient, accountId)
    },
  })
}

export function useCompleteOnboardingMutation() {
  const queryClient = useQueryClient()
  const { accountId } = useAuthSession()

  return useMutation({
    mutationFn: (payload: Parameters<typeof completeOnboardingWorkflow>[2]) =>
      completeOnboardingWorkflow(appRepositories.auth, accountId!, payload),
    onSuccess: (result) => {
      if (!result.ok) return
      queryClient.setQueryData(authQueryKeys.session, result.data)
      if (result.data.accountId) {
        invalidateSignedInResources(queryClient, result.data.accountId)
      }
    },
  })
}

export function useAuthActions() {
  const changePasswordMutation = useChangePasswordMutation()
  const signInMutation = useSignInMutation()
  const registerMutation = useRegisterMutation()
  const signOutMutation = useSignOutMutation()
  const requestPasswordResetMutation = useRequestPasswordResetMutation()
  const resetPasswordMutation = useResetPasswordMutation()
  const completeOnboardingMutation = useCompleteOnboardingMutation()

  return useMemo(
    () => ({
      changePassword: (payload: { currentPassword: string; nextPassword: string }) =>
        changePasswordMutation.mutateAsync(payload),
      completeOnboarding: (payload: Parameters<typeof completeOnboardingWorkflow>[2]) =>
        completeOnboardingMutation.mutateAsync(payload),
      register: (payload: Parameters<typeof appRepositories.auth.register>[0]) =>
        registerMutation.mutateAsync(payload),
      requestPasswordReset: (email: string) => requestPasswordResetMutation.mutateAsync(email),
      resetPassword: (payload: { email: string; nextPassword: string }) =>
        resetPasswordMutation.mutateAsync(payload),
      signIn: (payload: Parameters<typeof appRepositories.auth.signIn>[0]) =>
        signInMutation.mutateAsync(payload),
      signOut: (): Promise<AppSession> => signOutMutation.mutateAsync(),
    }),
    [
      changePasswordMutation,
      completeOnboardingMutation,
      registerMutation,
      requestPasswordResetMutation,
      resetPasswordMutation,
      signInMutation,
      signOutMutation,
    ],
  )
}
