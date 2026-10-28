import React, { useEffect, useState } from "react";
import { X, Shuffle, Loader2 } from "lucide-react";
import api from "../../api/axios.js";
import { getErrorMessage } from "../../api/errorMessage.js";
import SectionIllustration from "./SectionIllustration.jsx";

const STYLES = [
  { key: "modern", label: "Modern Minimalist" },
  { key: "warm", label: "Warm Contemporary" },
  { key: "classic", label: "Classic Traditional" },
];

export default function FutureLookPanel({ blueprintId, section, onClose }) {
  const [style, setStyle] = useState("modern");
  const [variant, setVariant] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .post(`/blueprint/${blueprintId}/future-look`, { section, style, variant })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Couldn't generate that illustration."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [blueprintId, section, style, variant]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-ink border border-ink-line rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="tag-label">FUTURE LOOK</p>
            <h2 className="font-display text-xl text-mist mt-1">
              {section.charAt(0).toUpperCase() + section.slice(1)} section
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-soft hover:text-mist">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {STYLES.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setStyle(s.key);
                setVariant(0);
              }}
              className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
                style === s.key ? "border-signal text-signal bg-signal/5" : "border-ink-line text-slate-soft hover:text-mist"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-soft gap-2">
            <Loader2 size={18} className="animate-spin" /> Generating illustration…
          </div>
        ) : error ? (
          <p className="text-sm text-risk-critical">{error}</p>
        ) : data ? (
          <>
            <SectionIllustration rooms={data.rooms} palette={data.palette} variant={variant} />

            <p className="tag-label mt-4 mb-1">ROOMS IN THIS SECTION</p>
            <p className="text-sm text-mist mb-4">{data.rooms.join(", ") || "Not specifically identified"}</p>

            <p className="tag-label mb-1">
              {data.source === "ai-text" ? "AI-GENERATED DESCRIPTION" : "CONCEPT DESCRIPTION"}
            </p>
            <p className="text-sm text-slate-soft leading-relaxed">{data.description}</p>

            <button
              onClick={() => setVariant((v) => v + 1)}
              className="mt-5 flex items-center gap-2 text-sm text-signal hover:underline"
            >
              <Shuffle size={15} /> Show another idea in this style
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
