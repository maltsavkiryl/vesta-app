import { useState, useEffect } from "react";
import { MapPin, CheckCircle2, Coffee, ChevronDown, ChevronUp, Zap, X, ChevronRight } from "lucide-react";
import type { SheetConfig } from "./types";
import { useTheme } from "../theme";

type ClockState = "idle" | "working" | "on_break";

const SHIFT_DURATION_SECS = 6 * 3600; // 6-hour shift
const HOURLY_RATE = 12.02;

const WEEK_DATA = [
  { day: "M", hours: 6.0,  paid: true  },
  { day: "T", hours: 5.5,  paid: true  },
  { day: "W", hours: 6.2,  paid: true  },
  { day: "T", hours: 0,    paid: false },
  { day: "F", hours: 5.75, paid: true  },
  { day: "S", hours: 6.0,  paid: true  },
  { day: "S", hours: 0,    paid: false, today: true },
];
const WEEK_TOTAL_PAST = WEEK_DATA.filter((d) => !d.today).reduce((s, d) => s + d.hours, 0);

const TIME_ENTRIES = [
  { id: 1, date: "Apr 25", day: "Saturday",  shift: "Evening", clockIn: "17:03", clockOut: "23:04", breakTime: "30m", total: "5h 31m", earnings: "€66.24",  status: "approved" },
  { id: 2, date: "Apr 24", day: "Friday",    shift: "Evening", clockIn: "17:01", clockOut: "23:07", breakTime: "25m", total: "5h 41m", earnings: "€68.25",  status: "approved" },
  { id: 3, date: "Apr 22", day: "Wednesday", shift: "Lunch",   clockIn: "12:03", clockOut: "18:02", breakTime: "30m", total: "5h 29m", earnings: "€65.84",  status: "approved" },
  { id: 4, date: "Apr 21", day: "Tuesday",   shift: "Evening", clockIn: "17:05", clockOut: "23:15", breakTime: "30m", total: "5h 40m", earnings: "€68.00",  status: "approved" },
];

const ALL_TIME_ENTRIES = [
  // April 2026
  { id: 1,  month: "April 2026",    date: "Apr 25", day: "Saturday",  shift: "Evening", clockIn: "17:03", clockOut: "23:04", breakTime: "30m", total: "5h 31m", earnings: "€66.24",  status: "approved" },
  { id: 2,  month: "April 2026",    date: "Apr 24", day: "Friday",    shift: "Evening", clockIn: "17:01", clockOut: "23:07", breakTime: "25m", total: "5h 41m", earnings: "€68.25",  status: "approved" },
  { id: 3,  month: "April 2026",    date: "Apr 22", day: "Wednesday", shift: "Lunch",   clockIn: "12:03", clockOut: "18:02", breakTime: "30m", total: "5h 29m", earnings: "€65.84",  status: "approved" },
  { id: 4,  month: "April 2026",    date: "Apr 21", day: "Tuesday",   shift: "Evening", clockIn: "17:05", clockOut: "23:15", breakTime: "30m", total: "5h 40m", earnings: "€68.00",  status: "approved" },
  { id: 5,  month: "April 2026",    date: "Apr 18", day: "Saturday",  shift: "Evening", clockIn: "17:00", clockOut: "23:10", breakTime: "30m", total: "5h 40m", earnings: "€68.00",  status: "approved" },
  { id: 6,  month: "April 2026",    date: "Apr 16", day: "Thursday",  shift: "Evening", clockIn: "17:02", clockOut: "23:08", breakTime: "25m", total: "5h 41m", earnings: "€68.25",  status: "approved" },
  { id: 7,  month: "April 2026",    date: "Apr 14", day: "Tuesday",   shift: "Lunch",   clockIn: "12:00", clockOut: "18:05", breakTime: "30m", total: "5h 35m", earnings: "€67.05",  status: "approved" },
  { id: 8,  month: "April 2026",    date: "Apr 11", day: "Saturday",  shift: "Evening", clockIn: "17:04", clockOut: "23:02", breakTime: "30m", total: "5h 28m", earnings: "€65.72",  status: "approved" },
  // March 2026
  { id: 9,  month: "March 2026",    date: "Mar 31", day: "Tuesday",   shift: "Evening", clockIn: "17:00", clockOut: "23:00", breakTime: "30m", total: "5h 30m", earnings: "€66.11",  status: "approved" },
  { id: 10, month: "March 2026",    date: "Mar 28", day: "Saturday",  shift: "Evening", clockIn: "17:02", clockOut: "23:05", breakTime: "30m", total: "5h 33m", earnings: "€66.72",  status: "approved" },
  { id: 11, month: "March 2026",    date: "Mar 26", day: "Thursday",  shift: "Lunch",   clockIn: "12:05", clockOut: "18:00", breakTime: "30m", total: "5h 25m", earnings: "€65.11",  status: "approved" },
  { id: 12, month: "March 2026",    date: "Mar 24", day: "Tuesday",   shift: "Evening", clockIn: "17:00", clockOut: "23:12", breakTime: "25m", total: "5h 47m", earnings: "€69.44",  status: "approved" },
  { id: 13, month: "March 2026",    date: "Mar 21", day: "Saturday",  shift: "Evening", clockIn: "17:01", clockOut: "23:03", breakTime: "30m", total: "5h 32m", earnings: "€66.48",  status: "approved" },
  { id: 14, month: "March 2026",    date: "Mar 19", day: "Thursday",  shift: "Lunch",   clockIn: "12:00", clockOut: "18:07", breakTime: "30m", total: "5h 37m", earnings: "€67.45",  status: "approved" },
  { id: 15, month: "March 2026",    date: "Mar 17", day: "Tuesday",   shift: "Evening", clockIn: "17:03", clockOut: "23:00", breakTime: "30m", total: "5h 27m", earnings: "€65.28",  status: "approved" },
  { id: 16, month: "March 2026",    date: "Mar 14", day: "Saturday",  shift: "Evening", clockIn: "17:00", clockOut: "23:08", breakTime: "25m", total: "5h 43m", earnings: "€68.69",  status: "approved" },
  { id: 17, month: "March 2026",    date: "Mar 11", day: "Wednesday", shift: "Lunch",   clockIn: "12:02", clockOut: "18:01", breakTime: "30m", total: "5h 29m", earnings: "€65.84",  status: "approved" },
  // February 2026
  { id: 18, month: "February 2026", date: "Feb 28", day: "Saturday",  shift: "Evening", clockIn: "17:00", clockOut: "23:05", breakTime: "30m", total: "5h 35m", earnings: "€67.05",  status: "approved" },
  { id: 19, month: "February 2026", date: "Feb 25", day: "Wednesday", shift: "Lunch",   clockIn: "12:01", clockOut: "18:03", breakTime: "30m", total: "5h 32m", earnings: "€66.48",  status: "approved" },
  { id: 20, month: "February 2026", date: "Feb 21", day: "Saturday",  shift: "Evening", clockIn: "17:00", clockOut: "23:00", breakTime: "30m", total: "5h 30m", earnings: "€66.11",  status: "approved" },
  { id: 21, month: "February 2026", date: "Feb 17", day: "Tuesday",   shift: "Evening", clockIn: "17:02", clockOut: "23:10", breakTime: "25m", total: "5h 43m", earnings: "€68.69",  status: "approved" },
  { id: 22, month: "February 2026", date: "Feb 14", day: "Saturday",  shift: "Lunch",   clockIn: "12:00", clockOut: "18:05", breakTime: "30m", total: "5h 35m", earnings: "€67.05",  status: "approved" },
  { id: 23, month: "February 2026", date: "Feb 11", day: "Wednesday", shift: "Evening", clockIn: "17:03", clockOut: "23:07", breakTime: "30m", total: "5h 34m", earnings: "€66.96",  status: "approved" },
];

interface Props { openSheet: (cfg: SheetConfig) => void; }

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmtSecs(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}
function fmtHM(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function Time({ openSheet }: Props) {
  const { colors, theme } = useTheme();
  const ACCENT = colors.accent;
  const AMBER = colors.amber;
  const GREEN = colors.green;
  const RED = colors.red;
  const BG = colors.bg;
  const CARD = colors.card;
  const TEXT1 = colors.text1;
  const TEXT2 = colors.text2;
  const TEXT3 = colors.text3;
  const SEP = colors.sep;
  const SHADOW = colors.shadow;

  const Ring = ({ progress, color, size = 200, stroke = 10 }: { progress: number; color: string; size?: number; stroke?: number }) => {
    const r   = (size - stroke) / 2;
    const c   = 2 * Math.PI * r;
    const off = c - Math.min(progress / 100, 1) * c;
    return (
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={CARD} strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
        />
      </svg>
    );
  };

  const WeekChart = ({ todayHours }: { todayHours: number }) => {
    const MAX = 8;
    const data = WEEK_DATA.map((d) => d.today ? { ...d, hours: todayHours } : d);
    return (
      <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", height: "56px" }}>
        {data.map((d, i) => {
          const pct = Math.min(d.hours / MAX, 1);
          const h   = Math.max(pct * 48, d.hours > 0 ? 3 : 0);
          const isToday = d.today;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", justifyContent: "flex-end", height: "56px" }}>
              <div
                style={{
                  width: "100%",
                  height: `${h}px`,
                  background: isToday
                    ? d.hours > 0 ? ACCENT : (theme === "dark" ? "rgba(10,132,255,0.2)" : "rgba(0,122,255,0.15)")
                    : d.hours > 0 ? (theme === "dark" ? "#48484A" : "#C7C7CC") : (theme === "dark" ? "#2C2C2E" : "#EBEBF0"),
                  borderRadius: "3px 3px 0 0",
                  transition: "height 0.4s ease",
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const [clockState,  setClockState]  = useState<ClockState>("idle");
  const [elapsed,     setElapsed]     = useState(0);
  const [breakSecs,   setBreakSecs]   = useState(0);
  const [totalBreaks, setTotalBreaks] = useState(0);
  const [expanded,    setExpanded]    = useState<number | null>(null);
  const [clockingIn,  setClockingIn]  = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [entriesDrawerClose, setEntriesDrawerClose] = useState(false);

  // Work timer
  useEffect(() => {
    if (clockState !== "working") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [clockState]);

  // Break timer
  useEffect(() => {
    if (clockState !== "on_break") return;
    const id = setInterval(() => setBreakSecs((b) => b + 1), 1000);
    return () => clearInterval(id);
  }, [clockState]);

  const progress    = (elapsed / SHIFT_DURATION_SECS) * 100;
  const todayHours  = elapsed / 3600;
  const ringColor   = clockState === "on_break" ? AMBER : ACCENT;
  const totalEarn   = ((elapsed - totalBreaks) / 3600 * HOURLY_RATE).toFixed(2);
  const weekTotal   = WEEK_TOTAL_PAST + todayHours;

  const handleClockIn = () => {
    setClockingIn(true);
    setTimeout(() => {
      setClockingIn(false);
      setClockState("working");
      setElapsed(0);
      setTotalBreaks(0);
    }, 600);
  };

  const handleStartBreak = () => {
    setClockState("on_break");
    setBreakSecs(0);
  };

  const handleEndBreak = () => {
    setTotalBreaks((t) => t + breakSecs);
    setBreakSecs(0);
    setClockState("working");
  };

  const handleClockOut = () => {
    openSheet({
      kind: "clockout",
      summary: {
        clockInTime: "17:00",
        workedSecs: elapsed,
        breakSecs: totalBreaks + (clockState === "on_break" ? breakSecs : 0),
        role: "Waiter",
        location: "Bistro Noir",
      },
      onConfirm: () => {
        setClockState("idle");
        setElapsed(0);
        setBreakSecs(0);
        setTotalBreaks(0);
      },
    });
  };

  return (
    <div style={{ background: BG, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "28px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.6px" }}>Time</div>
        {clockState !== "idle" && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "5px 12px",
              background: clockState === "on_break" ? "rgba(255,159,10,0.1)" : "rgba(52,199,89,0.1)",
              borderRadius: "20px",
            }}
          >
            <div
              style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: clockState === "on_break" ? AMBER : GREEN,
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: 600, color: clockState === "on_break" ? AMBER : GREEN }}>
              {clockState === "on_break" ? "On break" : "Working"}
            </span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 28px", display: "flex", flexDirection: "column", gap: "12px" }}>

        {/* ── Idle: Pre-shift card ── */}
        {clockState === "idle" && (
          <div style={{ background: CARD, borderRadius: "20px", padding: "22px 20px", boxShadow: SHADOW, animation: "fadeUp 0.2s ease" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", color: TEXT3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "10px" }}>
                Today's shift
              </div>
              <div style={{ fontSize: "26px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.6px", lineHeight: 1.15 }}>
                17:00 – 23:00
              </div>
              <div style={{ fontSize: "14px", color: TEXT2, marginTop: "4px" }}>Waiter · 6h Evening shift</div>
            </div>

            {/* Location */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: BG, borderRadius: "12px", padding: "12px 14px", marginBottom: "10px" }}>
              <MapPin size={14} style={{ color: TEXT3, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>Bistro Noir</div>
                <div style={{ fontSize: "12px", color: TEXT2 }}>Rue de la Loi 123, Brussels</div>
              </div>
              <CheckCircle2 size={14} style={{ color: GREEN }} />
            </div>

            {/* Early note */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px", padding: "8px 12px", background: "rgba(255,159,10,0.06)", borderRadius: "10px", border: "1px solid rgba(255,159,10,0.12)" }}>
              <Zap size={12} style={{ color: AMBER }} />
              <span style={{ fontSize: "12px", color: AMBER, fontWeight: 500 }}>
                Clock-in opens at 16:45 · Opens in 2h 21m
              </span>
            </div>

            {/* Clock in button */}
            <button
              onClick={handleClockIn}
              style={{
                width: "100%", background: clockingIn ? "#005EC7" : ACCENT,
                borderRadius: "16px", padding: "16px",
                color: "#fff", fontSize: "17px", fontWeight: 600,
                transform: clockingIn ? "scale(0.97)" : "scale(1)",
                transition: "all 0.15s ease",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {clockingIn ? (
                <span style={{ opacity: 0.8 }}>Clocking in…</span>
              ) : (
                <>Clock in</>
              )}
            </button>
          </div>
        )}

        {/* ── Working / On break: Ring card ── */}
        {clockState !== "idle" && (
          <div style={{ background: CARD, borderRadius: "20px", padding: "24px 20px 20px", boxShadow: SHADOW, animation: "fadeUp 0.2s ease" }}>
            {/* Ring */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ position: "relative", width: "200px", height: "200px" }}>
                <Ring progress={progress} color={ringColor} />
                <div
                  style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: "2px",
                  }}
                >
                  {clockState === "on_break" ? (
                    <>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: AMBER, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                        On break
                      </span>
                      <span style={{ fontSize: "26px", fontWeight: 700, color: AMBER, letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums" }}>
                        {fmtSecs(breakSecs)}
                      </span>
                      <div
                        style={{
                          marginTop: "6px", padding: "3px 10px",
                          background: "rgba(0,122,255,0.08)", borderRadius: "20px",
                          fontSize: "12px", color: ACCENT, fontWeight: 600,
                        }}
                      >
                        {fmtSecs(elapsed)} worked
                      </div>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                        Working
                      </span>
                      <span style={{ fontSize: "32px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums" }}>
                        {fmtSecs(elapsed)}
                      </span>
                      <span style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>
                        since 17:00
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Progress label */}
              <div style={{ fontSize: "13px", color: TEXT3, marginTop: "6px" }}>
                {Math.round(progress)}% of 6h shift
                {totalBreaks > 0 && ` · ${fmtHM(totalBreaks)} break`}
              </div>
            </div>

            {/* Stats chips */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
              {[
                { label: "Role",      val: "Waiter"          },
                { label: "Earning",   val: `€${totalEarn}`   },
                { label: "Rate",      val: "€12.02/h"        },
              ].map((item) => (
                <div key={item.label} style={{ background: BG, borderRadius: "12px", padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: TEXT3, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{item.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: TEXT1, fontVariantNumeric: "tabular-nums" }}>{item.val}</div>
                </div>
              ))}
            </div>

            {/* Location verified */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", background: "rgba(52,199,89,0.06)", borderRadius: "10px", marginBottom: "16px", border: "1px solid rgba(52,199,89,0.12)" }}>
              <CheckCircle2 size={13} style={{ color: GREEN }} />
              <span style={{ fontSize: "13px", color: GREEN, fontWeight: 500 }}>Location verified · Bistro Noir</span>
            </div>

            {/* Action buttons */}
            {clockState === "working" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  onClick={handleStartBreak}
                  style={{
                    background: BG, border: `1px solid ${SEP}`,
                    borderRadius: "14px", padding: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    fontSize: "14px", fontWeight: 500, color: TEXT1,
                  }}
                >
                  <Coffee size={15} style={{ color: TEXT2 }} />
                  Start break
                </button>
                <button
                  onClick={handleClockOut}
                  style={{
                    background: "rgba(255,59,48,0.06)",
                    border: "1px solid rgba(255,59,48,0.14)",
                    borderRadius: "14px", padding: "14px",
                    fontSize: "14px", fontWeight: 600, color: RED,
                  }}
                >
                  Clock out
                </button>
              </div>
            ) : (
              <button
                onClick={handleEndBreak}
                style={{
                  width: "100%", background: "rgba(255,159,10,0.06)",
                  border: "1px solid rgba(255,159,10,0.15)",
                  borderRadius: "14px", padding: "14px",
                  fontSize: "15px", fontWeight: 600, color: AMBER,
                }}
              >
                End break
              </button>
            )}
          </div>
        )}

        {/* ── Weekly summary ── */}
        <div style={{ background: CARD, borderRadius: "16px", padding: "16px", boxShadow: SHADOW }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: TEXT1 }}>This week</div>
              <div style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>
                {weekTotal.toFixed(1)}h · €{(weekTotal * HOURLY_RATE).toFixed(2)} est.
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.4px" }}>{weekTotal.toFixed(1)}h</div>
              <div style={{ fontSize: "11px", color: TEXT3 }}>of 30h target</div>
            </div>
          </div>

          <WeekChart todayHours={todayHours} />

          {/* Day labels */}
          <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
            {WEEK_DATA.map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "10px", color: d.today ? ACCENT : TEXT3, fontWeight: d.today ? 600 : 400 }}>
                {d.day}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: "12px", height: "3px", background: BG, borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min((weekTotal / 30) * 100, 100)}%`, background: ACCENT, borderRadius: "99px", transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* ── Recent entries ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 4px 10px" }}>
            <span style={{ fontSize: "17px", fontWeight: 600, color: TEXT1, letterSpacing: "-0.3px" }}>Recent entries</span>
            <button
              onClick={() => { setEntriesDrawerClose(false); setShowAllEntries(true); }}
              style={{ display: "flex", alignItems: "center", gap: "3px", color: ACCENT, fontSize: "14px", fontWeight: 500, background: "none" }}
            >
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div style={{ background: CARD, borderRadius: "16px", overflow: "hidden", boxShadow: SHADOW }}>
            {TIME_ENTRIES.map((entry, idx) => {
              const isExp = expanded === entry.id;
              return (
                <div key={entry.id} style={{ borderBottom: idx < TIME_ENTRIES.length - 1 ? `0.5px solid ${SEP}` : "none" }}>
                  <button
                    onClick={() => setExpanded(isExp ? null : entry.id)}
                    style={{ width: "100%", padding: "14px 16px", background: "none", textAlign: "left" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", flexShrink: 0, textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: TEXT3 }}>{entry.day.slice(0, 3)}</div>
                        <div style={{ fontSize: "18px", fontWeight: 600, color: TEXT1, lineHeight: 1.1 }}>
                          {entry.date.split(" ")[1]}
                        </div>
                      </div>
                      <div style={{ width: "0.5px", height: "32px", background: SEP, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>
                          {entry.clockIn} – {entry.clockOut}
                        </div>
                        <div style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>
                          {entry.shift} · {entry.total}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px", color: GREEN, fontWeight: 500 }}>Approved</span>
                        {isExp
                          ? <ChevronUp size={14} style={{ color: TEXT3 }} />
                          : <ChevronDown size={14} style={{ color: TEXT3 }} />
                        }
                      </div>
                    </div>
                  </button>

                  {isExp && (
                    <div style={{ padding: "0 16px 14px", animation: "fadeUp 0.15s ease" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px" }}>
                        {[
                          { label: "In",       val: entry.clockIn   },
                          { label: "Out",      val: entry.clockOut  },
                          { label: "Break",    val: entry.breakTime },
                          { label: "Total",    val: entry.total     },
                        ].map((item) => (
                          <div key={item.label} style={{ background: BG, borderRadius: "10px", padding: "8px 4px", textAlign: "center" }}>
                            <div style={{ fontSize: "10px", color: TEXT3, marginBottom: "2px" }}>{item.label}</div>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: TEXT1, fontVariantNumeric: "tabular-nums" }}>{item.val}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", padding: "8px 12px", background: "rgba(52,199,89,0.06)", borderRadius: "10px" }}>
                        <span style={{ fontSize: "13px", color: TEXT2 }}>Estimated earnings</span>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: GREEN }}>{entry.earnings}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── All Entries Bottom Drawer ─────────────────────────────── */}
      {showAllEntries && (
        <>
          <div
            onClick={() => { setEntriesDrawerClose(true); setTimeout(() => setShowAllEntries(false), 300); }}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, animation: entriesDrawerClose ? "bdOut 0.3s ease forwards" : "bdIn 0.22s ease" }}
          />
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 301,
              background: BG, borderRadius: "24px 24px 0 0",
              maxHeight: "92%", overflowY: "auto",
              paddingBottom: "48px",
              animation: entriesDrawerClose ? "sheetDown 0.3s cubic-bezier(0.32,0.72,0,1) forwards" : "sheetUp 0.36s cubic-bezier(0.32,0.72,0,1)",
            }}
          >
            <div style={{ width: "36px", height: "4px", background: "#D1D1D6", borderRadius: "99px", margin: "12px auto 0" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", background: BG, position: "sticky", top: 0, zIndex: 1 }}>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.4px" }}>Time entries</div>
                <div style={{ fontSize: "13px", color: TEXT2, marginTop: "2px" }}>{ALL_TIME_ENTRIES.length} entries total</div>
              </div>
              <button
                onClick={() => { setEntriesDrawerClose(true); setTimeout(() => setShowAllEntries(false), 300); }}
                style={{ width: "30px", height: "30px", borderRadius: "50%", background: CARD, boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={15} style={{ color: TEXT2 }} />
              </button>
            </div>

            {/* Grouped by month */}
            {(["April 2026", "March 2026", "February 2026"] as const).map((month) => {
              const entries = ALL_TIME_ENTRIES.filter((e) => e.month === month);
              const totalEarn = entries.reduce((sum, e) => sum + parseFloat(e.earnings.replace("€", "")), 0);
              return (
                <div key={month} style={{ padding: "0 16px 0", marginBottom: "16px" }}>
                  {/* Month header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", paddingLeft: "2px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: TEXT2 }}>{month}</div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span style={{ fontSize: "12px", color: TEXT3 }}>{entries.length} shifts</span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: GREEN }}>€{totalEarn.toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={{ background: CARD, borderRadius: "16px", overflow: "hidden", boxShadow: SHADOW }}>
                    {entries.map((entry, idx) => {
                      const isExp = expanded === entry.id;
                      return (
                        <div key={entry.id} style={{ borderBottom: idx < entries.length - 1 ? `0.5px solid ${SEP}` : "none" }}>
                          <button
                            onClick={() => setExpanded(isExp ? null : entry.id)}
                            style={{ width: "100%", padding: "13px 16px", background: "none", textAlign: "left" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ width: "36px", flexShrink: 0, textAlign: "center" }}>
                                <div style={{ fontSize: "10px", color: TEXT3 }}>{entry.day.slice(0, 3)}</div>
                                <div style={{ fontSize: "17px", fontWeight: 600, color: TEXT1, lineHeight: 1.1 }}>
                                  {entry.date.split(" ")[1]}
                                </div>
                              </div>
                              <div style={{ width: "0.5px", height: "30px", background: SEP, flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>
                                  {entry.clockIn} – {entry.clockOut}
                                </div>
                                <div style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>
                                  {entry.shift} · {entry.total}
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: TEXT1 }}>{entry.earnings}</span>
                                {isExp ? <ChevronUp size={13} style={{ color: TEXT3 }} /> : <ChevronDown size={13} style={{ color: TEXT3 }} />}
                              </div>
                            </div>
                          </button>

                          {isExp && (
                            <div style={{ padding: "0 16px 13px", animation: "fadeUp 0.15s ease" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px" }}>
                                {[
                                  { label: "In",    val: entry.clockIn   },
                                  { label: "Out",   val: entry.clockOut  },
                                  { label: "Break", val: entry.breakTime },
                                  { label: "Total", val: entry.total     },
                                ].map((item) => (
                                  <div key={item.label} style={{ background: BG, borderRadius: "10px", padding: "8px 4px", textAlign: "center" }}>
                                    <div style={{ fontSize: "10px", color: TEXT3, marginBottom: "2px" }}>{item.label}</div>
                                    <div style={{ fontSize: "12px", fontWeight: 600, color: TEXT1, fontVariantNumeric: "tabular-nums" }}>{item.val}</div>
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", padding: "8px 12px", background: "rgba(52,199,89,0.06)", borderRadius: "10px" }}>
                                <span style={{ fontSize: "13px", color: TEXT2 }}>Estimated earnings</span>
                                <span style={{ fontSize: "14px", fontWeight: 700, color: GREEN }}>{entry.earnings}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}