import { useState, useEffect, useContext, createContext } from "react";
import Dashboard from "./components/Dashboard";
import Sales from "./components/Sales";
import Stock from "./components/Stock";
import Retailers from "./components/Retailers";
import Payments from "./components/Payments";
import Account from "./components/Account";
import ThemeToggle from "./components/ThemeToggle";
import Badge from "./components/Badge";
import Login from "./components/Login";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { stockAPI, retailerAPI, saleAPI } from "./services/api";

const ThemeCtx = createContext({ dark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);

const initialStock = [];
const initialRetailers = [];
const initialSales = [];

const TABS = ["Dashboard", "Sales", "Stock", "Retailers", "Payments", "Account"];
const ICONS = { Dashboard: "◈", Sales: "⚡", Stock: "⬡", Retailers: "◉", Payments: "₹", Account: "⊙" };

function isOverdue(sale) {
  return sale.paymentStatus === "Unpaid" && new Date(sale.dueDate) < new Date();
}

const DARK_CSS = `
  :root {
    --bg:          #07090f;
    --bg2:         #0c1018;
    --sidebar:     #090c13;
    --card:        #0f1420;
    --card2:       #111828;
    --modal:       #0c1118;
    --border:      rgba(255,255,255,0.06);
    --border2:     rgba(255,255,255,0.10);
    --text:        #f0f4ff;
    --text2:       rgba(200,210,235,0.55);
    --text3:       rgba(180,195,225,0.30);
    --input-bg:    #080d18;
    --hover:       rgba(255,255,255,0.025);
    --badge-ok-bg: rgba(52,211,153,0.12);
    --badge-ok-tx: #6ee7b7;
    --badge-ok-br: rgba(52,211,153,0.25);
    --shadow:      0 8px 32px rgba(0,0,0,0.5);
    --accent:      #3b82f6;
  }
`;

const LIGHT_CSS = `
  :root {
    --bg:          #f0f4fb;
    --bg2:         #e8edf7;
    --sidebar:     #ffffff;
    --card:        #ffffff;
    --card2:       #f5f8ff;
    --modal:       #ffffff;
    --border:      rgba(0,0,0,0.07);
    --border2:     rgba(0,0,0,0.12);
    --text:        #0f1523;
    --text2:       rgba(15,21,35,0.55);
    --text3:       rgba(15,21,35,0.30);
    --input-bg:    #f0f4fb;
    --hover:       rgba(0,0,0,0.025);
    --badge-ok-bg: rgba(16,185,129,0.10);
    --badge-ok-tx: #059669;
    --badge-ok-br: rgba(16,185,129,0.25);
    --shadow:      0 4px 24px rgba(0,0,0,0.08);
    --accent:      #2563eb;
  }
`;

const COMMON_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { background: var(--bg); color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
  select option { background: var(--modal); color: var(--text); }
  input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }
  .theme-transition, .theme-transition * { transition: background-color 0.25s ease, border-color 0.25s ease, color 0.18s ease, box-shadow 0.25s ease; }
`;

function AppContent() {
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState("Dashboard");
  const [stock, setStock] = useState(initialStock);
  const [retailers, setRetailers] = useState(initialRetailers);
  const [sales, setSales] = useState(initialSales);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, logout, loading } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("wmsToken");
        if (token) {
          const [stockRes, retailerRes, saleRes] = await Promise.all([
            stockAPI.getAll(),
            retailerAPI.getAll(),
            saleAPI.getAll(),
          ]);
          setStock(stockRes.data);
          setRetailers(retailerRes.data);
          setSales(saleRes.data);
        }
      } catch (err) {
        console.log("Using offline data - backend not connected");
      }
    };
    fetchData();
  }, [user]);

  return (
    <ThemeCtx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      <style>{dark ? DARK_CSS : LIGHT_CSS}{COMMON_CSS}</style>
      <div className="theme-transition" style={{ background: "var(--bg)", minHeight: "100vh" }}>

        <div className="flex">
          <aside className="hidden md:flex flex-col w-64 min-h-screen fixed top-0 left-0 bottom-0 z-30 theme-transition"
            style={{ background: "var(--sidebar)", borderRight: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
            <div className="p-6" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg font-black shadow-lg">B</div>
                <div>
                  <p className="text-sm font-black leading-tight" style={{ color: "var(--text)" }}>Bharat</p>
                  <p className="text-xs" style={{ color: "var(--text3)" }}>Wholesale Portal</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {TABS.map(t => {
                const active = tab === t;
                return (
                  <button key={t} onClick={() => setTab(t)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left"
                    style={{
                      background: active ? (dark ? "rgba(59,130,246,0.15)" : "rgba(37,99,235,0.08)") : "transparent",
                      color: active ? "var(--accent)" : "var(--text3)",
                      border: active ? ("1px solid " + (dark ? "rgba(59,130,246,0.25)" : "rgba(37,99,235,0.15)")) : "1px solid transparent",
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "var(--hover)"; e.currentTarget.style.color = "var(--text2)"; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text3)"; } }}>
                    <span className="text-base">{ICONS[t]}</span>{t}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
              <ThemeToggle />
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-xs font-black text-white">
                      {user.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--text)" }}>{user.name}</p>
                      <p className="text-xs" style={{ color: "var(--text3)" }}>{user.role}</p>
                    </div>
                  </div>
                  <button onClick={logout} className="text-xs px-2 py-1 rounded-lg hover:bg-red-500/20 text-red-500">Logout</button>
                </div>
              ) : (
                <button onClick={() => setShowLogin(true)} className="w-full py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500">
                  Login / Register
                </button>
              )}
            </div>
          </aside>

          <div className="md:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between theme-transition"
            style={{ background: "var(--sidebar)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm text-white">B</div>
              <span className="font-black text-sm" style={{ color: "var(--text)" }}>Bharat Wholesale</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={() => setMobileOpen(!mobileOpen)} className="text-xl p-1" style={{ color: "var(--text2)" }}>☰</button>
            </div>
          </div>

          {mobileOpen && (
            <div className="md:hidden fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }} onClick={() => setMobileOpen(false)}>
              <div className="absolute top-0 left-0 bottom-0 w-64 p-4 theme-transition" style={{ background: "var(--sidebar)", borderRight: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
                <div className="mb-6 mt-2 flex items-center justify-between">
                  <span className="font-black" style={{ color: "var(--text)" }}>Menu</span>
                  <button onClick={() => setMobileOpen(false)} style={{ color: "var(--text3)" }}>✕</button>
                </div>
                {TABS.map(t => (
                  <button key={t} onClick={() => { setTab(t); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold mb-1 transition-all text-left"
                    style={{ background: tab === t ? "rgba(59,130,246,0.12)" : "transparent", color: tab === t ? "var(--accent)" : "var(--text3)" }}>
                    <span>{ICONS[t]}</span>{t}
                  </button>
                ))}
                {!user && (
                  <button onClick={() => { setShowLogin(true); setMobileOpen(false); }}
                    className="w-full mt-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold">
                    Login / Register
                  </button>
                )}
              </div>
            </div>
          )}
          <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 min-h-screen theme-transition" style={{ background: "var(--bg)" }}>
            <div className="max-w-6xl mx-auto">
              {tab === "Dashboard"  && <Dashboard  stock={stock} retailers={retailers} sales={sales} />}
              {tab === "Sales"      && <Sales       stock={stock} setStock={setStock} retailers={retailers} sales={sales} setSales={setSales} />}
              {tab === "Stock"      && <Stock       stock={stock} setStock={setStock} />}
              {tab === "Retailers"  && <Retailers   retailers={retailers} setRetailers={setRetailers} sales={sales} />}
              {tab === "Payments"   && <Payments    sales={sales} setSales={setSales} retailers={retailers} />}
              {tab === "Account"    && <Account />}
            </div>
          </main>
        </div>
      </div>
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </ThemeCtx.Provider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export { useTheme, ThemeCtx };
export default App;
