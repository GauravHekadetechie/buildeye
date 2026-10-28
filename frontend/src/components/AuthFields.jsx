import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Standard text input used across login/signup/settings forms.
export function Field({ icon: Icon, type = "text", placeholder, value, onChange, autoComplete }) {
  return (
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-soft" />}
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-ink-panel border border-ink-line focus:border-signal rounded-sm py-3 ${
          Icon ? "pl-10" : "pl-3"
        } pr-3 text-sm text-mist placeholder:text-slate-soft/60 outline-none transition-colors`}
      />
    </div>
  );
}

// Password input with a click-to-reveal toggle so users can check what
// they've typed before submitting.
export function PasswordField({
  icon: Icon,
  placeholder = "Password",
  value,
  onChange,
  autoComplete = "current-password",
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-soft" />}
      <input
        type={visible ? "text" : "password"}
        required
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-ink-panel border border-ink-line focus:border-signal rounded-sm py-3 ${
          Icon ? "pl-10" : "pl-3"
        } pr-10 text-sm text-mist placeholder:text-slate-soft/60 outline-none transition-colors`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-soft hover:text-mist transition-colors"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6C12.3 13.4 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4.1 7.1-10.1 7.1-17.6z" />
      <path fill="#FBBC05" d="M10.4 28.3a14.4 14.4 0 0 1 0-8.6l-7.8-6a24 24 0 0 0 0 20.6l7.8-6z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.4 0-11.7-3.9-13.6-9.8l-7.8 6C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
