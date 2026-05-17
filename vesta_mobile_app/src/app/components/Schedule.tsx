import { useState, useMemo } from "react";
import { ChevronDown, Plus, MapPin, Clock } from "lucide-react";
import { MonthCalendar } from "./MonthCalendar";
import {
  ALL_SHIFTS, SHIFTS_SET, INIT_AVAILABILITY, INIT_REQUESTS,
  TODAY_STR, formatDateFull, formatDateShort, makeDateStr,
} from "./types";
import type { AvailabilityMap, ShiftEntry, RequestEntry, SheetConfig } from "./types";
import { useTheme } from "../theme";

type Segment = "shifts" | "availability" | "requests";

const DOW_SHORT  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOW_FULL   = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getFullDateLabel(ds: string): string {
  const [y, m, d] = ds.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (ds === TODAY_STR) return `Today, ${MONTHS_SHORT[m - 1]} ${d}`;
  return `${DOW_FULL[date.getDay()]}, ${MONTHS_SHORT[m - 1]} ${d}`;
}

interface Props { openSheet: (cfg: SheetConfig) => void; }

export function Schedule({ openSheet }: Props) {
  const { colors, theme } = useTheme();
  const ACCENT = colors.accent;
  const BG = colors.bg;
  const CARD = colors.card;
  const TEXT1 = colors.text1;
  const TEXT2 = colors.text2;
  const TEXT3 = colors.text3;
  const SEP = colors.sep;
  const GREEN = colors.green;
  const SHADOW = colors.shadow;

  const [segment,      setSegment]      = useState<Segment>("shifts");
  const [selectedDate, setSelectedDate] = useState(TODAY_STR);
  const [calYear,      setCalYear]      = useState(2026);
  const [calMonth,     setCalMonth]     = useState(3); // April (0-indexed)
  const [availability, setAvailability] = useState<AvailabilityMap>(INIT_AVAILABILITY);
  const [requests,     setRequests]     = useState<RequestEntry[]>(INIT_REQUESTS);

  const AVAIL_LABEL: Record<string, string> = { preferred: "Preferred", available: "Available", unavailable: "Unavailable" };
  const AVAIL_COLOR: Record<string, string> = { preferred: ACCENT, available: GREEN, unavailable: TEXT3 };

  const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
    confirmed: { color: GREEN,        bg: theme === "dark" ? "rgba(48,209,88,0.2)" : "rgba(52,199,89,0.1)",  label: "Confirmed" },
    changed:   { color: colors.amber, bg: theme === "dark" ? "rgba(255,214,10,0.2)" : "rgba(255,159,10,0.1)", label: "Changed"   },
    pending:   { color: TEXT3,        bg: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",     label: "Pending"   },
  };

  const dayShifts     = useMemo(() => ALL_SHIFTS.filter(s => s.date === selectedDate),           [selectedDate]);
  const upcomingShifts = useMemo(() => ALL_SHIFTS.filter(s => s.date >= TODAY_STR).slice(0, 8), []);

  const prevMonth = () => setCalMonth(m => { if (m === 0) { setCalYear(y => y - 1); return 11; } return m - 1; });
  const nextMonth = () => setCalMonth(m => { if (m === 11) { setCalYear(y => y + 1); return 0; } return m + 1; });

  const handleSelectDate = (ds: string) => {
    const [y, m] = ds.split("-").map(Number);
    setSelectedDate(ds);
    setCalYear(y);
    setCalMonth(m - 1);
  };

  const openAvailSheet = (ds: string) => {
    const [y, m, d] = ds.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    openSheet({
      kind:     "availability",
      date:     ds,
      dayName:  DOW_SHORT[dateObj.getDay()],
      dateFull: formatDateFull(ds),
      current:  availability[ds] ?? { status: "unavailable", startTime: "09:00", endTime: "17:00" },
      onSave:   (avail) => setAvailability(prev => ({ ...prev, [ds]: avail })),
    });
  };

  const availWeekRows = [
    { label: "Monday",    ds: "2026-04-27" },
    { label: "Tuesday",   ds: "2026-04-28" },
    { label: "Wednesday", ds: "2026-04-29" },
    { label: "Thursday",  ds: "2026-04-30" },
    { label: "Friday",    ds: "2026-05-01" },
    { label: "Saturday",  ds: "2026-05-02" },
    { label: "Sunday",    ds: "2026-05-03" },
  ];

  const ShiftRow = ({ shift, isLast, isSelected, onTap }: {
    shift: ShiftEntry;
    isLast: boolean;
    isSelected: boolean;
    onTap: () => void;
  }) => {
    const sc = STATUS_CFG[shift.status];
    const parts = shift.date.split("-").map(Number);
    const d = parts[2];
    const dow = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
    const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const isToday = shift.date === TODAY_STR;

    return (
      <button
        onClick={onTap}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "12px",
          padding: "13px 16px",
          borderBottom: isLast ? "none" : `0.5px solid ${SEP}`,
          background: isSelected ? (theme === "dark" ? "rgba(10,132,255,0.1)" : "rgba(0,122,255,0.04)") : "none",
          textAlign: "left",
        }}
      >
        {/* Date column */}
        <div style={{ width: "38px", flexShrink: 0, textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: isToday ? ACCENT : TEXT3, fontWeight: isToday ? 600 : 400, marginBottom: "1px" }}>
            {isToday ? "Today" : DOW[dow]}
          </div>
          <div style={{ fontSize: "18px", fontWeight: 600, color: isSelected ? ACCENT : TEXT1, lineHeight: 1.1 }}>{d}</div>
        </div>

        {/* Divider */}
        <div style={{ width: "0.5px", height: "34px", background: SEP, flexShrink: 0 }} />

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: TEXT1, letterSpacing: "-0.2px" }}>{shift.time}</div>
          <div style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>{shift.role} · {shift.location}</div>
        </div>

        {/* Status dot + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.color }} />
          <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
            <path d="M1 1l4 4-4 4" stroke={TEXT3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>
    );
  };

  return (
    <div style={{ background: BG, minHeight: "100%", display: "flex", flexDirection: "column" }}>

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <div style={{ background: BG, padding: "22px 20px 0" }}>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ fontSize: "28px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.6px" }}>Schedule</div>
          <button style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: CARD, boxShadow: SHADOW, borderRadius: "20px" }}>
            <span style={{ fontSize: "13px", color: TEXT1, fontWeight: 500 }}>Bistro Noir</span>
            <ChevronDown size={12} style={{ color: TEXT3 }} />
          </button>
        </div>

        {/* Month calendar — always visible for Shifts & Availability */}
        {segment !== "requests" && (
          <div style={{ marginBottom: "14px" }}>
            <MonthCalendar
              year={calYear} month={calMonth}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onPrevMonth={prevMonth} onNextMonth={nextMonth}
              shiftsSet={SHIFTS_SET} availability={availability} mode={segment}
            />
          </div>
        )}

        {/* Segment tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "rgba(116,116,128,0.1)", borderRadius: "10px", padding: "2px", marginBottom: "14px" }}>
          {(["shifts", "availability", "requests"] as Segment[]).map((seg) => {
            const labels: Record<Segment, string> = { shifts: "Shifts", availability: "Availability", requests: "Requests" };
            const isActive = segment === seg;
            return (
              <button
                key={seg}
                onClick={() => setSegment(seg)}
                style={{
                  padding: "6px", borderRadius: "8px",
                  background: isActive ? CARD : "transparent",
                  boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  fontSize: "13px", fontWeight: isActive ? 600 : 400,
                  color: isActive ? TEXT1 : TEXT2, transition: "all 0.15s",
                }}
              >
                {labels[seg]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable content ────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 28px" }}>

        {/* ── SHIFTS ── */}
        {segment === "shifts" && (
          <div style={{ animation: "fadeUp 0.18s ease" }}>

            {/* Selected day card */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 500, color: TEXT2, marginBottom: "8px", paddingLeft: "2px" }}>
                {getFullDateLabel(selectedDate)}
              </div>

              {dayShifts.length > 0 ? (
                dayShifts.map(shift => {
                  const sc = STATUS_CFG[shift.status];
                  return (
                    <button
                      key={shift.id}
                      onClick={() => openSheet({ kind: "shiftDetail", shift })}
                      style={{ width: "100%", background: CARD, borderRadius: "18px", padding: "18px", boxShadow: SHADOW, textAlign: "left", display: "block" }}
                    >
                      {/* Time + status */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <Clock size={15} style={{ color: TEXT3, flexShrink: 0 }} />
                          <span style={{ fontSize: "22px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.5px", lineHeight: 1 }}>
                            {shift.time}
                          </span>
                        </div>
                        <span style={{
                          fontSize: "12px", fontWeight: 600, color: sc.color,
                          background: sc.bg, padding: "4px 10px", borderRadius: "20px",
                        }}>
                          {sc.label}
                        </span>
                      </div>

                      {/* Role + location */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin size={13} style={{ color: TEXT3, flexShrink: 0 }} />
                        <span style={{ fontSize: "14px", color: TEXT2 }}>{shift.role} · {shift.location}</span>
                      </div>

                      {/* Tap hint */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: "14px", gap: "3px" }}>
                        <span style={{ fontSize: "12px", color: TEXT3 }}>View details</span>
                        <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                          <path d="M1 1l4 4-4 4" stroke={TEXT3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div style={{ background: CARD, borderRadius: "18px", padding: "20px 18px", boxShadow: SHADOW, display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "18px" }}>💤</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 500, color: TEXT1 }}>Day off</div>
                    <div style={{ fontSize: "13px", color: TEXT3, marginTop: "2px" }}>No shift scheduled</div>
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming shifts */}
            <div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: TEXT2, marginBottom: "8px", paddingLeft: "2px" }}>Upcoming</div>
              <div style={{ background: CARD, borderRadius: "16px", overflow: "hidden", boxShadow: SHADOW }}>
                {upcomingShifts.length > 0
                  ? upcomingShifts.map((shift, idx) => (
                    <ShiftRow
                      key={shift.id}
                      shift={shift}
                      isLast={idx === upcomingShifts.length - 1}
                      isSelected={shift.date === selectedDate}
                      onTap={() => { handleSelectDate(shift.date); openSheet({ kind: "shiftDetail", shift }); }}
                    />
                  ))
                  : <div style={{ padding: "24px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: "14px", color: TEXT2 }}>No upcoming shifts</div>
                    </div>
                }
              </div>
            </div>
          </div>
        )}

        {/* ── AVAILABILITY ── */}
        {segment === "availability" && (
          <div style={{ animation: "fadeUp 0.18s ease" }}>

            {/* Legend */}
            <div style={{ display: "flex", gap: "14px", paddingLeft: "2px", marginBottom: "12px" }}>
              {[{ key: "preferred", label: "Preferred" }, { key: "available", label: "Available" }, { key: "unavailable", label: "Unavailable" }].map(({ key, label }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: AVAIL_COLOR[key] }} />
                  <span style={{ fontSize: "11px", color: TEXT2 }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Selected day quick-set */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: TEXT1 }}>{getFullDateLabel(selectedDate)}</div>
                  <div style={{ fontSize: "12px", color: TEXT2, marginTop: "1px" }}>
                    {availability[selectedDate]
                      ? `${AVAIL_LABEL[availability[selectedDate].status]} · ${availability[selectedDate].startTime} – ${availability[selectedDate].endTime}`
                      : "No availability set"}
                  </div>
                </div>
                <button
                  onClick={() => openAvailSheet(selectedDate)}
                  style={{ padding: "7px 14px", background: ACCENT, borderRadius: "20px", color: "#fff", fontSize: "13px", fontWeight: 500 }}
                >
                  Edit
                </button>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {(["unavailable", "available", "preferred"] as const).map(s => {
                  const isActive = availability[selectedDate]?.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        const base = availability[selectedDate] ?? { startTime: "09:00", endTime: "17:00" };
                        setAvailability(prev => ({ ...prev, [selectedDate]: { ...base, status: s } }));
                      }}
                      style={{
                        flex: 1, padding: "9px 4px", borderRadius: "10px",
                        background: isActive ? AVAIL_COLOR[s] : CARD,
                        fontSize: "11px", fontWeight: 600,
                        color: isActive ? "#fff" : TEXT2, transition: "all 0.15s",
                      }}
                    >
                      {AVAIL_LABEL[s]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Week rows */}
            <div style={{ fontSize: "13px", fontWeight: 500, color: TEXT2, marginBottom: "8px", paddingLeft: "2px" }}>This week</div>
            <div>
              {availWeekRows.map(({ label, ds }, idx) => {
                const avail = availability[ds];
                const hasShift = SHIFTS_SET.has(ds);
                const isSelected = ds === selectedDate;
                return (
                  <button
                    key={ds}
                    onClick={() => { handleSelectDate(ds); openAvailSheet(ds); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "12px",
                      padding: "13px 0",
                      borderBottom: idx < availWeekRows.length - 1 ? `0.5px solid ${SEP}` : "none",
                      background: isSelected ? "rgba(0,122,255,0.04)" : "none",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ width: "4px", height: "38px", borderRadius: "99px", flexShrink: 0, background: avail ? AVAIL_COLOR[avail.status] : SEP }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "15px", fontWeight: isSelected ? 600 : 400, color: TEXT1 }}>{label}</span>
                        {hasShift && <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: ACCENT }} />}
                      </div>
                      <div style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>
                        {avail
                          ? avail.status === "unavailable" ? "Unavailable" : `${avail.startTime} – ${avail.endTime}`
                          : "Tap to set"}
                      </div>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 500, color: avail ? AVAIL_COLOR[avail.status] : TEXT3 }}>
                      {avail ? AVAIL_LABEL[avail.status] : "—"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bulk action */}
            <div style={{ marginTop: "16px" }}>
              <button
                onClick={() => {
                  const bulk: AvailabilityMap = {};
                  availWeekRows.forEach(({ ds }) => { bulk[ds] = { status: "preferred", startTime: "17:00", endTime: "23:00" }; });
                  setAvailability(prev => ({ ...prev, ...bulk }));
                }}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "14px 0", color: ACCENT, fontSize: "14px", fontWeight: 500, background: "none", borderTop: `0.5px solid ${SEP}` }}
              >
                Set all days as preferred
              </button>
            </div>
          </div>
        )}

        {/* ── REQUESTS ── */}
        {segment === "requests" && (
          <div style={{ animation: "fadeUp 0.18s ease" }}>
            <button
              onClick={() => openSheet({ kind: "request" })}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                gap: "6px", background: ACCENT, borderRadius: "14px", padding: "14px",
                color: "#fff", fontSize: "15px", fontWeight: 600, marginBottom: "16px",
              }}
            >
              <Plus size={17} strokeWidth={2.5} />
              New request
            </button>
            <div>
              {requests.map((req, idx) => {
                const sc = { pending: { color: TEXT3 }, approved: { color: GREEN }, denied: { color: "#FF3B30" } }[req.status];
                return (
                  <div key={req.id} style={{ padding: "14px 0", borderBottom: idx < requests.length - 1 ? `0.5px solid ${SEP}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 500, color: TEXT1 }}>{req.type}</span>
                      <span style={{ fontSize: "12px", color: sc.color, fontWeight: 600, textTransform: "capitalize" }}>{req.status}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: TEXT2 }}>{req.dateRange} · {req.reason}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shift row (compact list) ───────────────────────────────────────────────
