import { useState } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Select from "./Select";
import Badge from "./Badge";
import { retailerAPI } from "../services/api";

function isOverdue(sale) {
  return sale.paymentStatus === "Unpaid" && new Date(sale.dueDate) < new Date();
}

function Retailers({ retailers, setRetailers, sales }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", contact: "", phone: "", email: "", city: "", status: "Active", creditLimit: "", balance: "" });

  const filtered = retailers.filter(r => [r.name, r.city].some(v => v.toLowerCase().includes(search.toLowerCase())));
  const openAdd = () => { setEditing(null); setForm({ name: "", contact: "", phone: "", email: "", city: "", status: "Active", creditLimit: "", balance: "" }); setShowModal(true); };
  const openEdit = r => { setEditing(r.id); setForm({ ...r, creditLimit: String(r.creditLimit), balance: String(r.balance) }); setShowModal(true); };
  const save = async () => {
    if (!form.name) return;
    const parsed = { ...form, creditLimit: Number(form.creditLimit), balance: Number(form.balance) };
    try {
      if (editing) {
        const res = await retailerAPI.update(editing, parsed);
        setRetailers(retailers.map(r => r.id === editing ? { ...res.data, id: res.data._id } : r));
      } else {
        const res = await retailerAPI.create(parsed);
        setRetailers([...retailers, { ...res.data, id: res.data._id }]);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error saving retailer:", error);
    }
  };
  const deleteRetailer = async (id) => {
    try {
      await retailerAPI.delete(id);
      setRetailers(retailers.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting retailer:", error);
    }
  };

  const fields = [["name","Business Name","col-span-2"],["contact","Contact Person",""],["city","City",""],["phone","Phone",""],["email","Email","col-span-2"],["creditLimit","Credit Limit (₹)",""],["balance","Outstanding (₹)",""]];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-black" style={{ color: "var(--text)" }}>Retailers</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text3)" }}>{retailers.length} registered</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-colors">+ Add Retailer</button>
      </div>
      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or city…" />

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(r => {
          const util = r.creditLimit ? Math.round((r.balance / r.creditLimit) * 100) : 0;
          const rSales = sales.filter(s => s.retailerId === r.id);
          const unpaid = rSales.filter(s => s.paymentStatus === "Unpaid").reduce((a, s) => a + s.total, 0);
          const overdue = rSales.filter(s => isOverdue(s)).length;
          const nextDue = rSales.filter(s => s.paymentStatus === "Unpaid").sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
          return (
            <div key={r.id} className="rounded-2xl border p-5 space-y-3 transition-all theme-transition"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold" style={{ color: "var(--text)" }}>{r.name}</p>
                  <p className="text-xs" style={{ color: "var(--text3)" }}>{r.contact} · {r.city}</p>
                </div>
                <Badge type={r.status} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[["Credit Limit","₹"+r.creditLimit.toLocaleString(),"var(--text)"],["Unpaid Bills","₹"+unpaid.toLocaleString(),unpaid>0?"#f43f5e":"#10b981"],["Overdue",overdue+" bills",overdue>0?"#f97316":"var(--text3)"]].map(([l,v,c])=>(
                  <div key={l} className="rounded-xl p-2" style={{ background: "var(--card2)", border: "1px solid var(--border)" }}>
                    <p className="mb-0.5" style={{ color: "var(--text3)" }}>{l}</p>
                    <p className="font-bold" style={{ color: c }}>{v}</p>
                  </div>
                ))}
              </div>
              {nextDue && (
                <div className={"flex items-center justify-between text-xs rounded-lg px-3 py-2 " + (isOverdue(nextDue) ? "bg-rose-500/10 border border-rose-500/20" : "bg-amber-500/10 border border-amber-500/20")}>
                  <span className={isOverdue(nextDue) ? "text-rose-500" : "text-amber-600"}>{isOverdue(nextDue) ? "⏰ Overdue since" : "📅 Next due"}</span>
                  <span className={"font-bold " + (isOverdue(nextDue) ? "text-rose-500" : "text-amber-600")}>{nextDue.dueDate}</span>
                </div>
              )}
              <div>
                <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text3)" }}><span>Credit Used</span><span>{util}%</span></div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border2)" }}>
                  <div className={"h-full rounded-full " + (util > 80 ? "bg-rose-500" : util > 50 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: Math.min(util, 100) + "%" }} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs" style={{ color: "var(--text3)" }}>{r.phone}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(r)} className="text-xs text-blue-500 font-semibold hover:opacity-70">Edit</button>
                  <button onClick={() => deleteRetailer(r.id)} className="text-xs text-rose-500 font-semibold hover:opacity-70">Remove</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Retailer" : "Add Retailer"} onClose={() => setShowModal(false)}>
          <div className="grid grid-cols-2 gap-3">
            {fields.map(([key, label, span]) => (
              <div key={key} className={span}>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--text3)" }}>{label}</label>
                <Input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--text3)" }}>Status</label>
              <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>Active</option><option>Suspended</option>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-5">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm" style={{ color: "var(--text3)" }}>Cancel</button>
            <button onClick={save} className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-colors">Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Retailers;

