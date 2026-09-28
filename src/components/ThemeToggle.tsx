import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button type="button" onClick={toggleTheme}
    className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl border border-current/20 bg-transparent hover:bg-current/10 transition-colors duration-150"
    aria-label="Mode sombre" aria-pressed={theme === "dark"}
    title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}>
    {theme === "dark" ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
  </button>;
}
