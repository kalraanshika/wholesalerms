function Badge({ type }) {
  const map = {
    Active:    "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30",
    Suspended: "bg-rose-500/15    text-rose-500    border border-rose-500/30",
    Low:       "bg-amber-500/15   text-amber-600   border border-amber-500/30",
    OK:        "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
    Paid:      "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
    Unpaid:    "bg-rose-500/15    text-rose-500    border border-rose-500/30",
    Overdue:   "bg-orange-500/15  text-orange-500  border border-orange-500/30",
  };
  return <span className={"text-xs px-2.5 py-0.5 rounded-full font-semibold " + (map[type] || "")}>{type}</span>;
}

export default Badge;