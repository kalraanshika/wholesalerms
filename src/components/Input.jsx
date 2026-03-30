function Input({ value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      className={"w-full rounded-xl px-3 py-2.5 text-sm border focus:outline-none transition-colors " + className}
      style={{ background: "var(--input-bg)", borderColor: "var(--border2)", color: "var(--text)" }} />
  );
}

export default Input;