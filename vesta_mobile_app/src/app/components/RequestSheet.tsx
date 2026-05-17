import { useState } from "react";
import { X, CalendarRange, RefreshCw, CheckCircle2, ChevronLeft, Users } from "lucide-react";

const ACCENT  = "#007AFF";
const BG      = "#FFFFFF";
const CARD    = "#F2F2F7";
const TEXT1   = "#1C1C1E";
const TEXT2   = "#6C6C70";
const TEXT3   = "#AEAEB2";
const SEP     = "#E5E5EA";
const GREEN   = "#34C759";
const PURPLE  = "#AF52DE";

type RequestType = "timeoff" | "swap";
type Step = 1 | 2 | 3;

interface Props {
  onDismiss: () => void;
  onSubmit?: (data: { type: RequestType; dates: string; reason: string }) => void;
}

const TIME_OFF_DATES = [
  "May 10 – May 12",
  "May 17",
  "May 18",
  "May 24 – May 25",
  "June 1 – June 3",
];

const MY_SHIFTS = [
  { id: "s1", label: "Fri May 2",  time: "17:00 – 00:00" },
  { id: "s2", label: "Mon May 5",  time: "12:00 – 18:00" },
  { id: "s3", label: "Tue May 7",  time: "18:00 – 23:30" },
];

const COLLEAGUES = [
  { id: "c1", name: "Emma D.",    shift: "Mon May 5 · 12-18h" },
  { id: "c2", name: "Lucas M.",   shift: "Thu May 7 · 17-23h" },
  { id: "c3", name: "Yasmine K.", shift: "Wed May 6 · 12-18h" },
];

const REASONS = ["Personal", "Medical", "Family", "Travel", "Other"];

function Checkmark() {
  return (
    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

export function RequestSheet({ onDismiss, onSubmit }: Props) {
  const [closing,    setClosing]    = useState(false);
  const [step,       setStep]       = useState<Step>(1);
  const [type,       setType]       = useState<RequestType | null>(null);
  const [dates,      setDates]      = useState("");
  const [myShift,    setMyShift]    = useState("");
  const [colleague,  setColleague]  = useState("");
  const [reason,     setReason]     = useState("");
  const [note,       setNote]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);

  const close = () => { setClosing(true); setTimeout(onDismiss, 320); };

  const canContinue = type === "swap"
    ? !!myShift && (step < 3 ? true : true)
    : !!dates;

  const handleSubmit = () => {
    if (onSubmit && type) onSubmit({ type, dates: type === "swap" ? myShift : dates, reason });
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); setTimeout(close, 2000); }, 1100);
  };

  if (done) return (
    <>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: CARD, borderRadius: "24px 24px 0 0", padding: "56px 32px 60px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", animation: "sheetUp 0.38s cubic-bezier(0.32,0.72,0,1)" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(52,199,89,0.1)", display: "flex", alignItems: "center", justifyContent: "center", animation: "bounceIn 0.5s ease" }}>
          <CheckCircle2 size={36} style={{ color: GREEN }} />
        </div>
        <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.5px", textAlign: "center" }}>Request submitted!</div>
        <div style={{ fontSize: "14px", color: TEXT2, textAlign: "center", lineHeight: 1.55 }}>
          Your manager has been notified and will review your {type === "swap" ? "shift swap" : "time off"} request shortly.
        </div>
        <div style={{ padding: "12px 20px", background: BG, borderRadius: "12px", width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: TEXT2 }}>
            {type === "timeoff" ? `Time off · ${dates}` : `Swap · ${myShift}${colleague ? ` with ${colleague.split(" ")[0]}` : ""}`}
            {reason ? ` · ${reason}` : ""}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", animation: closing ? "bdOut 0.3s ease forwards" : "bdIn 0.25s ease" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: CARD, borderRadius: "24px 24px 0 0", paddingBottom: "40px", animation: closing ? "sheetDown 0.32s cubic-bezier(0.32,0.72,0,1) forwards" : "sheetUp 0.38s cubic-bezier(0.32,0.72,0,1)", maxHeight: "92%", overflowY: "auto" }}>
        <div style={{ width: "36px", height: "4px", background: "#D1D1D6", borderRadius: "99px", margin: "12px auto 0" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {step > 1 && (
              <button onClick={() => setStep((s) => (s - 1) as Step)} style={{ width: "32px", height: "32px", borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronLeft size={17} style={{ color: TEXT1 }} />
              </button>
            )}
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.4px" }}>New request</div>
              <div style={{ fontSize: "12px", color: TEXT3, marginTop: "1px" }}>Step {step} of 3</div>
            </div>
          </div>
          <button onClick={close} style={{ width: "30px", height: "30px", borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} style={{ color: TEXT2 }} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ margin: "14px 20px 0", height: "3px", background: BG, borderRadius: "99px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(step / 3) * 100}%`, background: ACCENT, borderRadius: "99px", transition: "width 0.3s ease" }} />
        </div>

        <div style={{ padding: "22px 20px 0", animation: "fadeUp 0.18s ease" }}>

          {/* ── Step 1: Type ── */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: TEXT1, marginBottom: "16px" }}>What would you like to request?</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {([
                  { id: "timeoff" as const, Icon: CalendarRange, title: "Time off",   desc: "Request days off or vacation",          color: ACCENT,  bg: "rgba(0,122,255,0.1)"   },
                  { id: "swap"    as const, Icon: RefreshCw,     title: "Shift swap", desc: "Exchange your shift with a colleague",  color: PURPLE,  bg: "rgba(175,82,222,0.1)"  },
                ]).map(({ id, Icon, title, desc, color, bg }) => (
                  <button
                    key={id}
                    onClick={() => { setType(id); setStep(2); }}
                    style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px", background: type === id ? "rgba(0,122,255,0.05)" : BG, border: `1.5px solid ${type === id ? ACCENT : "transparent"}`, borderRadius: "16px", transition: "all 0.15s" }}
                  >
                    <div style={{ width: "48px", height: "48px", borderRadius: "13px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={22} style={{ color }} strokeWidth={1.6} />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "16px", fontWeight: 600, color: TEXT1 }}>{title}</div>
                      <div style={{ fontSize: "13px", color: TEXT2, marginTop: "2px" }}>{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Dates / Shift ── */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: TEXT1, marginBottom: "16px" }}>
                {type === "timeoff" ? "Which dates?" : "Which shift do you want to swap?"}
              </div>

              {/* Time off: date picker */}
              {type === "timeoff" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {TIME_OFF_DATES.map((d) => {
                    const sel = dates === d;
                    return (
                      <button key={d} onClick={() => setDates(d)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: sel ? "rgba(0,122,255,0.06)" : BG, border: `1.5px solid ${sel ? ACCENT : "transparent"}`, borderRadius: "14px", transition: "all 0.15s" }}
                      >
                        <span style={{ fontSize: "15px", color: TEXT1, fontWeight: sel ? 500 : 400 }}>{d}</span>
                        {sel && <Checkmark />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Swap: my shift + colleague */}
              {type === "swap" && (
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: TEXT2, marginBottom: "8px" }}>My shift to swap:</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "18px" }}>
                    {MY_SHIFTS.map((s) => {
                      const sel = myShift === s.id;
                      return (
                        <button key={s.id} onClick={() => setMyShift(s.id)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", background: sel ? "rgba(0,122,255,0.06)" : BG, border: `1.5px solid ${sel ? ACCENT : "transparent"}`, borderRadius: "13px" }}
                        >
                          <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>{s.label}</div>
                            <div style={{ fontSize: "12px", color: TEXT2 }}>{s.time}</div>
                          </div>
                          {sel && <Checkmark />}
                        </button>
                      );
                    })}
                  </div>

                  {myShift && (
                    <div style={{ animation: "fadeUp 0.15s ease" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                        <Users size={13} style={{ color: TEXT3 }} />
                        <div style={{ fontSize: "13px", fontWeight: 500, color: TEXT2 }}>Swap with a colleague:</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {COLLEAGUES.map((c) => {
                          const sel = colleague === c.id;
                          return (
                            <button key={c.id} onClick={() => setColleague(c.id)}
                              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: sel ? "rgba(0,122,255,0.06)" : BG, border: `1.5px solid ${sel ? ACCENT : "transparent"}`, borderRadius: "12px" }}
                            >
                              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: sel ? ACCENT : "#E5E5EA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: sel ? "#fff" : TEXT2 }}>{c.name[0]}</span>
                              </div>
                              <div style={{ flex: 1, textAlign: "left" }}>
                                <div style={{ fontSize: "14px", fontWeight: 500, color: TEXT1 }}>{c.name}</div>
                                <div style={{ fontSize: "12px", color: TEXT2 }}>{c.shift}</div>
                              </div>
                              {sel && <Checkmark />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: "14px", borderRadius: "14px", background: BG, fontSize: "15px", fontWeight: 500, color: TEXT1, border: `1px solid ${SEP}` }}>Back</button>
                <button onClick={() => canContinue && setStep(3)} style={{ flex: 2, padding: "14px", borderRadius: "14px", background: canContinue ? ACCENT : "#C7C7CC", color: "#fff", fontSize: "15px", fontWeight: 600, transition: "background 0.2s" }}>Continue</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Reason ── */}
          {step === 3 && (
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: TEXT1, marginBottom: "16px" }}>Reason (optional)</div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                {REASONS.map((r) => (
                  <button key={r} onClick={() => setReason(reason === r ? "" : r)}
                    style={{ padding: "8px 16px", borderRadius: "20px", background: reason === r ? ACCENT : BG, color: reason === r ? "#fff" : TEXT1, fontSize: "13px", fontWeight: 500, border: reason === r ? "none" : `1px solid ${SEP}`, transition: "all 0.15s" }}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add any notes for your manager…" rows={3}
                style={{ width: "100%", background: BG, border: `1px solid ${SEP}`, borderRadius: "14px", padding: "12px 14px", fontSize: "14px", color: TEXT1, resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: "14px" }}
              />

              {/* Summary card */}
              <div style={{ background: BG, borderRadius: "14px", padding: "14px 16px", marginBottom: "18px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: TEXT3, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Summary</div>
                {[
                  { lbl: "Type",    val: type === "timeoff" ? "Time off" : "Shift swap"                       },
                  { lbl: type === "swap" ? "My shift" : "Dates", val: type === "swap" ? MY_SHIFTS.find((s) => s.id === myShift)?.label || myShift : dates },
                  ...(type === "swap" && colleague ? [{ lbl: "Swap with", val: COLLEAGUES.find((c) => c.id === colleague)?.name || "" }] : []),
                  ...(reason ? [{ lbl: "Reason", val: reason }] : []),
                ].map(({ lbl, val }) => (
                  <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <span style={{ fontSize: "13px", color: TEXT2 }}>{lbl}</span>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: TEXT1 }}>{val}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: "14px", borderRadius: "14px", background: BG, fontSize: "15px", fontWeight: 500, color: TEXT1, border: `1px solid ${SEP}` }}>Back</button>
                <button onClick={handleSubmit} disabled={submitting}
                  style={{ flex: 2, padding: "14px", borderRadius: "14px", background: ACCENT, color: "#fff", fontSize: "15px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  {submitting
                    ? <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                    : "Submit request"
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}