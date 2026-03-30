import { useState } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Badge from "./Badge";
import { stockAPI } from "../services/api";

function Stock({ stock, setStock }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ sku: "", name: "", category: "", quantity: "", unitPrice: "", reorderLevel: "", supplier: "" });
  const [restockModal, setRestockModal] = useState(null);
  const [restockQty, setRestockQty] = useState("");

  const filtered = stock.filter(i => [i.name, i.sku, i.category].some(v => v.toLowerCase().includes(search.toLowerCase())));
  const openAdd = () => { setEditing(null); setForm({ sku: "", name: "", category: "", quantity: "", unitPrice: "", reorderLevel: "", supplier: "" }); setShowModal(true); };
  const openEdit = item => { setEditing(item.id); setForm({ ...item, quantity: String(item.quantity), unitPrice: String(item.unitPrice), reorderLevel: String(item.reorderLevel) }); setShowModal(true); };
  const saveItem = async () => {
    if (!form.sku || !form.name) return;
    const parsed = { ...form, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice), reorderLevel: Number(form.reorderLevel) };
    try {
      if (editing) {
        const res = await stockAPI.update(editing, parsed);
        setStock(stock.map(i => i.id === editing ? { ...res.data, id: res.data._id } : i));
      } else {
        const res = await stockAPI.create(parsed);
        setStock([...stock, { ...res.data, id: res.data._id }]);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error saving stock:", error);
    }
  };
  const deleteItem = async (id) => {
    try {
      await stockAPI.delete(id);
      setStock(stock.filter(i => i.id !== id));
    } catch (error) {
      console.error("Error deleting stock:", error);
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

  const fields = [["sku","SKU",""],["name","Product Name","col-span-2"],["category","Category",""],["supplier","Supplier",""],["quantity","Quantity",""],["unitPrice","Unit Price (₹)",""],["reorderLevel","Reorder Level",""]];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-black" style={{ color: "var(--text)" }}>Stock Management</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text3)" }}>{stock.length} items in inventory</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors">+ Add Item</button>
      </div>
      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SKU, name, category…" />

      <div className="rounded-2xl border overflow-hidden theme-transition" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["SKU", "Product", "Stock", "Unit Price", "Status", "Buy Needed", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--text3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isLow = item.quantity <= item.reorderLevel;
                const need = Math.max(0, item.reorderLevel - item.quantity);
                return (
                  <tr key={item.id} className="transition-colors" style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--hover)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td className="px-4 py-3 font-mono text-xs text-blue-500">{item.sku}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold" style={{ color: "var(--text)" }}>{item.name}</p>
                      <p className="text-xs" style={{ color: "var(--text3)" }}>{item.category} · {item.supplier}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={"font-bold text-lg " + (isLow ? "text-amber-500" : "")} style={!isLow ? { color: "var(--text)" } : {}}>{item.quantity}</span>
                      <p className="text-xs" style={{ color: "var(--text3)" }}>Reorder at {item.reorderLevel}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--text2)" }}>₹{item.unitPrice}</td>
                    <td className="px-4 py-3"><Badge type={isLow ? "Low" : "OK"} /></td>
                    <td className="px-4 py-3">
                      {isLow && need > 0
                        ? <div><p className="text-xs text-rose-500 font-bold">Buy {need} units</p><p className="text-xs text-rose-400/70">₹{(need * item.unitPrice).toLocaleString()}</p></div>
                        : <span className="text-xs" style={{ color: "var(--text3)" }}>—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 whitespace-nowrap">
                        <button onClick={() => { setRestockModal(item); setRestockQty(""); }} className="text-xs text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg hover:bg-emerald-500/20 transition-colors">+Stock</button>
                        <button onClick={() => openEdit(item)} className="text-xs text-blue-500 font-semibold hover:opacity-70">Edit</button>
                        <button onClick={() => deleteItem(item.id)} className="text-xs text-rose-500 font-semibold hover:opacity-70">Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Stock Item" : "Add Stock Item"} onClose={() => setShowModal(false)}>
          <div className="grid grid-cols-2 gap-3">
            {fields.map(([key, label, span]) => (
              <div key={key} className={span}>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--text3)" }}>{label}</label>
                <Input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-end mt-5">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm" style={{ color: "var(--text3)" }}>Cancel</button>
            <button onClick={saveItem} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors">Save</button>
          </div>
        </Modal>
      )}

      {restockModal && (
        <Modal title={"Restock: " + restockModal.name} onClose={() => setRestockModal(null)}>
          <div className="space-y-4">
            <div className="rounded-xl p-3 grid grid-cols-2 gap-2 text-sm" style={{ background: "var(--card2)", border: "1px solid var(--border)" }}>
              {[["Current Stock", restockModal.quantity, "var(--text)"],["Unit Price","₹"+restockModal.unitPrice,"var(--text)"],["Reorder Level",restockModal.reorderLevel,"#f59e0b"],["Need to Buy",Math.max(0,restockModal.reorderLevel-restockModal.quantity),"#f43f5e"]].map(([l,v,c]) => (
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

export default Stock;