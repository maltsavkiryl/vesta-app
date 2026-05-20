import { format } from "date-fns"

import type {
  ClockSessionContext,
  Employer,
  LocationSnapshot,
  Shift,
  UserProfile,
} from "@/core/models"
import { persistLocalAsset } from "@/services/app/file-storage.service"
import { failure, success, type Result } from "@/shared/result"

import type { ClockError } from "./time.errors"
import type { ClockCommandInput, TimeRepository } from "./time.repository"

export interface ClockStartOption {
  context: ClockSessionContext
  distanceMeters?: number
  employerId: string
  employerName: string
  inGeofence: boolean
  locationLabel: string
}

export interface ClockStartResolution {
  mode: "shift" | "single-employer" | "multiple-employers"
  options: ClockStartOption[]
  recommendedOption: ClockStartOption
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function getDistanceMeters(
  location: LocationSnapshot,
  worksite: NonNullable<Employer["worksite"]>,
): number {
  const earthRadiusMeters = 6_371_000
  const latitudeDelta = toRadians(worksite.latitude - location.latitude)
  const longitudeDelta = toRadians(worksite.longitude - location.longitude)
  const fromLatitude = toRadians(location.latitude)
  const toLatitude = toRadians(worksite.latitude)
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}

function findEmployerForShift(shift: Shift, employers: Employer[]) {
  return employers.find(
    (employer) => employer.id === shift.employerId || employer.name === shift.venueName,
  )
}

function buildShiftClockStartOption(shift: Shift, employers: Employer[]): ClockStartOption {
  const employer = findEmployerForShift(shift, employers)

  return {
    context: {
      employerId: employer?.id ?? shift.employerId ?? shift.id,
      role: shift.role,
      scheduledEnd: shift.endTime,
      scheduledStart: shift.startTime,
      shiftId: shift.id,
      source: "shift",
      venueAddress: shift.venueAddress,
      venueName: shift.venueName,
    },
    employerId: employer?.id ?? shift.employerId ?? shift.id,
    employerName: employer?.name ?? shift.venueName,
    inGeofence: false,
    locationLabel: shift.venueAddress,
  }
}

function buildEmployerClockStartOption(
  employer: Employer,
  profileRole: UserProfile["role"],
  location?: LocationSnapshot,
): ClockStartOption {
  const distanceMeters =
    location && employer.worksite ? getDistanceMeters(location, employer.worksite) : undefined

  return {
    context: {
      employerId: employer.id,
      role: profileRole ?? employer.type,
      source: "employer",
      venueAddress: employer.worksite?.addressLabel ?? employer.city,
      venueName: employer.name,
    },
    distanceMeters,
    employerId: employer.id,
    employerName: employer.name,
    inGeofence: Boolean(
      employer.worksite &&
      distanceMeters !== undefined &&
      distanceMeters <= employer.worksite.radiusMeters,
    ),
    locationLabel: employer.worksite?.addressLabel ?? employer.city,
  }
}

function sortClockStartOptions(left: ClockStartOption, right: ClockStartOption) {
  if (left.inGeofence !== right.inGeofence) {
    return left.inGeofence ? -1 : 1
  }
  if (left.distanceMeters !== undefined && right.distanceMeters !== undefined) {
    return left.distanceMeters - right.distanceMeters
  }
  if (left.distanceMeters !== undefined) return -1
  if (right.distanceMeters !== undefined) return 1
  return 0
}

function getTodayShifts(shifts: Shift[], today: string) {
  return shifts
    .filter((shift) => shift.date === today)
    .sort((left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime))
}

export function formatClockStartDistance(distanceMeters?: number) {
  if (distanceMeters === undefined) return null
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m away`
  return `${(distanceMeters / 1000).toFixed(1)} km away`
}

export function resolveClockStart(input: {
  employers: Employer[]
  location?: LocationSnapshot
  profileRole?: UserProfile["role"]
  shifts: Shift[]
  today?: string
}): Result<ClockStartResolution, ClockError> {
  const today = input.today ?? format(new Date(), "yyyy-MM-dd")
  const todayShift = getTodayShifts(input.shifts, today)[0]

  if (todayShift) {
    const recommendedOption = buildShiftClockStartOption(todayShift, input.employers)
    return success({
      mode: "shift",
      options: [recommendedOption],
      recommendedOption,
    })
  }

  const employerOptions = input.employers
    .filter((employer) => !employer.clockConfig.requiresScheduledShift)
    .map((employer) => buildEmployerClockStartOption(employer, input.profileRole, input.location))
    .sort(sortClockStartOptions)

  const recommendedOption = employerOptions[0]
  if (!recommendedOption) {
    return failure({
      type: "no-clock-context",
      message: "No linked employer currently allows timer starts without a scheduled shift.",
    })
  }

  return success({
    mode: employerOptions.length === 1 ? "single-employer" : "multiple-employers",
    options: employerOptions,
    recommendedOption,
  })
}

async function persistProofPhoto(
  accountId: string,
  input?: ClockCommandInput,
): Promise<ClockCommandInput | undefined> {
  if (!input?.proofPhoto?.uri || !input.proofPhoto.fileName) {
    return input
  }

  const persistedUri = await persistLocalAsset({
    accountId,
    fileName: input.proofPhoto.fileName,
    kind: "proof-photos",
    sourceUri: input.proofPhoto.uri,
  })

  return {
    ...input,
    proofPhoto: {
      ...input.proofPhoto,
      uri: persistedUri,
    },
  }
}

export async function clockInWorkflow(
  repository: TimeRepository,
  accountId: string,
  input?: ClockCommandInput,
): Promise<Result<Awaited<ReturnType<TimeRepository["getClockSession"]>>, ClockError>> {
  return repository.clockIn(accountId, await persistProofPhoto(accountId, input))
}

export function clockOutWorkflow(
  repository: TimeRepository,
  accountId: string,
  input?: ClockCommandInput,
) {
  return repository.clockOut(accountId, input)
}
