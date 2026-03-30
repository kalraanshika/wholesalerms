function Select({ value, onChange, children, className = "" }) {
  return (
    <select value={value} onChange={onChange}
      className={"w-full rounded-xl px-3 py-2.5 text-sm border focus:outline-none transition-colors " + className}
      style={{ background: "var(--input-bg)", borderColor: "var(--border2)", color: "var(--text)" }}>
      {children}
    </select>
  );
}

export default Select;