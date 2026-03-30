import { useState, useMemo } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Select from "./Select";
import Badge from "./Badge";
import { saleAPI, stockAPI } from "../services/api";

function isOverdue(sale) {
  return sale.paymentStatus === "Unpaid" && new Date(sale.dueDate) < new Date();
}

function Sales({ stock, setStock, retailers, sales, setSales }) {
  const [showModal, setShowModal] = useState(false);
  const [saleRetailer, setSaleRetailer] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [saleDue, setSaleDue] = useState("");
  const [saleItems, setSaleItems] = useState([{ stockId: "", qty: "" }]);
  const [saleError, setSaleError] = useState("");
  const [restockModal, setRestockModal] = useState(null);
  const [restockQty, setRestockQty] = useState("");

  const addRow = () => setSaleItems([...saleItems, { stockId: "", qty: "" }]);
  const removeRow = i => setSaleItems(saleItems.filter((_, idx) => idx !== i));
  const updateRow = (i, k, v) => { const u = [...saleItems]; u[i] = { ...u[i], [k]: v }; setSaleItems(u); };

  const shortfalls = useMemo(() => {
    const needed = {};
    saleItems.forEach(r => { if (r.stockId && r.qty) needed[r.stockId] = (needed[r.stockId] || 0) + Number(r.qty); });
    return Object.entries(needed).map(([sid, qty]) => {
      const item = stock.find(s => s.id === Number(sid));
      if (!item) return null;
      const short = qty - item.quantity;
      return short > 0 ? { item, short, cost: short * item.unitPrice } : null;
    }).filter(Boolean);
  }, [saleItems, stock]);

  const saleTotal = saleItems.reduce((sum, r) => {
    const item = stock.find(s => s.id === Number(r.stockId));
    return sum + (item ? item.unitPrice * Number(r.qty || 0) : 0);
  }, 0);

  const confirmSale = async () => {
    setSaleError("");
    if (!saleRetailer) return setSaleError("Select a retailer.");
    if (!saleDue) return setSaleError("Set a due date.");
    if (saleItems.some(r => !r.stockId || !r.qty || Number(r.qty) <= 0)) return setSaleError("Fill all item rows.");
    if (shortfalls.length > 0) return setSaleError("Resolve stock shortfalls before confirming.");
    
    try {
      // Update stock quantities
      for (const r of saleItems) {
        const item = stock.find(s => s.id === Number(r.stockId));
        if (item) {
          const newQty = item.quantity - Number(r.qty);
          await stockAPI.update(item.id, { ...item, quantity: newQty });
          setStock(stock.map(s => s.id === item.id ? { ...s, quantity: newQty } : s));
        }
      }
      
      // Create sale
      const saleData = {
        retailerId: Number(saleRetailer),
        date: saleDate,
        items: saleItems.map(r => {
          const item = stock.find(s => s.id === Number(r.stockId));
          return { stockId: Number(r.stockId), name: item.name, qty: Number(r.qty), unitPrice: item.unitPrice };
        }),
        total: saleTotal,
        paymentStatus: "Unpaid",
        dueDate: saleDue
      };
      const res = await saleAPI.create(saleData);
      setSales([{ ...res.data, id: res.data._id }, ...sales]);
      
      setShowModal(false); setSaleItems([{ stockId: "", qty: "" }]); setSaleRetailer(""); setSaleDue("");
    } catch (error) {
      console.error("Error creating sale:", error);
      setSaleError("Failed to create sale.");
    }
  };

  const markPaid = async (id) => {
    try {
      const res = await saleAPI.update(id, { paymentStatus: "Paid", paidDate: new Date().toISOString().slice(0, 10) });
      setSales(sales.map(s => s.id === id ? { ...res.data, id: res.data._id } : s));
    } catch (error) {
      console.error("Error marking paid:", error);
    }
  };

  const doRestock = async () => {
    const qty = Number(restockQty);
    if (!qty || qty <= 0) return;
    const newQty = restockModal.quantity + qty;
    try {
      await stockAPI.update(restockModal.id, { ...restockModal, quantity: newQty });
      setStock(stock.map(s => s.id === restockModal.id ? { ...s, quantity: newQty } : s));
      setRestockModal(null); setRestockQty("");
    } catch (error) {
      console.error("Error restocking:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-black" style={{ color: "var(--text)" }}>Sales</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text3)" }}>Sell to retailers — stock auto-deducted on confirm</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors">+ New Sale</button>
      </div>

      <div className="space-y-3">
        {sales.length === 0 && <p className="text-sm text-center py-10" style={{ color: "var(--text3)" }}>No sales yet.</p>}
        {sales.map(sale => {
          const ret = retailers.find(r => r.id === sale.retailerId);
          const overdue = isOverdue(sale);
          const statusKey = overdue ? "Overdue" : sale.paymentStatus;
          return (
            <div key={sale.id} className="rounded-2xl border p-5 transition-all theme-transition"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-bold" style={{ color: "var(--text)" }}>{ret ? ret.name : "Unknown"}</p>
                  <p className="text-xs" style={{ color: "var(--text3)" }}>Sold {sale.date} · Due {sale.dueDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge type={statusKey} />
                  <p className="text-lg font-black" style={{ color: "var(--text)" }}>₹{sale.total.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {sale.items.map((it, i) => (
                  <span key={i} className="text-xs rounded-lg px-2.5 py-1 border" style={{ background: "var(--card2)", borderColor: "var(--border)", color: "var(--text2)" }}>
                    {it.name} × {it.qty} = ₹{(it.qty * it.unitPrice).toLocaleString()}
                  </span>
                ))}
              </div>
              {sale.paymentStatus === "Unpaid" && (
                <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                  {overdue && <p className="text-xs text-rose-500 font-semibold">⏰ Overdue by {Math.floor((new Date() - new Date(sale.dueDate)) / 86400000)} days</p>}
                  <button onClick={() => markPaid(sale.id)} className="ml-auto text-xs bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                    ✓ Mark Paid
                  </button>
                </div>
              )}
              {sale.paymentStatus === "Paid" && sale.paidDate && <p className="mt-2 text-xs text-emerald-600">✓ Paid on {sale.paidDate}</p>}
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal title="Record New Sale" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--text3)" }}>Retailer</label>
                <Select value={saleRetailer} onChange={e => setSaleRetailer(e.target.value)}>
                  <option value="">-- Select Retailer --</option>
                  {retailers.filter(r => r.status === "Active").map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--text3)" }}>Sale Date</label>
                <Input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--text3)" }}>Due Date</label>
                <Input type="date" value={saleDue} onChange={e => setSaleDue(e.target.value)} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text3)" }}>Products</label>
                <button onClick={addRow} className="text-xs text-blue-500 font-semibold hover:opacity-70">+ Add Row</button>
              </div>
              <div className="space-y-2">
                {saleItems.map((row, i) => {
                  const item = stock.find(s => s.id === Number(row.stockId));
                  const rowTotal = item ? item.unitPrice * Number(row.qty || 0) : 0;
                  const short = item && row.qty ? Math.max(0, Number(row.qty) - item.quantity) : 0;
                  return (
                    <div key={i} className="rounded-xl border p-3 space-y-2" style={{ background: "var(--card2)", borderColor: "var(--border)" }}>
                      <div className="flex gap-2">
                        <Select value={row.stockId} onChange={e => updateRow(i, "stockId", e.target.value)} className="flex-1">
                          <option value="">-- Product --</option>
                          {stock.map(s => <option key={s.id} value={s.id}>{s.name} (Stock: {s.quantity})</option>)}
                        </Select>
                        <input type="number" min="1" placeholder="Qty" value={row.qty} onChange={e => updateRow(i, "qty", e.target.value)}
                          className="w-20 rounded-lg px-2.5 py-2 text-sm border text-center focus:outline-none transition-colors"
                          style={{ background: "var(--input-bg)", borderColor: "var(--border2)", color: "var(--text)" }} />
                        {saleItems.length > 1 && <button onClick={() => removeRow(i)} className="text-rose-500 hover:opacity-70 text-xs px-1">✕</button>}
                      </div>
                      {item && (
                        <div className="flex items-center justify-between text-xs">
                          <span className={short > 0 ? "text-rose-500 font-semibold" : ""} style={short === 0 ? { color: "var(--text3)" } : {}}>
                            {short > 0 ? `⚠ Short by ${short} — need to buy (₹${(short * item.unitPrice).toLocaleString()})` : `Available: ${item.quantity}`}
                          </span>
                          <span style={{ color: "var(--text3)" }}>₹{item.unitPrice} ea · ₹{rowTotal.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {shortfalls.length > 0 && (
              <div className="rounded-xl p-3 space-y-1 bg-rose-500/10 border border-rose-500/20">
                <p className="text-xs font-bold text-rose-500 mb-2">🛒 Restock required before this sale:</p>
                {shortfalls.map((sf, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-rose-500">{sf.item.name} — buy <strong>{sf.short}</strong></span>
                    <span className="text-rose-500 font-bold">₹{sf.cost.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-rose-500/20 mt-1 pt-1 text-xs font-bold text-rose-600">
                  <span>Total restock cost</span><span>₹{shortfalls.reduce((a, s) => a + s.cost, 0).toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: "var(--card2)", border: "1px solid var(--border)" }}>
              <span className="text-sm font-semibold" style={{ color: "var(--text2)" }}>Sale Total</span>
              <span className="text-xl font-black" style={{ color: "var(--text)" }}>₹{saleTotal.toLocaleString()}</span>
            </div>

            {saleError && <p className="text-xs text-rose-500 font-semibold bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{saleError}</p>}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm transition-colors" style={{ color: "var(--text3)" }}>Cancel</button>
              <button onClick={confirmSale} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors">Confirm Sale</button>
            </div>
          </div>
        </Modal>
      )}

      {restockModal && (
        <Modal title={"Restock: " + restockModal.name} onClose={() => setRestockModal(null)}>
          <div className="space-y-4">
            <div className="rounded-xl p-3 grid grid-cols-2 gap-2 text-sm" style={{ background: "var(--card2)", border: "1px solid var(--border)" }}>
              {[["Current Stock", restockModal.quantity, "var(--text)"], ["Unit Price", "₹" + restockModal.unitPrice, "var(--text)"], ["Reorder Level", restockModal.reorderLevel, "#f59e0b"], ["Need to Buy", Math.max(0, restockModal.reorderLevel - restockModal.quantity), "#f43f5e"]].map(([l, v, c]) => (
                <div key={l}><p className="text-xs mb-0.5" style={{ color: "var(--text3)" }}>{l}</p><p className="font-bold text-lg" style={{ color: c }}>{v}</p></div>
              ))}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--text3)" }}>Quantity to Add</label>
              <Input type="number" value={restockQty} onChange={e => setRestockQty(e.target.value)} placeholder="e.g. 20" />
            </div>
            {Number(restockQty) > 0 && (
              <div className="rounded-xl p-3 space-y-2 text-sm bg-blue-500/10 border border-blue-500/20">
                {[["Adding", "+" + restockQty + " units"], ["New Total", (restockModal.quantity + Number(restockQty)) + " units"]].map(([l, v]) => (
                  <div key={l} className="flex justify-between"><span className="text-blue-500">{l}</span><span className="font-bold" style={{ color: "var(--text)" }}>{v}</span></div>
                ))}
                <div className="flex justify-between border-t border-blue-500/20 pt-2">
                  <span className="text-blue-500 font-bold">Total Cost to Pay</span>
                  <span className="text-blue-500 font-black text-xl">₹{(Number(restockQty) * restockModal.unitPrice).toLocaleString()}</span>
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRestockModal(null)} className="px-4 py-2 text-sm" style={{ color: "var(--text3)" }}>Cancel</button>
              <button onClick={doRestock} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors">Add Stock</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Sales;