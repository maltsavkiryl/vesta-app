import { useState } from "react";
import { Home, Calendar, Clock, FileText, User } from "lucide-react";
import type { TabId } from "./types";
import { useTheme } from "../theme";

interface TabBarProps {
  activeTab:    TabId;
  setActiveTab: (tab: TabId) => void;
  badges?:      Partial<Record<TabId, number>>;
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "home",      label: "Home",     icon: Home     },
  { id: "schedule",  label: "Schedule", icon: Calendar },
  { id: "time",      label: "Time",     icon: Clock    },
  { id: "documents", label: "Docs",     icon: FileText },
  { id: "profile",   label: "Profile",  icon: User     },
];

export function TabBar({ activeTab, setActiveTab, badges = {} }: TabBarProps) {
  const { colors, theme } = useTheme();
  const ACCENT = colors.accent;
  const GREY = theme === "dark" ? "#98989D" : "#8E8E93";
  const BG = colors.bg;

  const [pressed, setPressed] = useState<TabId | null>(null);

  const handlePress = (id: TabId) => {
    setPressed(id);
    setActiveTab(id);
    setTimeout(() => setPressed(null), 180);
  };

  return (
    <div
      style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: theme === "dark" ? "rgba(28,28,30,0.92)" : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        borderTop: theme === "dark" ? "0.5px solid rgba(255,255,255,0.08)" : "0.5px solid rgba(0,0,0,0.06)",
        height: "82px",
        paddingBottom: "18px",
        display: "grid",
        gridTemplateColumns: "repeat(5,1fr)",
      }}
    >
      {TABS.map((tab) => {
        const Icon     = tab.icon;
        const isActive = activeTab === tab.id;
        const isPress  = pressed === tab.id;
        const badge    = badges[tab.id];
        const isFilled = tab.id === "home" || tab.id === "profile";

        return (
          <button
            key={tab.id}
            onPointerDown={() => setPressed(tab.id)}
            onPointerUp={() => handlePress(tab.id)}
            onPointerLeave={() => setPressed(null)}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "3px", background: "none",
              position: "relative",
              transform: isPress ? "scale(0.88)" : "scale(1)",
              transition: "transform 0.12s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {/* Icon */}
            <div style={{ position: "relative" }}>
              <Icon
                size={22}
                style={{
                  color: isActive ? ACCENT : GREY,
                  fill: isActive && isFilled ? ACCENT : "transparent",
                  transition: "color 0.15s, fill 0.15s",
                }}
                strokeWidth={isActive ? 2.2 : 1.7}
              />

              {/* Badge */}
              {badge && badge > 0 && (
                <div
                  style={{
                    position: "absolute", top: "-5px", right: "-7px",
                    minWidth: "17px", height: "17px",
                    background: "#FF3B30",
                    borderRadius: "8.5px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 4px",
                    border: `1.5px solid ${theme === "dark" ? "rgba(28,28,30,0.94)" : "rgba(249,249,251,0.94)"}`,
                    animation: "pop 0.3s ease",
                  }}
                >
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                    {badge > 9 ? "9+" : badge}
                  </span>
                </div>
              )}
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: "10px",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? ACCENT : GREY,
                letterSpacing: "-0.1px",
                transition: "color 0.15s",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}