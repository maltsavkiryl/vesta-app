import { useState, useRef, useCallback } from "react";
import {
  UtensilsCrossed, Wine, ChefHat, Users, CreditCard,
  Briefcase, Truck, Sparkles, Plus, ArrowRight, ChevronLeft,
  Search, MapPin, Star, CheckCircle2, Bell, Calendar, FileText,
} from "lucide-react";
import { useTheme } from "../theme";

// ── Mock employer data ─────────────────────────────────────────────────────
const EMPLOYERS = [
  { code: "111111", name: "La Belle Époque", type: "Restaurant", location: "Brussels, BE",  employees: 18, rating: 4.7 },
  { code: "BIST01", name: "Bistro Noir",    type: "Restaurant", location: "Brussels, BE",  employees: 12, rating: 4.8 },
  { code: "GRAN02", name: "Grand Café",     type: "Café",       location: "Brussels, BE",  employees: 8,  rating: 4.6 },
  { code: "LUXH03", name: "The Lux Hotel",  type: "Hotel",      location: "Brussels, BE",  employees: 45, rating: 4.9 },
  { code: "FREN04", name: "French Quarter", type: "Restaurant", location: "Bruges, BE",    employees: 20, rating: 4.7 },
  { code: "CAFE05", name: "Café du Parc",   type: "Café",       location: "Ghent, BE",     employees: 6,  rating: 4.5 },
];

const ROLES = [
  { id: "waiter",    label: "Waiter",     icon: UtensilsCrossed },
  { id: "bartender", label: "Bartender",  icon: Wine            },
  { id: "chef",      label: "Chef",       icon: ChefHat         },
  { id: "host",      label: "Host/ess",   icon: Users           },
  { id: "cashier",   label: "Cashier",    icon: CreditCard      },
  { id: "manager",   label: "Manager",    icon: Briefcase       },
  { id: "driver",    label: "Driver",     icon: Truck           },
  { id: "cleaner",   label: "Cleaner",    icon: Sparkles        },
  { id: "other",     label: "Other",      icon: Plus            },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = [
  { id: "mornings",  label: "Mornings",  sub: "6:00 – 14:00" },
  { id: "evenings",  label: "Evenings",  sub: "14:00 – 23:00"},
  { id: "full",      label: "Full day",  sub: "6:00 – 23:00" },
  { id: "flexible",  label: "Flexible",  sub: "I'll specify"  },
];

interface Props {
  user: { firstName: string; lastName: string; email: string };
  onComplete: (data: { role: string; employer: typeof EMPLOYERS[0] | null }) => void;
}

export function OnboardingScreen({ user, onComplete }: Props) {
  const { colors } = useTheme();
  const ACCENT = colors.accent;
  const BG = colors.bg;
  const CARD = colors.card;
  const TEXT1 = colors.text1;
  const TEXT2 = colors.text2;
  const TEXT3 = colors.text3;
  const SEP = colors.sep;
  const GREEN = colors.green;

  // ── Toggle ──────────────────────────────────────────────────────────────────
  const Toggle = useCallback(({ value, onChange }: { value: boolean; onChange: () => void }) => {
    return (
      <button onClick={onChange} style={{ width: "51px", height: "31px", borderRadius: "15.5px", background: value ? GREEN : (colors.theme === "dark" ? "#38383A" : "#E5E5EA"), position: "relative", flexShrink: 0, transition: "background 0.22s ease" }}>
        <div style={{ position: "absolute", top: "2px", left: value ? "22px" : "2px", width: "27px", height: "27px", borderRadius: "50%", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.18)", transition: "left 0.22s ease" }} />
      </button>
    );
  }, [GREEN, colors.theme]);

  // ── Progress dots ────────────────────────────────────────────────────────────
  const ProgressDots = useCallback(({ step, total }: { step: number; total: number }) => {
    return (
      <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              height: "6px",
              width: i === step ? "20px" : "6px",
              borderRadius: "3px",
              background: i === step ? ACCENT : i < step ? "rgba(0,122,255,0.3)" : SEP,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    );
  }, [ACCENT, SEP]);

  // ── Code boxes input ─────────────────────────────────────────────────────────
  const CodeInput = useCallback(({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const ref = useRef<HTMLInputElement>(null);
    return (
      <div style={{ position: "relative" }}>
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
          style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, zIndex: 1 }}
          autoComplete="off"
          autoCapitalize="characters"
        />
        <div
          onClick={() => ref.current?.focus()}
          style={{ display: "flex", gap: "8px", justifyContent: "center", cursor: "text" }}
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const active = i === value.length && value.length < 6;
            const filled = i < value.length;
            return (
              <div
                key={i}
                style={{
                  width: "46px", height: "56px",
                  borderRadius: "12px",
                  border: active ? `2px solid ${ACCENT}` : `1.5px solid ${filled ? TEXT1 : SEP}`,
                  background: filled ? "rgba(0,122,255,0.04)" : BG,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", fontWeight: 700, color: TEXT1,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "0.05em",
                  transition: "border-color 0.15s, background 0.15s",
                  boxShadow: active ? `0 0 0 3px rgba(0,122,255,0.12)` : "none",
                }}
              >
                {value[i] || (active ? <div style={{ width: "2px", height: "22px", background: ACCENT, animation: "cursorBlink 1s infinite" }} /> : "")}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [ACCENT, BG, TEXT1, SEP]);

  const TOTAL_STEPS = 6;
  const [step,       setStep]       = useState(0);
  const [role,       setRole]       = useState("");
  const [code,       setCode]       = useState("");
  const [searchQ,    setSearchQ]    = useState("");
  const [employer,   setEmployer]   = useState<typeof EMPLOYERS[0] | null>(null);
  const [joinMode,   setJoinMode]   = useState<"code" | "search">("code");
  const [joining,    setJoining]    = useState(false);
  const [joined,     setJoined]     = useState(false);
  const [availDays,  setAvailDays]  = useState<string[]>(["Mon","Tue","Wed","Thu","Fri"]);
  const [timeSlot,   setTimeSlot]   = useState("evenings");
  const [notifs, setNotifs] = useState({ shifts: true, schedule: true, payslips: true, timeoff: true, updates: false });

  // Code lookup
  const handleCodeChange = (v: string) => {
    setCode(v);
    setEmployer(null);
    if (v.length === 6) {
      const found = EMPLOYERS.find((e) => e.code === v);
      if (found) setTimeout(() => setEmployer(found), 200);
    }
  };

  const searchResults = searchQ.length > 1
    ? EMPLOYERS.filter((e) => e.name.toLowerCase().includes(searchQ.toLowerCase()) || e.location.toLowerCase().includes(searchQ.toLowerCase()))
    : [];

  const handleJoin = () => {
    if (!employer) return;
    setJoining(true);
    setTimeout(() => { setJoining(false); setJoined(true); }, 1200);
  };

  const toggleDay = (d: string) => setAvailDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else onComplete({ role, employer });
  };
  const back = () => step > 0 && setStep((s) => s - 1);

  const canContinue = [
    true,                       // welcome
    role !== "",               // role
    joined,                    // employer
    availDays.length > 0,      // availability
    true,                      // notifications
    true,                      // done
  ][step];

  return (
    <div style={{ position: "absolute", inset: 0, background: BG, display: "flex", flexDirection: "column", overflowY: "auto", scrollbarWidth: "none" }}>

      {/* ── Step 0: Welcome ── */}
      {step === 0 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "64px 28px 40px", animation: "fadeUp 0.3s ease" }}>
          {/* Abstract shape */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px" }}>
            <div style={{ position: "relative", width: "180px", height: "180px" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,122,255,0.06)", transform: "scale(1.3)" }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,122,255,0.08)", transform: "scale(1.1)" }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: TEXT1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <path d="M18 22L36 52L54 22" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M27 22L36 40L45 22" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4"/>
                </svg>
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.8px", lineHeight: 1.2, marginBottom: "12px" }}>
              Welcome to Vesta,{"\n"}{user.firstName}.
            </div>
            <div style={{ fontSize: "16px", color: TEXT2, lineHeight: 1.6, marginBottom: "40px" }}>
              Let's get your account set up in just a few steps. It'll only take 2 minutes.
            </div>
            <button
              onClick={next}
              style={{ width: "100%", background: TEXT1, borderRadius: "16px", padding: "16px", color: "#fff", fontSize: "17px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              Get started <ArrowRight size={18} />
            </button>
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <button onClick={() => onComplete({ role: "waiter", employer: EMPLOYERS[0] })} style={{ color: TEXT3, fontSize: "13px", background: "none" }}>
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Steps 1–5 ── */}
      {step > 0 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Step header */}
          <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={back} style={{ width: "32px", height: "32px", borderRadius: "50%", background: CARD, border: `1px solid ${SEP}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ChevronLeft size={16} style={{ color: TEXT1 }} />
            </button>
            <div style={{ flex: 1 }}>
              <ProgressDots step={step - 1} total={TOTAL_STEPS - 1} />
            </div>
            <div style={{ width: "32px" }} />
          </div>

          {/* Step content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 20px", scrollbarWidth: "none" }}>

            {/* ── Step 1: Role ── */}
            {step === 1 && (
              <div style={{ animation: "fadeUp 0.25s ease" }}>
                <div style={{ fontSize: "26px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.6px", marginBottom: "6px" }}>What's your role?</div>
                <div style={{ fontSize: "15px", color: TEXT2, marginBottom: "24px" }}>We'll personalize your experience for how you work.</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {ROLES.map(({ id, label, icon: Icon }) => {
                    const isActive = role === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setRole(id)}
                        style={{
                          background: isActive ? TEXT1 : CARD,
                          border: isActive ? "none" : `1px solid ${SEP}`,
                          borderRadius: "16px", padding: "16px 8px",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                          transition: "all 0.15s",
                          boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                        }}
                      >
                        <Icon size={22} style={{ color: isActive ? "#fff" : TEXT1 }} strokeWidth={1.6} />
                        <span style={{ fontSize: "12px", fontWeight: 500, color: isActive ? "#fff" : TEXT1 }}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Step 2: Employer ── */}
            {step === 2 && (
              <div style={{ animation: "fadeUp 0.25s ease" }}>
                <div style={{ fontSize: "26px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.6px", marginBottom: "6px" }}>Join your employer</div>
                <div style={{ fontSize: "15px", color: TEXT2, marginBottom: "24px" }}>Enter the 6-digit code from your manager or search by name.</div>

                {/* Mode toggle */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "rgba(116,116,128,0.1)", borderRadius: "10px", padding: "2px", marginBottom: "20px" }}>
                  {(["code", "search"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setJoinMode(m); setCode(""); setSearchQ(""); setEmployer(null); setJoined(false); }}
                      style={{ padding: "7px", borderRadius: "8px", background: joinMode === m ? CARD : "transparent", boxShadow: joinMode === m ? "0 1px 3px rgba(0,0,0,0.1)" : "none", fontSize: "13px", fontWeight: joinMode === m ? 600 : 400, color: joinMode === m ? TEXT1 : TEXT2, transition: "all 0.15s" }}
                    >
                      {m === "code" ? "Invite code" : "Search"}
                    </button>
                  ))}
                </div>

                {joinMode === "code" ? (
                  <>
                    <CodeInput value={code} onChange={handleCodeChange} />
                    <div style={{ textAlign: "center", marginTop: "8px", fontSize: "12px", color: TEXT3 }}>
                      {code.length === 0 ? "Type or paste your invite code" :
                       code.length < 6  ? `${6 - code.length} more character${code.length === 5 ? "" : "s"}…` :
                       employer ? "Employer found!" : "Code not recognized"}
                    </div>
                  </>
                ) : (
                  <div style={{ position: "relative" }}>
                    <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: TEXT3 }} />
                    <input
                      value={searchQ}
                      onChange={(e) => { setSearchQ(e.target.value); setEmployer(null); setJoined(false); }}
                      placeholder="Search by name or city…"
                      style={{ width: "100%", background: CARD, border: `1px solid ${SEP}`, borderRadius: "14px", padding: "13px 14px 13px 40px", fontSize: "15px", color: TEXT1, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                  </div>
                )}

                {/* Search results */}
                {joinMode === "search" && searchResults.length > 0 && !joined && (
                  <div style={{ background: CARD, borderRadius: "14px", border: `1px solid ${SEP}`, overflow: "hidden", marginTop: "10px", animation: "fadeUp 0.15s ease" }}>
                    {searchResults.map((emp, i) => (
                      <button
                        key={emp.code}
                        onClick={() => setEmployer(emp)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderBottom: i < searchResults.length - 1 ? `0.5px solid ${SEP}` : "none", background: employer?.code === emp.code ? "rgba(0,122,255,0.04)" : "none", textAlign: "left" }}
                      >
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <MapPin size={15} style={{ color: TEXT2 }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>{emp.name}</div>
                          <div style={{ fontSize: "12px", color: TEXT2 }}>{emp.type} · {emp.location}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                          <Star size={11} style={{ color: "#FF9F0A", fill: "#FF9F0A" }} />
                          <span style={{ fontSize: "12px", color: TEXT2 }}>{emp.rating}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Employer preview */}
                {employer && !joined && (
                  <div style={{ background: CARD, borderRadius: "16px", border: `1px solid ${SEP}`, padding: "16px", marginTop: "16px", animation: "fadeUp 0.2s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: TEXT1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>{employer.name[0]}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "17px", fontWeight: 600, color: TEXT1 }}>{employer.name}</div>
                        <div style={{ fontSize: "13px", color: TEXT2 }}>{employer.type} · {employer.location}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <Star size={13} style={{ color: "#FF9F0A", fill: "#FF9F0A" }} />
                        <span style={{ fontSize: "13px", fontWeight: 500, color: TEXT1 }}>{employer.rating}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                      <div style={{ flex: 1, background: BG, borderRadius: "10px", padding: "8px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: TEXT1 }}>{employer.employees}</div>
                        <div style={{ fontSize: "11px", color: TEXT2 }}>Employees</div>
                      </div>
                      <div style={{ flex: 1, background: BG, borderRadius: "10px", padding: "8px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: TEXT1 }}>Open</div>
                        <div style={{ fontSize: "11px", color: TEXT2 }}>Hiring</div>
                      </div>
                    </div>
                    <button
                      onClick={handleJoin}
                      disabled={joining}
                      style={{ width: "100%", background: joining ? "#B0C9F0" : ACCENT, borderRadius: "12px", padding: "13px", color: "#fff", fontSize: "15px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                      {joining
                        ? <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                        : "Request to join"}
                    </button>
                  </div>
                )}

                {/* Joined success */}
                {joined && employer && (
                  <div style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.15)", borderRadius: "16px", padding: "16px", marginTop: "16px", display: "flex", alignItems: "center", gap: "12px", animation: "pop 0.3s ease" }}>
                    <CheckCircle2 size={24} style={{ color: GREEN, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: TEXT1 }}>Request sent!</div>
                      <div style={{ fontSize: "13px", color: TEXT2, marginTop: "2px" }}>You'll be notified when {employer.name} approves you.</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 3: Availability ── */}
            {step === 3 && (
              <div style={{ animation: "fadeUp 0.25s ease" }}>
                <div style={{ fontSize: "26px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.6px", marginBottom: "6px" }}>Your availability</div>
                <div style={{ fontSize: "15px", color: TEXT2, marginBottom: "24px" }}>Let your employer know when you can work. You can always change this later.</div>

                {/* Day chips */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>Days</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {DAYS.map((d) => {
                      const isActive = availDays.includes(d);
                      return (
                        <button
                          key={d}
                          onClick={() => toggleDay(d)}
                          style={{
                            padding: "8px 14px", borderRadius: "20px",
                            background: isActive ? TEXT1 : CARD,
                            border: isActive ? "none" : `1px solid ${SEP}`,
                            fontSize: "13px", fontWeight: 500,
                            color: isActive ? "#fff" : TEXT1,
                            transition: "all 0.15s",
                          }}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slot */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>Typical hours</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {TIMES.map((t) => {
                      const isActive = timeSlot === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTimeSlot(t.id)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", background: isActive ? "rgba(0,122,255,0.06)" : CARD, border: isActive ? `1.5px solid ${ACCENT}` : `1.5px solid transparent`, borderRadius: "14px", transition: "all 0.15s" }}
                        >
                          <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: "15px", fontWeight: 500, color: TEXT1 }}>{t.label}</div>
                            <div style={{ fontSize: "12px", color: TEXT2, marginTop: "1px" }}>{t.sub}</div>
                          </div>
                          {isActive && (
                            <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4L4 7L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Notifications ── */}
            {step === 4 && (
              <div style={{ animation: "fadeUp 0.25s ease" }}>
                <div style={{ fontSize: "26px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.6px", marginBottom: "6px" }}>Stay in the loop</div>
                <div style={{ fontSize: "15px", color: TEXT2, marginBottom: "24px" }}>Choose what updates you'd like to receive. You can change these anytime.</div>

                {[
                  { key: "shifts" as const,   icon: Calendar,   label: "Shift updates",     desc: "Reminders before your shift starts" },
                  { key: "schedule" as const,  icon: Calendar,   label: "Schedule changes",  desc: "When your schedule is updated"       },
                  { key: "payslips" as const,  icon: FileText,   label: "New payslip",        desc: "When your payslip is ready"          },
                  { key: "timeoff" as const,   icon: Bell,       label: "Request updates",   desc: "Time off and swap responses"         },
                  { key: "updates" as const,   icon: Bell,       label: "App updates",       desc: "New features and improvements"       },
                ].map((item, i, arr) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 4px" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: CARD, border: `1px solid ${SEP}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={16} style={{ color: TEXT2 }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "15px", color: TEXT1, fontWeight: 400 }}>{item.label}</div>
                          <div style={{ fontSize: "12px", color: TEXT3, marginTop: "1px" }}>{item.desc}</div>
                        </div>
                        <Toggle value={notifs[item.key]} onChange={() => setNotifs((p) => ({ ...p, [item.key]: !p[item.key] }))} />
                      </div>
                      {i < arr.length - 1 && <div style={{ height: "0.5px", background: SEP }} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Step 5: Done ── */}
            {step === 5 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "16px", animation: "fadeUp 0.25s ease" }}>
                {/* Animated check */}
                <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: "rgba(52,199,89,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", animation: "pop 0.4s ease" }}>
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <path d="M8 22L18 32L36 12" stroke={GREEN} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 50, strokeDashoffset: 0 }}/>
                  </svg>
                </div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.6px", marginBottom: "8px", textAlign: "center" }}>You're all set!</div>
                <div style={{ fontSize: "15px", color: TEXT2, marginBottom: "32px", textAlign: "center", lineHeight: 1.6 }}>
                  Your Vesta account is ready. Here's what we set up for you.
                </div>

                {/* Summary */}
                <div style={{ width: "100%", background: CARD, borderRadius: "16px", border: `1px solid ${SEP}`, overflow: "hidden", marginBottom: "8px" }}>
                  {[
                    { label: "Role",        value: ROLES.find((r) => r.id === role)?.label || "—" },
                    { label: "Employer",    value: employer?.name || "Pending" },
                    { label: "Availability", value: availDays.length > 0 ? `${availDays.length} days/week` : "Not set" },
                    { label: "Notifications", value: Object.values(notifs).filter(Boolean).length + " enabled" },
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: i < arr.length - 1 ? `0.5px solid ${SEP}` : "none" }}>
                      <span style={{ fontSize: "14px", color: TEXT2 }}>{label}</span>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom CTA */}
          <div style={{ padding: "12px 20px 32px", background: BG, borderTop: step > 0 && step < 5 ? "none" : "none" }}>
            <button
              onClick={next}
              disabled={!canContinue}
              style={{
                width: "100%", background: canContinue ? (step === 5 ? GREEN : ACCENT) : "#D1D1D6",
                borderRadius: "16px", padding: "16px", color: "#fff",
                fontSize: "17px", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "background 0.2s",
              }}
            >
              {step === 5
                ? <><CheckCircle2 size={18} /> Start using Vesta</>
                : step === 2 && !joined
                  ? "Skip for now"
                  : <>Continue <ArrowRight size={17} /></>
              }
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes cursorBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
