import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import api from "../../api/axios.js";
import { getErrorMessage } from "../../api/errorMessage.js";

export default function AssignClient({ blueprintId, clientName, onAssigned }) {
  const [identifier, setIdentifier] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAssign = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim()) {
      setError("Enter the client's email or phone number.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.put(`/blueprint/${blueprintId}/assign-client`, { identifier: identifier.trim() });
      onAssigned(res.data.blueprint);
      setIdentifier("");
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't assign that client."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-4">
      <p className="tag-label mb-2 flex items-center gap-2">
        <UserPlus size={12} /> CLIENT ASSIGNMENT
      </p>
      {clientName ? (
        <p className="text-sm text-mist mb-3">
          Assigned to <span className="text-signal">{clientName}</span>
        </p>
      ) : (
        <p className="text-sm text-slate-soft mb-3">No client assigned yet — they won't see this project until you assign them.</p>
      )}

      <form onSubmit={handleAssign} className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Client's email or phone"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="flex-1 min-w-[180px] bg-ink border border-ink-line rounded-sm px-3 py-2 text-sm text-mist placeholder:text-slate-soft/60 outline-none focus:border-signal"
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-signal hover:bg-signal-dim disabled:opacity-60 text-ink font-medium px-4 py-2 rounded-sm text-sm transition-colors"
        >
          {saving ? "Assigning…" : clientName ? "Reassign" : "Assign"}
        </button>
      </form>
      {error && <p className="text-sm text-risk-critical mt-2">{error}</p>}
    </div>
  );
}
