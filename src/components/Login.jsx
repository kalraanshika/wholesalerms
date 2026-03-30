import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Login({ onClose }) {
  const { login, register } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const success = isRegister
        ? await register(form.name, form.email, form.password)
        : await login(form.email, form.password);
      if (success) {
        onClose();
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-2xl border p-6 theme-transition" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg font-black">B</div>
            <div>
              <p className="text-sm font-black" style={{ color: "var(--text)" }}>Bharat</p>
              <p className="text-xs" style={{ color: "var(--text3)" }}>Wholesale Portal</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: "var(--text3)" }}>✕</button>
        </div>

        <h2 className="text-xl font-black mb-1" style={{ color: "var(--text)" }}>
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text3)" }}>
          {isRegister ? "Register to manage your wholesale business" : "Sign in to your account"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--text3)" }}>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border text-sm theme-transition"
                style={{ background: "var(--input-bg)", borderColor: "var(--border)", color: "var(--text)" }}
                required
              />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--text3)" }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border text-sm theme-transition"
              style={{ background: "var(--input-bg)", borderColor: "var(--border)", color: "var(--text)" }}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--text3)" }}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border text-sm theme-transition"
              style={{ background: "var(--input-bg)", borderColor: "var(--border)", color: "var(--text)" }}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-center mt-4" style={{ color: "var(--text3)" }}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            className="font-bold text-blue-500 hover:underline"
          >
            {isRegister ? "Sign In" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
