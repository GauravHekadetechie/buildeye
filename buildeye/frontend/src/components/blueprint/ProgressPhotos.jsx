import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import api from "../../api/axios.js";
import { getErrorMessage } from "../../api/errorMessage.js";

export default function ProgressPhotos({ blueprintId, photos, onUpdated, canEdit = true }) {
  const fileRef = useRef(null);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a site photo first.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("note", note);
      const res = await api.post(`/blueprint/${blueprintId}/progress-photo`, formData);
      onUpdated(res.data.blueprint);
      setNote("");
      fileRef.current.value = "";
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't upload that photo. Please try again."));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-5">
      <p className="tag-label mb-1">SITE PROGRESS TRACKING</p>
      <p className="text-sm text-slate-soft mb-4 max-w-xl">
        {canEdit
          ? "Upload a new site photo any time during construction — Buildeye keeps a timeline and estimates overall progress against this plan."
          : "Your builder uploads site photos here as construction progresses."}
      </p>

      {canEdit && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="text-sm text-slate-soft file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border-0 file:bg-ink-line file:text-mist file:text-sm hover:file:bg-signal/20"
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-ink border border-ink-line rounded-sm px-3 py-2 text-sm text-mist placeholder:text-slate-soft/60 outline-none focus:border-signal"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-2 bg-signal hover:bg-signal-dim disabled:opacity-60 text-ink font-medium px-4 py-2 rounded-sm text-sm transition-colors"
          >
            <Upload size={15} /> {uploading ? "Uploading…" : "Upload photo"}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-risk-critical mb-4">{error}</p>}

      {photos.length === 0 ? (
        <p className="text-sm text-slate-soft">No site photos uploaded yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...photos].reverse().map((p, i) => (
            <div key={p.filename + i} className="border border-ink-line rounded-sm overflow-hidden">
              <img src={p.imageUrl} alt={p.note || "Site progress"} className="w-full h-32 object-cover" />
              <div className="p-3">
                <div className="flex justify-between items-center">
                  <span className="tag-label text-signal">{p.estimatedProgress}% COMPLETE</span>
                  <span className="tag-label text-slate-soft/60">
                    {new Date(p.uploadedAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-mist mt-2">{p.aiNote}</p>
                {p.note && <p className="text-xs text-slate-soft mt-1">"{p.note}"</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
