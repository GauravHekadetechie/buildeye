import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getRememberedIdentifier } from "../context/AuthContext.jsx";
import AuthSidePanel from "../components/AuthSidePanel.jsx";
import { Field, PasswordField, GoogleG } from "../components/AuthFields.jsx";
import { getErrorMessage } from "../api/errorMessage.js";

export default function Login() {
  const [identifier, setIdentifier] = useState(() => getRememberedIdentifier());
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(() => Boolean(getRememberedIdentifier()));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier, password, remember);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't log in. Please check your details."));
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

          <h1 className="font-display text-2xl font-semibold text-mist">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-soft">
            Log in with your email or phone number to view live project data.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field
              icon={Mail}
              type="text"
              placeholder="Email or phone number"
              value={identifier}
              onChange={setIdentifier}
              autoComplete="username"
            />
            <PasswordField
              placeholder="Password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-soft cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-signal w-4 h-4"
                />
                Remember me
              </label>
              <span className="tag-label text-slate-soft/60">
                {remember ? "STAYS LOGGED IN" : "THIS SESSION ONLY"}
              </span>
            </div>

            {error && <p className="text-sm text-risk-critical">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-signal hover:bg-signal-dim disabled:opacity-60 text-ink font-medium py-3 rounded-sm transition-colors"
            >
              {loading ? "Logging in…" : "Log in"}
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
            New to Buildeye?{" "}
            <Link to="/signup" className="text-signal hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
