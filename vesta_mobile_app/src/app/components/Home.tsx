import { useState, useEffect, useCallback } from "react";
import {
  Bell, ChevronDown, MapPin, Clock, Calendar,
  Upload, FileText, CreditCard, ChevronRight,
  AlertCircle, ArrowRight, Check, TrendingUp,
  Zap, Navigation2, X, CheckCircle2
} from "lucide-react";
import type { TabId, SheetConfig } from "./types";
import { ALL_SHIFTS } from "./types";
import { useTheme } from "../theme";

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/* ─── constants ─────────────────────────────────────────────────────────────── */
const MONTHLY_TARGET  = 2_400;
const EARNED_SO_FAR   = 847.20;
const SHIFTS_DONE     = 7;
const HOURS_DONE      = 41.5;
const HOURLY_RATE     = 12.02;
const EARN_PCT        = Math.round((EARNED_SO_FAR / MONTHLY_TARGET) * 100);

interface Task {
  id:          number;
  title:       string;
  sub:         string;
  urgency:     "high" | "medium" | "low";
  actionLabel: string;
  tab:         TabId;
}

const INIT_TASKS: Task[] = [
  { id: 1, title: "Upload your ID card",       sub: "Required · Due May 5",          urgency: "high",   actionLabel: "Upload",  tab: "documents" },
  { id: 2, title: "Confirm schedule change",   sub: "Friday May 2 shift was updated", urgency: "medium", actionLabel: "Review",  tab: "schedule"  },
  { id: 3, title: "Set May availability",      sub: "Help your team plan ahead",      urgency: "low",    actionLabel: "Set",     tab: "schedule"  },
];

const ALL_TASKS_EXTENDED: (Task & { completed?: boolean; completedDate?: string })[] = [
  { id: 1,  title: "Upload your ID card",          sub: "Required · Due May 5",            urgency: "high",   actionLabel: "Upload", tab: "documents" },
  { id: 2,  title: "Confirm schedule change",      sub: "Friday May 2 shift was updated",  urgency: "medium", actionLabel: "Review", tab: "schedule"  },
  { id: 3,  title: "Set May availability",         sub: "Help your team plan ahead",        urgency: "low",    actionLabel: "Set",    tab: "schedule"  },
  { id: 4,  title: "Sign schedule amendment",      sub: "Addendum requires your signature", urgency: "medium", actionLabel: "Sign",   tab: "documents", completed: true, completedDate: "Apr 20" },
  { id: 5,  title: "Update bank details",          sub: "Required for payroll",             urgency: "high",   actionLabel: "Update", tab: "profile",   completed: true, completedDate: "Apr 15" },
  { id: 6,  title: "Set April availability",       sub: "Completed on time",                urgency: "low",    actionLabel: "Done",   tab: "schedule",  completed: true, completedDate: "Apr 1"  },
  { id: 7,  title: "Submit tax form W-4",          sub: "Submitted for processing",         urgency: "high",   actionLabel: "Done",   tab: "documents", completed: true, completedDate: "Mar 28" },
];

/* ─── component ───────────────────────────────────────────────────────────── */
interface Props {
  onNavigate: (tab: TabId) => void;
  openSheet:  (cfg: SheetConfig) => void;
  user?:      { firstName: string; lastName: string; email: string; role?: string; employer?: string };
}

export function Home({ onNavigate, openSheet, user }: Props) {
  const { colors, theme } = useTheme();
  const ACCENT = colors.accent;
  const BG = colors.bg;
  const CARD = colors.card;
  const TEXT1 = colors.text1;
  const TEXT2 = colors.text2;
  const TEXT3 = colors.text3;
  const SEP = colors.sep;
  const GREEN = colors.green;
  const RED = colors.red;
  const AMBER = colors.amber;
  const SHADOW = colors.shadow;

  const [greeting,       setGreeting]       = useState(getGreeting());
  const [tasks,          setTasks]          = useState<Task[]>(INIT_TASKS);
  const [dismissing,     setDismissing]     = useState<number[]>([]);
  const [showBadge,      setShowBadge]      = useState(true);
  const [showAllTasks,   setShowAllTasks]   = useState(false);
  const [taskDrawerClose, setTaskDrawerClose] = useState(false);

  /* update greeting every minute */
  useEffect(() => {
    const id = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(id);
  }, []);

  const completeTask = useCallback((id: number, tab?: TabId) => {
    if (tab) onNavigate(tab);
    setDismissing((p) => [...p, id]);
    setTimeout(() => setTasks((p) => p.filter((t) => t.id !== id)), 550);
  }, [onNavigate]);

  const STATUS_COLOR: Record<string, string> = {
    confirmed: GREEN, changed: AMBER, pending: TEXT3,
  };

  const QUICK: { icon: React.ElementType; label: string; tab: TabId; bg: string; col: string }[] = [
    { icon: Calendar, label: "Schedule", tab: "schedule",  bg: theme === "dark" ? "rgba(10,132,255,0.15)" : "rgba(0,122,255,0.08)",  col: ACCENT        },
    { icon: Clock,    label: "Clock in", tab: "time",       bg: theme === "dark" ? "rgba(48,209,88,0.15)" : "rgba(52,199,89,0.08)",  col: GREEN         },
    { icon: Upload,   label: "Upload",   tab: "documents",  bg: theme === "dark" ? "rgba(255,214,10,0.15)" : "rgba(255,159,10,0.08)", col: AMBER         },
    { icon: FileText, label: "Payslips", tab: "documents",  bg: theme === "dark" ? "rgba(191,90,242,0.15)" : "rgba(175,82,222,0.08)", col: "#AF52DE"     },
  ];

  const nextShift     = ALL_SHIFTS[0];
  const carousel      = ALL_SHIFTS.slice(1, 7);
  const firstName     = user?.firstName || "Sofia";
  const employer      = user?.employer  || "Bistro Noir";

  return (
    <div style={{ background: BG, minHeight: "100%", paddingBottom: "32px" }}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "13px", color: TEXT2, marginBottom: "2px" }}>{greeting}</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.6px", lineHeight: 1.15 }}>{firstName}</div>
          <button
            onClick={() => onNavigate("profile")}
            style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "5px", background: "none" }}
          >
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: GREEN }} />
            <span style={{ fontSize: "13px", color: ACCENT, fontWeight: 500 }}>{employer}</span>
            <ChevronDown size={12} style={{ color: ACCENT }} />
          </button>
        </div>

        <button
          onClick={() => { setShowBadge(false); openSheet({ kind: "notifications" }); }}
          style={{ width: "38px", height: "38px", borderRadius: "50%", background: CARD, boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}
        >
          <Bell size={18} style={{ color: TEXT1 }} />
          {showBadge && (
            <div style={{ position: "absolute", top: "7px", right: "7px", width: "9px", height: "9px", background: RED, borderRadius: "50%", border: `2px solid ${BG}`, animation: "pulse 2s ease infinite" }} />
          )}
        </button>
      </div>

      {/* ── Content stack ────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "0 16px" }}>

        {/* ── Next Shift Hero Card ──────────────────────────────────── */}
        <div style={{ background: theme === "dark" ? "#1C1C1E" : TEXT1, borderRadius: "22px", padding: "20px", position: "relative", overflow: "hidden" }}>
          {/* decorative rings */}
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", borderRadius: "50%", border: theme === "dark" ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "130px", height: "130px", borderRadius: "50%", border: theme === "dark" ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(255,255,255,0.07)", pointerEvents: "none" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: theme === "dark" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.3)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px" }}>Today's shift</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.15 }}>{nextShift.time}</div>
              <div style={{ fontSize: "13px", color: theme === "dark" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.45)", marginTop: "3px" }}>{nextShift.role} · Evening shift</div>
            </div>
            <span style={{ padding: "4px 10px", background: theme === "dark" ? "rgba(48,209,88,0.25)" : "rgba(52,199,89,0.18)", borderRadius: "20px", fontSize: "12px", fontWeight: 600, color: theme === "dark" ? "#30D158" : "#4CD964", flexShrink: 0 }}>Confirmed</span>
          </div>

          {/* location row */}
          <button
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.06)", borderRadius: "12px", padding: "9px 12px", marginBottom: "5px", border: "none", textAlign: "left" }}
          >
            <MapPin size={13} style={{ color: theme === "dark" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", color: theme === "dark" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.5)", flex: 1 }}>{nextShift.location} · {nextShift.address}</span>
            <Navigation2 size={12} style={{ color: theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)", flexShrink: 0 }} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "5px", paddingLeft: "2px", marginBottom: "18px" }}>
            <Zap size={11} style={{ color: AMBER }} />
            <span style={{ fontSize: "12px", color: AMBER, fontWeight: 500 }}>Clock-in opens at 16:45 · 3h away</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button
              onClick={() => onNavigate("time")}
              style={{ background: ACCENT, borderRadius: "13px", padding: "13px", color: "#fff", fontSize: "14px", fontWeight: 600 }}
            >
              Clock in
            </button>
            <button
              onClick={() => openSheet({ kind: "shiftDetail", shift: nextShift })}
              style={{ background: theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)", borderRadius: "13px", padding: "13px", color: theme === "dark" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.75)", fontSize: "14px", fontWeight: 500 }}
            >
              View details
            </button>
          </div>
        </div>

        {/* ── Upcoming Shifts Carousel ──────────────────────────────── */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "17px", fontWeight: 600, color: TEXT1, letterSpacing: "-0.3px" }}>Upcoming</span>
            <button onClick={() => onNavigate("schedule")} style={{ display: "flex", alignItems: "center", gap: "3px", color: ACCENT, fontSize: "14px", fontWeight: 500, background: "none" }}>
              See all <ArrowRight size={13} />
            </button>
          </div>
          <div style={{ display: "flex", gap: "9px", overflowX: "auto", paddingBottom: "4px", marginLeft: "-1px", paddingLeft: "1px" }}>
            {carousel.map((shift) => {
              const dayNum = shift.date.split("-")[2];
              const [startT] = shift.time.split(" – ");
              return (
                <button
                  key={shift.id}
                  onClick={() => openSheet({ kind: "shiftDetail", shift })}
                  style={{ flexShrink: 0, width: "112px", background: CARD, borderRadius: "18px", padding: "14px 12px", boxShadow: SHADOW, display: "flex", flexDirection: "column", gap: "3px", textAlign: "left" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", color: TEXT3, fontWeight: 500 }}>{shift.dayLabel}</span>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: STATUS_COLOR[shift.status] }} />
                  </div>
                  <div style={{ fontSize: "26px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.6px", lineHeight: 1 }}>{dayNum}</div>
                  <div style={{ fontSize: "11px", color: TEXT2, marginTop: "2px" }}>{startT}</div>
                  <div style={{ marginTop: "6px", padding: "2px 8px", background: BG, borderRadius: "20px", fontSize: "10px", fontWeight: 500, color: TEXT2, display: "inline-block" }}>
                    {shift.role}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Monthly Earnings ──────────────────────────────────────── */}
        <div style={{ background: CARD, borderRadius: "20px", padding: "18px", boxShadow: SHADOW }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "12px", color: TEXT2, marginBottom: "4px" }}>April 2026 earnings</div>
              <div style={{ fontSize: "30px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.8px", lineHeight: 1 }}>€{EARNED_SO_FAR.toLocaleString("en", { minimumFractionDigits: 2 })}</div>
              <div style={{ fontSize: "12px", color: TEXT3, marginTop: "4px" }}>of €{MONTHLY_TARGET.toLocaleString()} target · {EARN_PCT}%</div>
            </div>
            <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "rgba(0,122,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <TrendingUp size={18} style={{ color: ACCENT }} />
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: "5px", background: BG, borderRadius: "99px", overflow: "hidden", marginBottom: "14px" }}>
            <div style={{ height: "100%", width: `${EARN_PCT}%`, background: ACCENT, borderRadius: "99px" }} />
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
            {[
              { val: String(SHIFTS_DONE),                              label: "Shifts"  },
              { val: `${HOURS_DONE}h`,                                 label: "Hours"   },
              { val: `€${(EARNED_SO_FAR / HOURS_DONE).toFixed(2)}`,   label: "Avg/hr"  },
            ].map(({ val, label }) => (
              <div key={label} style={{ background: BG, borderRadius: "11px", padding: "9px 6px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: TEXT1 }}>{val}</div>
                <div style={{ fontSize: "11px", color: TEXT3, marginTop: "1px" }}>{label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate("documents")}
            style={{ display: "flex", alignItems: "center", gap: "4px", color: ACCENT, fontSize: "13px", fontWeight: 500, background: "none" }}
          >
            <CreditCard size={13} /> View latest payslip <ChevronRight size={13} />
          </button>
        </div>

        {/* ── Tasks ─────────────────────────────────────────────────── */}
        {tasks.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "17px", fontWeight: 600, color: TEXT1, letterSpacing: "-0.3px" }}>Tasks</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: RED, background: "rgba(255,59,48,0.08)", padding: "2px 9px", borderRadius: "20px" }}>
                  {tasks.length} pending
                </span>
                <button onClick={() => { setTaskDrawerClose(false); setShowAllTasks(true); }} style={{ fontSize: "14px", color: ACCENT, fontWeight: 500, background: "none" }}>
                  View all
                </button>
              </div>
            </div>
            <div style={{ background: CARD, borderRadius: "18px", overflow: "hidden", boxShadow: SHADOW }}>
              {tasks.map((task, idx) => {
                const isDismissing  = dismissing.includes(task.id);
                const urgColor      = task.urgency === "high" ? RED : task.urgency === "medium" ? AMBER : ACCENT;
                const urgBg         = task.urgency === "high" ? "rgba(255,59,48,0.08)" : task.urgency === "medium" ? "rgba(255,159,10,0.08)" : "rgba(0,122,255,0.08)";
                return (
                  <div
                    key={task.id}
                    style={{
                      borderBottom: idx < tasks.length - 1 ? `0.5px solid ${SEP}` : "none",
                      animation: isDismissing ? "slideOutLeft 0.5s ease forwards" : undefined,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: isDismissing ? "rgba(52,199,89,0.08)" : urgBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
                        {isDismissing
                          ? <Check size={16} style={{ color: GREEN }} />
                          : <AlertCircle size={16} style={{ color: urgColor }} />
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                        <div style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>{task.sub}</div>
                      </div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                        <button
                          onClick={() => completeTask(task.id, task.tab)}
                          style={{ fontSize: "12px", color: ACCENT, fontWeight: 600, background: "rgba(0,122,255,0.08)", padding: "5px 10px", borderRadius: "8px" }}
                        >
                          {task.actionLabel}
                        </button>
                        <button
                          onClick={() => completeTask(task.id)}
                          style={{ width: "28px", height: "28px", borderRadius: "8px", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}
                          title="Dismiss"
                        >
                          <Check size={13} style={{ color: TEXT3 }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All done state */}
        {tasks.length === 0 && (
          <div style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.12)", borderRadius: "17px", padding: "16px", display: "flex", alignItems: "center", gap: "12px", animation: "pop 0.35s ease" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "rgba(52,199,89,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Check size={20} style={{ color: GREEN }} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: TEXT1 }}>All tasks done!</div>
              <div style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>Nothing pending right now.</div>
            </div>
            <button onClick={() => { setTaskDrawerClose(false); setShowAllTasks(true); }} style={{ marginLeft: "auto", fontSize: "12px", color: ACCENT, fontWeight: 500, background: "none", flexShrink: 0 }}>History</button>
          </div>
        )}

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <div>
          <div style={{ marginBottom: "10px" }}>
            <span style={{ fontSize: "17px", fontWeight: 600, color: TEXT1, letterSpacing: "-0.3px" }}>Quick actions</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "9px" }}>
            {QUICK.map(({ icon: Icon, label, tab, bg, col }) => (
              <button
                key={label}
                onClick={() => onNavigate(tab)}
                style={{ background: "transparent", borderRadius: "18px", padding: "14px 8px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "9px" }}
              >
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} style={{ color: col }} strokeWidth={1.8} />
                </div>
                <span style={{ fontSize: "11px", color: TEXT1, fontWeight: 500 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Updates feed ─────────────────────────────────────────── */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "17px", fontWeight: 600, color: TEXT1, letterSpacing: "-0.3px" }}>Updates</span>
            <button onClick={() => openSheet({ kind: "notifications" })} style={{ display: "flex", alignItems: "center", gap: "3px", color: ACCENT, fontSize: "14px", fontWeight: 500, background: "none" }}>
              All <ArrowRight size={13} />
            </button>
          </div>
          <div>
            {[
              { Icon: Calendar,     col: ACCENT, bg: "rgba(0,122,255,0.08)",  title: "Schedule published",  body: "Week of Apr 27 is now available.",   ago: "2h ago",  tap: () => onNavigate("schedule")  },
              { Icon: AlertCircle,  col: RED,    bg: "rgba(255,59,48,0.08)",  title: "Action required",     body: "Upload your ID card before May 5.",  ago: "5h ago",  tap: () => onNavigate("documents") },
              { Icon: FileText,     col: GREEN,  bg: "rgba(52,199,89,0.08)",  title: "Payslip ready",       body: "March payslip is available.",        ago: "1d ago",  tap: () => onNavigate("documents") },
            ].map((n, idx) => (
              <button
                key={n.title}
                onClick={n.tap}
                style={{ width: "100%", padding: "13px 0", borderBottom: idx < 2 ? `0.5px solid ${SEP}` : "none", background: "none", textAlign: "left", display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: n.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <n.Icon size={15} style={{ color: n.col }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "2px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: TEXT1 }}>{n.title}</span>
                    <span style={{ fontSize: "11px", color: TEXT3, flexShrink: 0 }}>{n.ago}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: TEXT2 }}>{n.body}</div>
                </div>
                <ChevronRight size={13} style={{ color: TEXT3, flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tasks Bottom Drawer ───────────────────────────────────── */}
      {showAllTasks && (
        <>
          <div
            onClick={() => { setTaskDrawerClose(true); setTimeout(() => setShowAllTasks(false), 300); }}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, animation: taskDrawerClose ? "bdOut 0.3s ease forwards" : "bdIn 0.22s ease" }}
          />
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 301,
              background: CARD, borderRadius: "24px 24px 0 0",
              maxHeight: "88%", overflowY: "auto",
              paddingBottom: "48px",
              animation: taskDrawerClose ? "sheetDown 0.3s cubic-bezier(0.32,0.72,0,1) forwards" : "sheetUp 0.36s cubic-bezier(0.32,0.72,0,1)",
            }}
          >
            <div style={{ width: "36px", height: "4px", background: "#D1D1D6", borderRadius: "99px", margin: "12px auto 0" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 0" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.4px" }}>All Tasks</div>
              <button
                onClick={() => { setTaskDrawerClose(true); setTimeout(() => setShowAllTasks(false), 300); }}
                style={{ width: "30px", height: "30px", borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={15} style={{ color: TEXT2 }} />
              </button>
            </div>

            {/* Pending tasks */}
            {ALL_TASKS_EXTENDED.filter((t) => !t.completed).length > 0 && (
              <div style={{ padding: "16px 16px 0" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" }}>Pending</div>
                <div style={{ background: BG, borderRadius: "16px", overflow: "hidden" }}>
                  {ALL_TASKS_EXTENDED.filter((t) => !t.completed).map((task, idx, arr) => {
                    const urgColor = task.urgency === "high" ? RED : task.urgency === "medium" ? AMBER : ACCENT;
                    const urgBg    = task.urgency === "high" ? "rgba(255,59,48,0.08)" : task.urgency === "medium" ? "rgba(255,159,10,0.08)" : "rgba(0,122,255,0.08)";
                    const isDone   = dismissing.includes(task.id);
                    return (
                      <div key={task.id} style={{ borderBottom: idx < arr.length - 1 ? `0.5px solid ${SEP}` : "none", animation: isDone ? "slideOutLeft 0.5s ease forwards" : undefined, overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 14px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: isDone ? "rgba(52,199,89,0.08)" : urgBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
                            {isDone ? <Check size={16} style={{ color: GREEN }} /> : <AlertCircle size={16} style={{ color: urgColor }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                            <div style={{ fontSize: "12px", color: TEXT2, marginTop: "2px" }}>{task.sub}</div>
                          </div>
                          <button
                            onClick={() => {
                              setTaskDrawerClose(true);
                              setTimeout(() => { setShowAllTasks(false); setTaskDrawerClose(false); completeTask(task.id, task.tab); }, 300);
                            }}
                            style={{ fontSize: "12px", color: ACCENT, fontWeight: 600, background: "rgba(0,122,255,0.08)", padding: "5px 10px", borderRadius: "8px", flexShrink: 0 }}
                          >
                            {task.actionLabel}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed tasks */}
            <div style={{ padding: "16px 16px 0" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" }}>Completed</div>
              <div style={{ background: BG, borderRadius: "16px", overflow: "hidden" }}>
                {ALL_TASKS_EXTENDED.filter((t) => t.completed).map((task, idx, arr) => (
                  <div key={task.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 14px", borderBottom: idx < arr.length - 1 ? `0.5px solid ${SEP}` : "none" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(52,199,89,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CheckCircle2 size={16} style={{ color: GREEN }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 400, color: TEXT2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: "line-through" }}>{task.title}</div>
                      <div style={{ fontSize: "12px", color: TEXT3, marginTop: "2px" }}>Done {task.completedDate}</div>
                    </div>
                    <CheckCircle2 size={16} style={{ color: GREEN, flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}