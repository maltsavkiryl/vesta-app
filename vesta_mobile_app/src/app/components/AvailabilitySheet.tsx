import { useState } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import type { DayAvailability, AvailabilityStatus } from "./types";
import { useTheme } from "../theme";

export type { DayAvailability, AvailabilityStatus };

interface Props {
  dayName:     string;
  dateFull:    string;
  currentAvail: DayAvailability;
  onSave:      (avail: DayAvailability) => void;
  onDismiss:   () => void;
}

const MINUTES = ["00", "15", "30", "45"];

function nearestMinute(m: number): string {
  const opts = [0, 15, 30, 45];
  const closest = opts.reduce((a, b) => (Math.abs(b - m) < Math.abs(a - m) ? b : a));
  return String(closest).padStart(2, "0");
}

function parseTime(t: string): [number, string] {
  const [hStr, mStr] = t.split(":");
  return [parseInt(hStr, 10), nearestMinute(parseInt(mStr || "0", 10))];
}

export function AvailabilitySheet({ dayName, dateFull, currentAvail, onSave, onDismiss }: Props) {
  const { colors, theme } = useTheme();
  const ACCENT = colors.accent;
  const BG = colors.bg;
  const CARD = colors.card;
  const TEXT1 = colors.text1;
  const TEXT2 = colors.text2;
  const TEXT3 = colors.text3;
  const SEP = colors.sep;
  const GREEN = colors.green;
  const [status,    setStatus]    = useState<AvailabilityStatus>(currentAvail.status);
  const [startTime, setStartTime] = useState(currentAvail.startTime);
  const [endTime,   setEndTime]   = useState(currentAvail.endTime);
  const [closing,   setClosing]   = useState(false);

  const close = () => { setClosing(true); setTimeout(onDismiss, 320); };
  const handleSave = () => { onSave({ status, startTime, endTime }); };

  const STATUS_CFG = {
    unavailable: { label: "Unavailable", desc: "Day off",             activeBg: TEXT1,    activeText: "#fff" },
    available:   { label: "Available",   desc: "Can work if needed",  activeBg: GREEN,    activeText: "#fff" },
    preferred:   { label: "Preferred",   desc: "I prefer to work",    activeBg: ACCENT,   activeText: "#fff" },
  };

  interface TimeFieldProps {
    label:    string;
    value:    string;
    onChange: (v: string) => void;
  }

  const TimeField = ({ label, value, onChange }: TimeFieldProps) => {
    const [h, mStr] = parseTime(value);
    const mIdx = MINUTES.indexOf(mStr);

    const stepH = (d: number) => {
      const newH = (h + d + 24) % 24;
      onChange(`${String(newH).padStart(2, "0")}:${mStr}`);
    };

    const stepM = (d: number) => {
      const newIdx = (mIdx + d + MINUTES.length) % MINUTES.length;
      if (d > 0 && newIdx === 0) { stepH(1); return; }
      if (d < 0 && mIdx === 0) {
        const newH = (h - 1 + 24) % 24;
        onChange(`${String(newH).padStart(2, "0")}:45`);
        return;
      }
      onChange(`${String(h).padStart(2, "0")}:${MINUTES[newIdx]}`);
    };

    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const ampm = h < 12 ? "AM" : "PM";

    const btn: React.CSSProperties = {
      width: "34px", height: "34px", borderRadius: "50%",
      background: CARD, border: `1px solid ${SEP}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    };

    return (
      <div
        style={{
          flex: 1, background: BG, borderRadius: "16px",
          padding: "14px 10px 12px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
        }}
      >
        <div style={{ fontSize: "11px", color: TEXT3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label}
        </div>

        {/* Hour */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button style={btn} onClick={() => stepH(-1)}>
            <ChevronDown size={15} strokeWidth={2.5} style={{ color: ACCENT }} />
          </button>
          <div style={{ width: "44px", textAlign: "center", fontSize: "28px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums" }}>
            {String(displayH).padStart(2, "0")}
          </div>
          <button style={btn} onClick={() => stepH(1)}>
            <ChevronUp size={15} strokeWidth={2.5} style={{ color: ACCENT }} />
          </button>
        </div>

        <div style={{ height: "1px", background: SEP, width: "70%" }} />

        {/* Minute */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button style={btn} onClick={() => stepM(-1)}>
            <ChevronDown size={15} strokeWidth={2.5} style={{ color: ACCENT }} />
          </button>
          <div style={{ width: "44px", textAlign: "center", fontSize: "28px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums" }}>
            {mStr}
          </div>
          <button style={btn} onClick={() => stepM(1)}>
            <ChevronUp size={15} strokeWidth={2.5} style={{ color: ACCENT }} />
          </button>
        </div>

        <div style={{ padding: "3px 10px", background: theme === "dark" ? "rgba(10,132,255,0.15)" : "rgba(0,122,255,0.08)", borderRadius: "20px", fontSize: "12px", fontWeight: 600, color: ACCENT }}>
          {ampm}
        </div>
      </div>
    );
  };

  const [sh] = parseTime(startTime);
  const [eh] = parseTime(endTime);
  const dur  = eh <= sh ? eh + 24 - sh : eh - sh;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
          animation: closing ? "bdOut 0.3s ease forwards" : "bdIn 0.25s ease",
          cursor: "pointer",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: CARD, borderRadius: "24px 24px 0 0",
          paddingBottom: "40px",
          animation: closing
            ? "sheetDown 0.32s cubic-bezier(0.32,0.72,0,1) forwards"
            : "sheetUp 0.38s cubic-bezier(0.32,0.72,0,1)",
          zIndex: 1, maxHeight: "92%", overflowY: "auto", scrollbarWidth: "none",
        }}
      >
        {/* Handle */}
        <div style={{ width: "36px", height: "4px", background: "#D1D1D6", borderRadius: "99px", margin: "12px auto 0" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 22px 16px" }}>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: TEXT1, letterSpacing: "-0.5px" }}>{dayName}</div>
            <div style={{ fontSize: "14px", color: TEXT2, marginTop: "2px" }}>{dateFull}</div>
          </div>
          <button
            onClick={close}
            style={{ width: "30px", height: "30px", borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={15} style={{ color: TEXT2 }} />
          </button>
        </div>

        <div style={{ padding: "0 22px" }}>
          {/* Status */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", color: TEXT3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
              Availability status
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["unavailable", "available", "preferred"] as const).map((s) => {
                const cfg = STATUS_CFG[s];
                const isActive = status === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    style={{
                      flex: 1, padding: "12px 6px", borderRadius: "14px",
                      background: isActive ? cfg.activeBg : BG,
                      border: isActive ? "none" : `1px solid ${SEP}`,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 600, color: isActive ? cfg.activeText : TEXT1 }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: "10px", color: isActive ? `${cfg.activeText}88` : TEXT3, textAlign: "center", lineHeight: 1.3 }}>
                      {cfg.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time range */}
          {status !== "unavailable" && (
            <div style={{ marginBottom: "20px", animation: "fadeUp 0.2s ease" }}>
              <div style={{ fontSize: "11px", color: TEXT3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                Working hours
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "stretch" }}>
                <TimeField label="From" value={startTime} onChange={setStartTime} />
                <div style={{ display: "flex", alignItems: "center", paddingTop: "30px", color: TEXT3, fontSize: "18px", fontWeight: 600 }}>–</div>
                <TimeField label="To" value={endTime} onChange={setEndTime} />
              </div>
              <div style={{ marginTop: "10px", textAlign: "center", fontSize: "13px", color: TEXT2 }}>
                Duration: <span style={{ fontWeight: 600, color: TEXT1 }}>{dur}h</span>
              </div>
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            style={{
              width: "100%", background: ACCENT, borderRadius: "16px",
              padding: "16px", color: "#fff", fontSize: "17px", fontWeight: 600, letterSpacing: "-0.2px",
            }}
          >
            Save availability
          </button>
        </div>
      </div>
    </>
  );
}