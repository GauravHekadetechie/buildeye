import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Building2, ArrowRight, HardHat, Home } from "lucide-react";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import AuthSidePanel from "../components/AuthSidePanel.jsx";
import { Field, PasswordField, GoogleG } from "../components/AuthFields.jsx";
import { getErrorMessage } from "../api/errorMessage.js";

export default function Signup() {
  const [form, setForm] = useState({ name: "", identifier: "", password: "", company: "", role: "client" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== confirmPassword) {
      setError("Passwords don't match. Please re-enter them.");
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't create your account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink">
      <AuthSidePanel />

      <div className="flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="inline-block mb-10">
            <Logo />
          </Link>

          <h1 className="font-display text-2xl font-semibold text-mist">Create your account</h1>
          <p className="mt-2 text-sm text-slate-soft">
            Set up Buildeye for your project in under a minute.
          </p>

          <div className="mt-6 mb-2">
            <p className="tag-label mb-2">I AM A...</p>
            <div className="grid grid-cols-2 gap-2">
              <RoleOption
                icon={HardHat}
                label="Builder / Contractor"
                active={form.role === "builder"}
                onClick={() => update("role")("builder")}
              />
              <RoleOption
                icon={Home}
                label="Homeowner / Client"
                active={form.role === "client"}
                onClick={() => update("role")("client")}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field
              icon={User}
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={update("name")}
              autoComplete="name"
            />
            <Field
              icon={Mail}
              type="text"
              placeholder="Email or phone number"
              value={form.identifier}
              onChange={update("identifier")}
              autoComplete="username"
            />
            <Field
              icon={Building2}
              type="text"
              placeholder={form.role === "builder" ? "Company / firm name (optional)" : "Company (optional)"}
              value={form.company}
              onChange={update("company")}
              autoComplete="organization"
            />
            <PasswordField
              placeholder="Password (min. 6 characters)"
              value={form.password}
              onChange={update("password")}
              autoComplete="new-password"
            />
            <PasswordField
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />

            {error && <p className="text-sm text-risk-critical">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-signal hover:bg-signal-dim disabled:opacity-60 text-ink font-medium py-3 rounded-sm transition-colors"
            >
              {loading ? "Creating account…" : "Create account"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-ink-line" />
            <span className="tag-label">OR</span>
            <div className="h-px flex-1 bg-ink-line" />
          </div>

          <button
            type="button"
            onClick={() => setError("Google sign-in is mocked in this demo build.")}
            className="w-full flex items-center justify-center gap-2 border border-ink-line hover:border-signal text-mist py-3 rounded-sm transition-colors"
          >
            <GoogleG /> Continue with Google
          </button>

          <p className="mt-8 text-sm text-slate-soft text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-signal hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function RoleOption({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 py-3 rounded-sm border text-xs transition-colors ${
        active ? "border-signal bg-signal/10 text-signal" : "border-ink-line text-slate-soft hover:text-mist"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}
