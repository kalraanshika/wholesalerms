import { useState } from "react";
import StatCard from "./StatCard";
import Badge from "./Badge";
import { saleAPI } from "../services/api";

function isOverdue(sale) {
  return sale.paymentStatus === "Unpaid" && new Date(sale.dueDate) < new Date();
}

function Payments({ sales, setSales, retailers }) {
  const [filter, setFilter] = useState("All");

  const filtered = sales.filter(s => {
    if (filter === "Paid") return s.paymentStatus === "Paid";
    if (filter === "Unpaid") return s.paymentStatus === "Unpaid" && !isOverdue(s);
    if (filter === "Overdue") return isOverdue(s);
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPaid    = sales.filter(s => s.paymentStatus === "Paid").reduce((a, s) => a + s.total, 0);
  const totalUnpaid  = sales.filter(s => s.paymentStatus === "Unpaid").reduce((a, s) => a + s.total, 0);
  const totalOverdue = sales.filter(s => isOverdue(s)).reduce((a, s) => a + s.total, 0);
  const markPaid = async (id) => {
    try {
      const res = await saleAPI.update(id, { paymentStatus: "Paid", paidDate: new Date().toISOString().slice(0, 10) });
      setSales(sales.map(s => s.id === id ? { ...res.data, id: res.data._id } : s));
    } catch (error) {
      console.error("Error marking paid:", error);
    }
  };

  const counts = { All: sales.length, Paid: sales.filter(s => s.paymentStatus === "Paid").length, Unpaid: sales.filter(s => s.paymentStatus === "Unpaid" && !isOverdue(s)).length, Overdue: sales.filter(s => isOverdue(s)).length };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black" style={{ color: "var(--text)" }}>Payment Tracker</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--text3)" }}>Track paid, unpaid, and overdue bills with due dates</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Paid"  value={"₹" + totalPaid.toLocaleString()}    sub="Collected"       accent="#34d399" />
        <StatCard label="Unpaid"      value={"₹" + totalUnpaid.toLocaleString()}   sub="Pending"         accent="#fb923c" />
        <StatCard label="Overdue"     value={"₹" + totalOverdue.toLocaleString()}  sub="Past due date"   accent="#f87171" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {["All", "Unpaid", "Overdue", "Paid"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={"px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors border " + (filter === f ? "bg-blue-600 text-white border-blue-600" : "border-[var(--border2)]")}
            style={filter !== f ? { background: "var(--card2)", color: "var(--text2)" } : {}}>
            {f} <span className="opacity-50 text-xs ml-1">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border overflow-hidden theme-transition" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Retailer", "Sale Date", "Items Sold", "Amount", "Status", "Due Date", "Paid On", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--text3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(sale => {
                const ret = retailers.find(r => r.id === sale.retailerId);
                const overdue = isOverdue(sale);
                const daysOver = overdue ? Math.floor((new Date() - new Date(sale.dueDate)) / 86400000) : 0;
                const daysLeft = !overdue && sale.paymentStatus === "Unpaid" ? Math.ceil((new Date(sale.dueDate) - new Date()) / 86400000) : 0;
                return (
                  <tr key={sale.id} style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--hover)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: "var(--text)" }}>{ret ? ret.name : "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text2)" }}>{sale.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {sale.items.map((it, i) => (
                          <span key={i} className="text-xs rounded px-1.5 py-0.5 whitespace-nowrap border" style={{ background: "var(--card2)", borderColor: "var(--border)", color: "var(--text2)" }}>{it.name}×{it.qty}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold whitespace-nowrap" style={{ color: "var(--text)" }}>₹{sale.total.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge type={overdue ? "Overdue" : sale.paymentStatus} />
                      {overdue   && <p className="text-xs text-orange-500 mt-0.5">{daysOver}d late</p>}
                      {daysLeft > 0 && <p className="text-xs text-amber-500 mt-0.5">{daysLeft}d left</p>}
                    </td>
                    <td className={"px-4 py-3 whitespace-nowrap font-semibold " + (overdue ? "text-rose-500" : "")} style={!overdue ? { color: "var(--text2)" } : {}}>{sale.dueDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-emerald-600">{sale.paidDate || "—"}</td>
                    <td className="px-4 py-3">
                      {sale.paymentStatus === "Unpaid"
                        ? <button onClick={() => markPaid(sale.id)} className="text-xs bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 border border-emerald-500/30 px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors">Mark Paid</button>
                        : <span className="text-xs text-emerald-600">✓ Done</span>}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm" style={{ color: "var(--text3)" }}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Payments;
