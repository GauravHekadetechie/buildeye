import React, { useEffect, useState } from "react";
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import api from "../../api/axios.js";
import { getErrorMessage } from "../../api/errorMessage.js";

export default function AdminAISettings() {
  const [status, setStatus] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");

  const loadStatus = () => {
    api.get("/admin/ai-settings").then((res) => {
      setStatus(res.data);
      setModel(res.data.model || "");
    });
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaveMessage("");
    setTestResult(null);
    setSaving(true);
    try {
      await api.put("/admin/ai-settings", { apiKey, model });
      setApiKey("");
      setSaveMessage("Saved.");
      loadStatus();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't save the API key."));
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Remove the saved API key? The Blueprint Analyzer will fall back to the demo analyzer.")) return;
    setSaving(true);
    setError("");
    try {
      await api.put("/admin/ai-settings", { apiKey: "" });
      setSaveMessage("API key removed.");
      loadStatus();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't remove the API key."));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post("/admin/ai-settings/test");
      setTestResult({ success: true, message: res.data.message });
    } catch (err) {
      setTestResult({ success: false, message: getErrorMessage(err, "Connection test failed.") });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <p className="tag-label">AI SETTINGS</p>
        <h1 className="font-display text-2xl md:text-3xl text-mist mt-1">Connect an AI vision key</h1>
        <p className="text-sm text-slate-soft mt-1 max-w-2xl">
          Buildeye can't supply its own AI key — you'll need your own Anthropic API key, billed to your own
          Anthropic account. Once connected, new blueprint uploads are analyzed by real AI vision instead of
          the built-in demo analyzer, and the 3D explorer's descriptions are written by Claude.
        </p>
      </header>

      <div className="max-w-xl space-y-6">
        <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-5">
          <p className="tag-label mb-3">CURRENT STATUS</p>
          {!status ? (
            <div className="h-6 w-40 bg-ink-line/30 rounded-sm animate-pulse" />
          ) : status.configured ? (
            <div className="flex items-center gap-2 text-risk-low text-sm">
              <CheckCircle2 size={16} />
              Connected via {status.source === "admin-settings" ? "these settings" : "ANTHROPIC_API_KEY in .env"} ·{" "}
              <span className="font-mono text-xs text-slate-soft">{status.maskedKey}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-soft text-sm">
              <XCircle size={16} />
              Not connected — using the built-in demo analyzer
            </div>
          )}
          <p className="text-xs text-slate-soft mt-2">Model: {status?.model}</p>
        </div>

        <form onSubmit={handleSave} className="border border-ink-line bg-ink-panel/30 rounded-sm p-5 space-y-4">
          <div>
            <label className="tag-label block mb-2">Anthropic API key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full bg-ink border border-ink-line rounded-sm py-2.5 pl-3 pr-10 text-sm text-mist placeholder:text-slate-soft/60 outline-none focus:border-signal font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-soft hover:text-mist"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-signal hover:underline mt-2"
            >
              Get a key at console.anthropic.com <ExternalLink size={11} />
            </a>
          </div>

          <div>
            <label className="tag-label block mb-2">Model (optional)</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="claude-3-5-sonnet-latest"
              className="w-full bg-ink border border-ink-line rounded-sm py-2.5 px-3 text-sm text-mist placeholder:text-slate-soft/60 outline-none focus:border-signal font-mono"
            />
            <p className="text-xs text-slate-soft/70 mt-1">
              Leave as-is unless Anthropic has retired this model — check{" "}
              <a href="https://docs.claude.com" target="_blank" rel="noreferrer" className="text-signal hover:underline">
                docs.claude.com
              </a>{" "}
              for the current name.
            </p>
          </div>

          {error && <p className="text-sm text-risk-critical">{error}</p>}
          {saveMessage && <p className="text-sm text-risk-low">{saveMessage}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-signal hover:bg-signal-dim disabled:opacity-60 text-ink font-medium px-4 py-2 rounded-sm text-sm transition-colors"
            >
              {saving ? "Saving…" : "Save key"}
            </button>
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !status?.configured}
              className="flex items-center gap-2 border border-ink-line hover:border-signal disabled:opacity-50 text-mist px-4 py-2 rounded-sm text-sm transition-colors"
            >
              {testing && <Loader2 size={14} className="animate-spin" />}
              {testing ? "Testing…" : "Test connection"}
            </button>
            {status?.configured && (
              <button
                type="button"
                onClick={handleClear}
                disabled={saving}
                className="text-sm text-slate-soft hover:text-risk-critical transition-colors"
              >
                Remove key
              </button>
            )}
          </div>

          {testResult && (
            <p className={`text-sm flex items-center gap-2 ${testResult.success ? "text-risk-low" : "text-risk-critical"}`}>
              {testResult.success ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
              {testResult.message}
            </p>
          )}
        </form>

        <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-5">
          <p className="tag-label mb-2">WHAT THIS CHANGES</p>
          <ul className="text-sm text-slate-soft space-y-1.5 list-disc list-inside">
            <li>New blueprint uploads are analyzed by Claude's vision instead of the demo detector</li>
            <li>The 3D explorer's future-look descriptions are written by Claude instead of a template</li>
            <li>Existing projects keep whichever analysis they were created with — this only affects new uploads</li>
            <li>If a call to Anthropic fails for any reason, Buildeye automatically falls back to the demo analyzer for that upload</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
