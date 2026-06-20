import { useProfileQuery } from "@/features/profile/data/profile.queries"

/**
 * Returns the employee's own uniqueCode (used as employeeCode in planning API calls).
 * Maps from UserProfile.id which is set from EmployeeDto.uniqueCode in the transformer.
 */
export function usePlanningEmployeeCode(): string | undefined {
  const { data: profile } = useProfileQuery()
  return profile?.id
}
