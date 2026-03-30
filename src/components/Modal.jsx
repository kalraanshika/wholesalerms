function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 border theme-transition"
        style={{ background: "var(--modal)", borderColor: "var(--border2)", boxShadow: "var(--shadow)" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black" style={{ color: "var(--text)" }}>{title}</h3>
          <button onClick={onClose} className="text-xl transition-colors hover:opacity-80" style={{ color: "var(--text3)" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;