import StatCard from "./StatCard";
import { useContext } from "react";
import { ThemeCtx } from "../App";

function isOverdue(sale) {
  return sale.paymentStatus === "Unpaid" && new Date(sale.dueDate) < new Date();
}

function Dashboard({ stock, retailers, sales }) {
  const totalStockValue = stock.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const lowStock = stock.filter(i => i.quantity <= i.reorderLevel);
  const unpaidSales = sales.filter(s => s.paymentStatus === "Unpaid");
  const overdueSales = sales.filter(s => isOverdue(s));
  const totalUnpaid = unpaidSales.reduce((a, s) => a + s.total, 0);
  const totalPaid = sales.filter(s => s.paymentStatus === "Paid").reduce((a, s) => a + s.total, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black" style={{ color: "var(--text)" }}>Overview</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--text3)" }}>Your wholesale operations at a glance</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Stock Items"    value={stock.length}                    sub="Active SKUs"        accent="#60a5fa" />
        <StatCard label="Stock Value"    value={"₹" + totalStockValue.toLocaleString()} sub="At cost price"     accent="#34d399" />
        <StatCard label="Unpaid Bills"   value={"₹" + totalUnpaid.toLocaleString()}     sub={unpaidSales.length + " pending"} accent="#fb923c" />
        <StatCard label="Total Collected" value={"₹" + totalPaid.toLocaleString()}      sub="Paid invoices"    accent="#a78bfa" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="rounded-2xl border overflow-hidden theme-transition" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="text-sm font-bold" style={{ color: "var(--text2)" }}>⚠ Low Stock Alerts</span>
            <span className="text-xs" style={{ color: "var(--text3)" }}>{lowStock.length} items</span>
          </div>
          {lowStock.length === 0
            ? <p className="px-5 py-6 text-sm" style={{ color: "var(--text3)" }}>All stock levels are healthy.</p>
            : lowStock.map(item => {
              const need = Math.max(0, item.reorderLevel - item.quantity);
              return (
                <div key={item.id} className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{item.name}</p>
                    <p className="text-xs" style={{ color: "var(--text3)" }}>{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-500">{item.quantity} left</p>
                    {need > 0 && <p className="text-xs text-rose-500">Buy {need} · ₹{(need * item.unitPrice).toLocaleString()}</p>}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Overdue Payments */}
        <div className="rounded-2xl border overflow-hidden theme-transition" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="text-sm font-bold" style={{ color: "var(--text2)" }}>🔴 Overdue Payments</span>
            <span className="text-xs" style={{ color: "var(--text3)" }}>{overdueSales.length} bills</span>
          </div>
          {overdueSales.length === 0
            ? <p className="px-5 py-6 text-sm" style={{ color: "var(--text3)" }}>No overdue payments.</p>
            : overdueSales.map(sale => {
              const ret = retailers.find(r => r.id === sale.retailerId);
              const daysOver = Math.floor((new Date() - new Date(sale.dueDate)) / 86400000);
              return (
                <div key={sale.id} className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{ret ? ret.name : "Unknown"}</p>
                    <p className="text-xs text-rose-500">{daysOver} days overdue</p>
                  </div>
                  <p className="text-sm font-bold text-rose-500">₹{sale.total.toLocaleString()}</p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;