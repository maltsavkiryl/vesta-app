import { useState } from "react";
import { Home }               from "./components/Home";
import { Schedule }           from "./components/Schedule";
import { Time }               from "./components/Time";
import { Documents }          from "./components/Documents";
import { Profile }            from "./components/Profile";
import { TabBar }             from "./components/TabBar";
import { AuthScreen }         from "./components/AuthScreen";
import { OnboardingScreen }   from "./components/OnboardingScreen";
import { AvailabilitySheet }  from "./components/AvailabilitySheet";
import { ShiftDetailSheet }   from "./components/ShiftDetailSheet";
import { RequestSheet }       from "./components/RequestSheet";
import { NotificationsSheet } from "./components/NotificationsSheet";
import { ClockOutSheet }      from "./components/ClockOutSheet";
import type { TabId, SheetConfig } from "./components/types";
import { ThemeProvider, Theme } from "./theme";

type AppState = "auth" | "onboarding" | "main";

interface UserData {
  firstName: string;
  lastName:  string;
  email:     string;
  role?:     string;
  employer?: string;
}

export default function App() {
  const [appState,  setAppState]  = useState<AppState>("auth");
  const [user,      setUser]      = useState<UserData>({ firstName: "Sofia", lastName: "Fischer", email: "sofia.fischer@email.com" });
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [sheet,     setSheet]     = useState<SheetConfig | null>(null);
  const [theme,     setTheme]     = useState<Theme>("light");

  const navigate   = (tab: TabId)       => { setSheet(null); setActiveTab(tab); };
  const openSheet  = (cfg: SheetConfig) => setSheet(cfg);
  const closeSheet = ()                 => setSheet(null);
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const handleLogin = (u: { firstName: string; lastName: string; email: string }) => {
    setUser(u);
    setAppState("main");
  };

  const handleRegister = (u: { firstName: string; lastName: string; email: string }) => {
    setUser(u);
    setAppState("onboarding");
  };

  const handleOnboardingComplete = (data: { role: string; employer: { name: string } | null }) => {
    setUser((prev) => ({ ...prev, role: data.role, employer: data.employer?.name || undefined }));
    setAppState("main");
  };

  const isAuth = appState === "auth";
  const containerBg = isAuth ? "#0D0D0F" : theme === "dark" ? "#000000" : "#F5F5F7";

  return (
    <ThemeProvider theme={theme} toggleTheme={toggleTheme}>
      <div className="size-full flex items-center justify-center" style={{ background: "#D8D8DC" }}>
        <div
          className="relative flex flex-col overflow-hidden"
          style={{
            width:        "min(390px, 100vw)",
            height:       "min(844px, 100vh)",
            borderRadius: "min(50px, 6vw)",
            background:   containerBg,
            boxShadow:    "0 0 0 1px rgba(0,0,0,0.06), 0 40px 80px rgba(0,0,0,0.32), inset 0 0 0 0.5px rgba(255,255,255,0.1)",
            transition:   "background 0.4s ease",
          }}
        >
        {/* ── Auth Screen ── */}
        {appState === "auth" && (
          <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />
        )}

        {/* ── Onboarding Screen ── */}
        {appState === "onboarding" && (
          <OnboardingScreen user={user} onComplete={handleOnboardingComplete} />
        )}

        {/* ── Main App ── */}
        {appState === "main" && (
          <>
            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: "82px" }}>
              {activeTab === "home"      && <Home      onNavigate={navigate}  openSheet={openSheet} user={user} />}
              {activeTab === "schedule"  && <Schedule  openSheet={openSheet} />}
              {activeTab === "time"      && <Time      openSheet={openSheet} />}
              {activeTab === "documents" && <Documents openSheet={openSheet} />}
              {activeTab === "profile"   && <Profile   user={user} setUser={setUser} onSignOut={() => setAppState("auth")} />}
            </div>

            {/* Tab Bar */}
            <TabBar
              activeTab={activeTab}
              setActiveTab={(tab) => { closeSheet(); setActiveTab(tab); }}
              badges={{ home: 2 }}
            />

            {/* Global Sheet Layer */}
            {sheet && (
              <div style={{ position: "absolute", inset: 0, zIndex: 200 }}>
                {sheet.kind === "availability" && (
                  <AvailabilitySheet dayName={sheet.dayName} dateFull={sheet.dateFull} currentAvail={sheet.current}
                    onSave={(a) => { sheet.onSave(a); closeSheet(); }} onDismiss={closeSheet} />
                )}
                {sheet.kind === "shiftDetail" && (
                  <ShiftDetailSheet shift={sheet.shift} onDismiss={closeSheet} openSheet={openSheet} onNavigate={(tab) => { closeSheet(); setActiveTab(tab); }} />
                )}
                {sheet.kind === "request" && <RequestSheet onDismiss={closeSheet} />}
                {sheet.kind === "notifications" && <NotificationsSheet onDismiss={closeSheet} />}
                {sheet.kind === "clockout" && (
                  <ClockOutSheet summary={sheet.summary} onConfirm={sheet.onConfirm} onDismiss={closeSheet} />
                )}
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </ThemeProvider>
  );
}
