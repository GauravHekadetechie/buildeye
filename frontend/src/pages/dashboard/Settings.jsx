import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { PasswordField } from "../../components/AuthFields.jsx";
import { getErrorMessage } from "../../api/errorMessage.js";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div>
      <header className="mb-8">
        <p className="tag-label">SETTINGS</p>
        <h1 className="font-display text-2xl md:text-3xl text-mist mt-1">Account</h1>
      </header>

      <div className="grid gap-6 max-w-md">
        <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-6 space-y-5">
          <Field label="Name" value={user?.name} />
          <Field label="Email / phone" value={user?.identifier} />
          <Field label="Company" value={user?.company || "—"} />

          <div className="pt-4 border-t border-ink-line">
            <p className="tag-label mb-2">ALERT PREFERENCES (DEMO)</p>
            <Toggle label="Email alerts" defaultChecked />
            <Toggle label="SMS alerts for Critical severity" defaultChecked />
            <Toggle label="Weekly summary report" />
          </div>
        </div>

        <ChangePasswordCard />
      </div>
    </div>
  );
}

function ChangePasswordCard() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null); // { type: "error" | "success", message }
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword.length < 6) {
      setStatus({ type: "error", message: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "New password and confirmation don't match." });
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setStatus({ type: "success", message: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setStatus({
        type: "error",
        message: getErrorMessage(err, "Couldn't update your password. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-6">
      <p className="tag-label mb-1">SECURITY</p>
      <p className="font-display text-mist mb-4">Change password</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordField
          placeholder="Current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
        />
        <PasswordField
          placeholder="New password (min. 6 characters)"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
        />
        <PasswordField
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />

        {status && (
          <p className={`text-sm ${status.type === "error" ? "text-risk-critical" : "text-risk-low"}`}>
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-signal hover:bg-signal-dim disabled:opacity-60 text-ink font-medium py-2.5 rounded-sm transition-colors"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="tag-label mb-1">{label}</p>
      <p className="text-mist">{value}</p>
    </div>
  );
}

function Toggle({ label, defaultChecked }) {
  return (
    <label className="flex items-center justify-between py-2 text-sm text-slate-soft cursor-pointer">
      {label}
      <input type="checkbox" defaultChecked={defaultChecked} className="accent-signal w-4 h-4" />
    </label>
  );
}
