export type TabId = "home" | "schedule" | "time" | "documents" | "profile";

export type AvailabilityStatus = "unavailable" | "available" | "preferred";

export interface DayAvailability {
  status: AvailabilityStatus;
  startTime: string; // "HH:MM" 24h
  endTime: string;
}

export type AvailabilityMap = Record<string, DayAvailability>; // key: "YYYY-MM-DD"

export interface ShiftEntry {
  id: number;
  date: string;       // "YYYY-MM-DD"
  dateLabel: string;  // "Apr 26"
  dayLabel: string;   // "Today" / "Mon"
  time: string;       // "17:00 – 23:00"
  role: string;
  location: string;
  address: string;
  status: "confirmed" | "changed" | "pending";
}

export interface RequestEntry {
  id: number;
  type: "Time off" | "Shift swap";
  dateRange: string;
  status: "pending" | "approved" | "denied";
  reason: string;
}

export interface ClockSummary {
  clockInTime: string;     // "17:00"
  workedSecs: number;      // seconds
  breakSecs: number;       // seconds
  role: string;
  location: string;
}

export type SheetConfig =
  | { kind: "availability"; date: string; dayName: string; dateFull: string; current: DayAvailability; onSave: (a: DayAvailability) => void }
  | { kind: "shiftDetail"; shift: ShiftEntry }
  | { kind: "request" }
  | { kind: "upload"; docName?: string }
  | { kind: "notifications" }
  | { kind: "clockout"; summary: ClockSummary; onConfirm: () => void };

// ── Seed data ──────────────────────────────────────────────────────────────

export const ALL_SHIFTS: ShiftEntry[] = [
  { id: 1, date: "2026-04-26", dateLabel: "Apr 26", dayLabel: "Today",     time: "17:00 – 23:00", role: "Waiter",     location: "Bistro Noir", address: "Rue de la Loi 123, Brussels",  status: "confirmed" },
  { id: 2, date: "2026-04-27", dateLabel: "Apr 27", dayLabel: "Mon",       time: "12:00 – 18:00", role: "Waiter",     location: "Bistro Noir", address: "Rue de la Loi 123, Brussels",  status: "confirmed" },
  { id: 3, date: "2026-04-28", dateLabel: "Apr 28", dayLabel: "Tue",       time: "18:00 – 23:30", role: "Waiter",     location: "Bistro Noir", address: "Rue de la Loi 123, Brussels",  status: "confirmed" },
  { id: 4, date: "2026-04-30", dateLabel: "Apr 30", dayLabel: "Thu",       time: "17:00 – 23:00", role: "Bartender",  location: "Bistro Noir", address: "Rue de la Loi 123, Brussels",  status: "confirmed" },
  { id: 5, date: "2026-05-02", dateLabel: "May 2",  dayLabel: "Sat",       time: "17:00 – 00:00", role: "Waiter",     location: "Bistro Noir", address: "Rue de la Loi 123, Brussels",  status: "changed"   },
  { id: 6, date: "2026-05-05", dateLabel: "May 5",  dayLabel: "Tue",       time: "17:00 – 23:00", role: "Waiter",     location: "Bistro Noir", address: "Rue de la Loi 123, Brussels",  status: "confirmed" },
  { id: 7, date: "2026-05-07", dateLabel: "May 7",  dayLabel: "Thu",       time: "17:00 – 23:00", role: "Waiter",     location: "Bistro Noir", address: "Rue de la Loi 123, Brussels",  status: "confirmed" },
  { id: 8, date: "2026-05-09", dateLabel: "May 9",  dayLabel: "Sat",       time: "12:00 – 23:00", role: "Bartender",  location: "Bistro Noir", address: "Rue de la Loi 123, Brussels",  status: "confirmed" },
  { id: 9, date: "2026-05-12", dateLabel: "May 12", dayLabel: "Tue",       time: "18:00 – 23:30", role: "Waiter",     location: "Bistro Noir", address: "Rue de la Loi 123, Brussels",  status: "confirmed" },
  { id:10, date: "2026-05-16", dateLabel: "May 16", dayLabel: "Sat",       time: "12:00 – 23:00", role: "Waiter",     location: "Bistro Noir", address: "Rue de la Loi 123, Brussels",  status: "confirmed" },
  { id:11, date: "2026-05-19", dateLabel: "May 19", dayLabel: "Tue",       time: "17:00 – 23:00", role: "Bartender",  location: "Bistro Noir", address: "Rue de la Loi 123, Brussels",  status: "confirmed" },
  { id:12, date: "2026-05-23", dateLabel: "May 23", dayLabel: "Sat",       time: "12:00 – 23:00", role: "Waiter",     location: "Bistro Noir", address: "Rue de la Loi 123, Brussels",  status: "confirmed" },
];

export const SHIFTS_SET = new Set(ALL_SHIFTS.map((s) => s.date));

export const INIT_AVAILABILITY: AvailabilityMap = {
  "2026-04-27": { status: "available",    startTime: "17:00", endTime: "23:00" },
  "2026-04-28": { status: "available",    startTime: "17:00", endTime: "23:00" },
  "2026-04-29": { status: "preferred",    startTime: "12:00", endTime: "18:00" },
  "2026-04-30": { status: "preferred",    startTime: "17:00", endTime: "23:00" },
  "2026-05-01": { status: "preferred",    startTime: "17:00", endTime: "23:00" },
  "2026-05-02": { status: "preferred",    startTime: "17:00", endTime: "00:00" },
  "2026-05-03": { status: "preferred",    startTime: "12:00", endTime: "00:00" },
  "2026-05-04": { status: "unavailable",  startTime: "09:00", endTime: "17:00" },
  "2026-05-05": { status: "available",    startTime: "17:00", endTime: "23:00" },
  "2026-05-06": { status: "available",    startTime: "17:00", endTime: "23:00" },
  "2026-05-07": { status: "preferred",    startTime: "17:00", endTime: "23:00" },
  "2026-05-08": { status: "preferred",    startTime: "12:00", endTime: "23:00" },
  "2026-05-09": { status: "preferred",    startTime: "12:00", endTime: "23:00" },
  "2026-05-10": { status: "unavailable",  startTime: "09:00", endTime: "17:00" },
};

export const INIT_REQUESTS: RequestEntry[] = [
  { id: 1, type: "Time off",   dateRange: "May 10–12", status: "pending",  reason: "Personal"              },
  { id: 2, type: "Shift swap", dateRange: "May 5",     status: "approved", reason: "Friday shift → Monday" },
];

export const TODAY_STR = "2026-04-26";

export const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function makeDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function formatDateFull(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const date = new Date(y, m - 1, d);
  return `${dow[date.getDay()]}, ${MONTHS[m - 1]} ${d}, ${y}`;
}

export function formatDateShort(dateStr: string) {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${MONTHS[m - 1].slice(0, 3)} ${d}`;
}