import { useTheme } from "../App";

function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle}
      className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all hover:opacity-80"
      style={{ background: "var(--card2)", borderColor: "var(--border2)", color: "var(--text2)" }}
      title={dark ? "Switch to Day Mode" : "Switch to Night Mode"}>
      <span className="text-base">{dark ? "☀️" : "🌙"}</span>
      <span className="hidden md:inline">{dark ? "Day" : "Night"}</span>
    </button>
  );
}

export default ThemeToggle;