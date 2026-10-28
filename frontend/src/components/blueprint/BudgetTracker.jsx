import React, { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import api from "../../api/axios.js";
import { getErrorMessage } from "../../api/errorMessage.js";

function formatINR(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

const CATEGORIES = ["Materials", "Labour", "Equipment rental", "Permits & fees", "Transport", "Contingency", "Other"];

export default function BudgetTracker({ blueprintId }) {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ category: CATEGORIES[0], amount: "", note: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get(`/expenses/${blueprintId}`).then((res) => setData(res.data));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blueprintId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/expenses/${blueprintId}`, form);
      setForm({ category: CATEGORIES[0], amount: "", note: "" });
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't save that expense."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expenseId) => {
    try {
      await api.delete(`/expenses/${blueprintId}/${expenseId}`);
      load();
    } catch {
      // silent — list will simply not update if this fails
    }
  };

  if (!data) {
    return <div className="h-40 rounded-sm border border-ink-line bg-ink-panel/30 animate-pulse" />;
  }

  const { expenses, totalSpent, budgetedTotal, canEdit } = data;
  const remaining = budgetedTotal !== null ? budgetedTotal - totalSpent : null;
  const pctUsed = budgetedTotal ? Math.min(150, Math.round((totalSpent / budgetedTotal) * 100)) : 0;
  const overBudget = remaining !== null && remaining < 0;

  return (
    <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-5">
      <p className="tag-label mb-4">BUDGET & EXPENSES</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Stat label="AI-estimated budget" value={budgetedTotal !== null ? formatINR(budgetedTotal) : "—"} />
        <Stat label="Spent so far" value={formatINR(totalSpent)} accent="text-signal" />
        <Stat
          label={overBudget ? "Over budget by" : "Remaining"}
          value={remaining !== null ? formatINR(Math.abs(remaining)) : "—"}
          accent={overBudget ? "text-risk-critical" : "text-risk-low"}
        />
      </div>

      <div className="h-2 bg-ink-line rounded-full overflow-hidden mb-8">
        <div
          className={`h-full rounded-full ${overBudget ? "bg-risk-critical" : "bg-signal"}`}
          style={{ width: `${Math.min(100, pctUsed)}%` }}
        />
      </div>

      {canEdit && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 mb-6">
          <div>
            <label className="tag-label block mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="bg-ink border border-ink-line rounded-sm px-3 py-2 text-sm text-mist outline-none focus:border-signal"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="tag-label block mb-1">Amount (₹)</label>
            <input
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="bg-ink border border-ink-line rounded-sm px-3 py-2 text-sm text-mist w-32 outline-none focus:border-signal"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="tag-label block mb-1">Note</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Optional"
              className="w-full bg-ink border border-ink-line rounded-sm px-3 py-2 text-sm text-mist placeholder:text-slate-soft/60 outline-none focus:border-signal"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-signal hover:bg-signal-dim disabled:opacity-60 text-ink font-medium px-4 py-2 rounded-sm text-sm transition-colors"
          >
            <Plus size={15} /> Add
          </button>
        </form>
      )}

      {error && <p className="text-sm text-risk-critical mb-4">{error}</p>}

      {expenses.length === 0 ? (
        <p className="text-sm text-slate-soft">No expenses logged yet.</p>
      ) : (
        <div className="space-y-2">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center justify-between border-b border-ink-line/60 pb-2 text-sm">
              <div>
                <span className="text-mist">{e.category}</span>
                {e.note && <span className="text-slate-soft"> · {e.note}</span>}
                <span className="tag-label text-slate-soft/60 ml-2">
                  {new Date(e.date).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-mist font-mono">{formatINR(e.amount)}</span>
                {canEdit && (
                  <button onClick={() => handleDelete(e.id)} className="text-slate-soft hover:text-risk-critical">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent = "text-mist" }) {
  return (
    <div>
      <p className="tag-label mb-1">{label}</p>
      <p className={`font-display text-xl ${accent}`}>{value}</p>
    </div>
  );
}
