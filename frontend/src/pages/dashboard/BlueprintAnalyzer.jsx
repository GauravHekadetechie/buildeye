import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UploadCloud, ArrowRight, ImageIcon, Trash2 } from "lucide-react";
import api from "../../api/axios.js";
import { getErrorMessage } from "../../api/errorMessage.js";
import CompassPicker from "../../components/blueprint/CompassPicker.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function BlueprintAnalyzer() {
  const { user } = useAuth();
  const canCreate = user?.role === "builder" || user?.role === "admin";

  const [blueprints, setBlueprints] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [name, setName] = useState("");
  const [angle, setAngle] = useState(0);
  const [locations, setLocations] = useState([]);
  const [city, setCity] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const loadBlueprints = () => {
    api.get("/blueprint").then((res) => setBlueprints(res.data.blueprints));
  };

  useEffect(() => {
    loadBlueprints();
    api.get("/blueprint/locations").then((res) => setLocations(res.data.locations));
  }, []);

  const handleDelete = async (e, blueprintId, blueprintName) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete "${blueprintName}"? This can't be undone.`)) return;

    setDeletingId(blueprintId);
    try {
      await api.delete(`/blueprint/${blueprintId}`);
      setBlueprints((prev) => prev.filter((b) => b.id !== blueprintId));
    } catch (err) {
      alert(getErrorMessage(err, "Couldn't delete this project. Please try again."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setError("");
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please choose a blueprint or plan photo first.");
      return;
    }
    setError("");
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("northAngle", String(angle));
      if (name) formData.append("name", name);
      if (city) formData.append("city", city);
      const res = await api.post("/blueprint/analyze", formData);
      navigate(`/dashboard/blueprint/${res.data.blueprint.id}`);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't analyze that image. Please try again."));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <p className="tag-label">{canCreate ? "BLUEPRINT ANALYZER" : "MY PROJECTS"}</p>
        <h1 className="font-display text-2xl md:text-3xl text-mist mt-1">
          {canCreate ? "Upload a plan, get a full execution roadmap" : "Your assigned projects"}
        </h1>
        <p className="text-sm text-slate-soft mt-1 max-w-xl">
          {canCreate
            ? "Works with a printed blueprint, an architect's drawing, or a plan sketched by hand. Buildeye identifies rooms, estimates cost and timeline, and gives Vastu and ventilation guidance based on the North direction you set below."
            : "Your builder will assign a project here once it's uploaded and analyzed. You'll be able to see the full execution plan, 3D view, budget and progress photos."}
        </p>
      </header>

      {canCreate && (
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-6">
            <p className="tag-label mb-3">1. UPLOAD YOUR PLAN</p>

            {previewUrl ? (
              <div className="relative mb-4">
                <img src={previewUrl} alt="Preview" className="w-full max-h-56 object-contain rounded-sm border border-ink-line" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs text-signal hover:underline"
                >
                  Choose a different photo
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border border-dashed border-ink-line hover:border-signal rounded-sm flex flex-col items-center justify-center gap-2 text-slate-soft transition-colors mb-4"
              >
                <UploadCloud size={26} />
                <span className="text-sm">Click to upload a photo (JPG or PNG)</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            <input
              type="text"
              placeholder="Project name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-ink border border-ink-line rounded-sm px-3 py-2 text-sm text-mist placeholder:text-slate-soft/60 outline-none focus:border-signal mb-3"
            />

            <label className="tag-label block mb-1">Project location (for regional cost estimate)</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-ink border border-ink-line rounded-sm px-3 py-2 text-sm text-mist outline-none focus:border-signal"
            >
              <option value="">Use national average rate</option>
              {locations.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.city}
                  {l.state ? `, ${l.state}` : ""} (Tier {l.tier})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-soft/70 mt-1.5">
              Construction and land rates vary a lot across India — this adjusts the cost estimate to
              your city instead of using one flat national number.
            </p>
          </div>

          <div className="border border-ink-line bg-ink-panel/30 rounded-sm p-6 flex flex-col justify-between">
            <div>
              <p className="tag-label mb-3">2. SET NORTH</p>
              <CompassPicker angle={angle} onChange={setAngle} />
            </div>

            {error && <p className="text-sm text-risk-critical mt-4">{error}</p>}

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-signal hover:bg-signal-dim disabled:opacity-60 text-ink font-medium py-3 rounded-sm transition-colors"
            >
              {analyzing ? "Analyzing…" : "Analyze blueprint"}
              {!analyzing && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      )}

      <p className="tag-label mb-3">{user?.role === "admin" ? "ALL PROJECTS" : "YOUR PROJECTS"}</p>
      {!blueprints ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-sm border border-ink-line bg-ink-panel/30 animate-pulse" />
          ))}
        </div>
      ) : blueprints.length === 0 ? (
        <p className="text-sm text-slate-soft flex items-center gap-2">
          <ImageIcon size={16} />
          {canCreate ? "No projects analyzed yet — upload a plan above to get started." : "No projects have been assigned to you yet."}
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {blueprints.map((b) => {
            const canDelete = user?.role === "admin" || (user?.role === "builder" && b.builderId === user.id);
            return (
              <Link
                key={b.id}
                to={`/dashboard/blueprint/${b.id}`}
                className="group relative border border-ink-line bg-ink-panel/30 hover:border-signal/50 rounded-sm overflow-hidden transition-colors"
              >
                <img src={b.imageUrl} alt={b.name} className="w-full h-32 object-cover" />
                {canDelete && (
                  <button
                    onClick={(e) => handleDelete(e, b.id, b.name)}
                    disabled={deletingId === b.id}
                    className="absolute top-2 right-2 w-8 h-8 rounded-sm bg-ink/80 border border-ink-line flex items-center justify-center text-slate-soft opacity-0 group-hover:opacity-100 hover:text-risk-critical hover:border-risk-critical/50 transition-all disabled:opacity-60"
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="p-4">
                  <p className="font-display text-mist text-sm">{b.name}</p>
                  <p className="tag-label text-slate-soft/60 mt-1">
                    {b.analysis.projectType} · {b.analysis.plotSizeSqft} SQ.FT
                  </p>
                  {user?.role === "admin" && (
                    <p className="tag-label text-slate-soft/60 mt-1">
                      {b.clientName ? `Client: ${b.clientName}` : "Unassigned"}
                    </p>
                  )}
                  <p className="tag-label text-slate-soft/60 mt-1">
                    {new Date(b.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
