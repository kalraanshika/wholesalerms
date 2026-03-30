function StatCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-2xl p-5 border flex flex-col gap-1 theme-transition"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>{label}</span>
      <span className="text-3xl font-black mt-1" style={{ color: "var(--text)" }}>{value}</span>
      {sub && <span className="text-xs mt-1" style={{ color: "var(--text3)" }}>{sub}</span>}
    </div>
  );
}
export default StatCard;