import { createContext, useContext, ReactNode } from "react";

export type Theme = "light" | "dark";

export interface ThemeColors {
  accent: string;
  bg: string;
  card: string;
  text1: string;
  text2: string;
  text3: string;
  sep: string;
  green: string;
  red: string;
  amber: string;
  shadow: string;
}

const lightTheme: ThemeColors = {
  accent: "#007AFF",
  bg: "#FFFFFF",
  card: "#F2F2F7",
  text1: "#1C1C1E",
  text2: "#6C6C70",
  text3: "#AEAEB2",
  sep: "#E5E5EA",
  green: "#34C759",
  red: "#FF3B30",
  amber: "#FF9F0A",
  shadow: "none",
};

const darkTheme: ThemeColors = {
  accent: "#0A84FF",
  bg: "#000000",
  card: "#1C1C1E",
  text1: "#FFFFFF",
  text2: "#ABABAB",
  text3: "#6C6C70",
  sep: "#38383A",
  green: "#30D158",
  red: "#FF453A",
  amber: "#FFD60A",
  shadow: "none",
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ theme, toggleTheme, children }: { theme: Theme; toggleTheme: () => void; children: ReactNode }) {
  const colors = theme === "light" ? lightTheme : darkTheme;
  return <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
