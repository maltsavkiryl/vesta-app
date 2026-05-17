import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AvailabilityMap } from "./types";
import { MONTHS, TODAY_STR, makeDateStr } from "./types";
import { useTheme } from "../theme";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

interface Props {
  year: number;
  month: number; // 0-indexed
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (d: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  shiftsSet: Set<string>;
  availability: AvailabilityMap;
  mode: "shifts" | "availability" | "requests";
}

export function MonthCalendar({ year, month, selectedDate, onSelectDate, onPrevMonth, onNextMonth, shiftsSet, availability, mode }: Props) {
  const { colors, theme } = useTheme();
  const ACCENT = colors.accent;
  const TEXT1 = colors.text1;
  const TEXT2 = colors.text2;
  const TEXT3 = colors.text3;
  const BG = colors.bg;
  const CARD = colors.card;
  const SEP = colors.sep;
  const GREEN = colors.green;

  const AVAIL_COLORS: Record<string, string> = {
    preferred:   ACCENT,
    available:   GREEN,
    unavailable: TEXT3,
  };
  const AVAIL_BG: Record<string, string> = {
    preferred:   theme === "dark" ? "rgba(10,132,255,0.15)" : "rgba(0,122,255,0.07)",
    available:   theme === "dark" ? "rgba(48,209,88,0.12)" : "rgba(52,199,89,0.06)",
    unavailable: "transparent",
  };
  const firstDOW  = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDOW; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px 10px" }}>
        <button
          onClick={onPrevMonth}
          style={{ width: "30px", height: "30px", borderRadius: "50%", background: CARD, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ChevronLeft size={14} style={{ color: TEXT1 }} />
        </button>
        <span style={{ fontSize: "15px", fontWeight: 600, color: TEXT2, letterSpacing: "-0.3px" }}>
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={onNextMonth}
          style={{ width: "30px", height: "30px", borderRadius: "50%", background: CARD, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ChevronRight size={14} style={{ color: TEXT1 }} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: "2px" }}>
        {DOW.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: "11px", fontWeight: 500, color: TEXT3, padding: "3px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "1px" }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} style={{ height: "46px" }} />;

          const ds       = makeDateStr(year, month, day);
          const isToday  = ds === TODAY_STR;
          const isSel    = ds === selectedDate;
          const hasShift = shiftsSet.has(ds);
          const avail    = availability[ds];

          // Circle fill
          const circleBg =
            isSel    ? TEXT1  :
            isToday  ? ACCENT :
            "transparent";
          const numColor =
            isSel || isToday ? "#fff" :
            TEXT1;

          // Cell tint (availability mode)
          const cellTint = (mode === "availability" && avail && !isSel) ? AVAIL_BG[avail.status] : "transparent";

          // Dots
          const shiftDot = (mode === "shifts" || mode === "requests") ? hasShift : false;
          const availDot = mode === "availability" && avail && !isSel;
          const dotColor = availDot ? AVAIL_COLORS[avail!.status] : (shiftDot ? ACCENT : null);

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(ds)}
              style={{
                height: "46px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1px",
                background: cellTint,
                borderRadius: "10px",
                transition: "background 0.12s",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: circleBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.12s",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: isSel || isToday ? 700 : 400,
                    color: numColor,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                  }}
                >
                  {day}
                </span>
              </div>
              {dotColor && !isSel && !isToday ? (
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: dotColor }} />
              ) : (
                <div style={{ height: "4px" }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}