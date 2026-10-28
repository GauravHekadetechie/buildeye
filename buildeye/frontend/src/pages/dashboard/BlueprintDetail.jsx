import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Trash2, AlertTriangle } from "lucide-react";
import api from "../../api/axios.js";
import { getErrorMessage } from "../../api/errorMessage.js";
import { useAuth } from "../../context/AuthContext.jsx";
import RoomOverlay from "../../components/blueprint/RoomOverlay.jsx";
import Massing3D from "../../components/blueprint/Massing3D.jsx";
import FutureLookPanel from "../../components/blueprint/FutureLookPanel.jsx";
import ExecutionTimeline from "../../components/blueprint/ExecutionTimeline.jsx";
import ResourcesPanel from "../../components/blueprint/ResourcesPanel.jsx";
import CostBreakdown from "../../components/blueprint/CostBreakdown.jsx";
import VastuGuidance from "../../components/blueprint/VastuGuidance.jsx";
import VentilationGuidance from "../../components/blueprint/VentilationGuidance.jsx";
import ProgressPhotos from "../../components/blueprint/ProgressPhotos.jsx";
import BudgetTracker from "../../components/blueprint/BudgetTracker.jsx";
import AssignClient from "../../components/blueprint/AssignClient.jsx";

const TABS = ["Overview", "3D View", "Execution & Cost", "Vastu & Ventilation", "Progress Photos", "Budget"];

export default function BlueprintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const load = () => {
    api
      .get(`/blueprint/${id}`)
      .then((res) => setBlueprint(res.data.blueprint))
      .catch(() => setError("Couldn't load this project."));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/blueprint/${id}`);
      navigate("/dashboard/blueprint");
    } catch (err) {
      setDeleteError(getErrorMessage(err, "Couldn't delete this project. Please try again."));
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <div>
        <p className="text-risk-critical">{error}</p>
        <Link to="/dashboard/blueprint" className="text-signal hover:underline text-sm mt-2 inline-block">
          Back to your projects
        </Link>
      </div>
    );
  }

  if (!blueprint) {
    return <div className="h-64 rounded-sm border border-ink-line bg-ink-panel/30 animate-pulse" />;
  }

  const a = blueprint.analysis;
  const isEditor = user?.role === "admin" || (user?.role === "builder" && blueprint.builderId === user.id);
  const isDemoAnalysis = a.source !== "ai-vision";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link to="/dashboard/blueprint" className="inline-flex items-center gap-1 text-sm text-slate-soft hover:text-mist">
          <ChevronLeft size={16} /> Back to all projects
        </Link>

        {isEditor && (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-soft hover:text-risk-critical transition-colors"
          >
            <Trash2 size={15} /> Delete project
          </button>
        )}
      </div>

      <header className="mb-6">
        <p className="tag-label">
          {isDemoAnalysis ? "DEMO ANALYSIS" : "AI VISION ANALYSIS"} · {a.projectType.toUpperCase()}
        </p>
        <h1 className="font-display text-2xl md:text-3xl text-mist mt-1">{blueprint.name}</h1>
        <p className="text-sm text-slate-soft mt-1 max-w-2xl">{a.summary}</p>
        {a.aiFallbackReason && (
          <p className="text-xs text-risk-medium mt-2">
            Note: AI analysis wasn't available for this upload ({a.aiFallbackReason}), so a demo analysis is shown instead.
          </p>
        )}
      </header>

      {isDemoAnalysis && (
        <div className="flex items-start gap-3 border border-risk-medium/40 bg-risk-medium/5 rounded-sm p-4 mb-8">
          <AlertTriangle size={16} className="text-risk-medium flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-soft">
            This project is using Buildeye's built-in demo analyzer, which produces a consistent, plausible
            analysis for your uploaded image but doesn't actually read the rooms drawn in it. The same photo
            will always give you the same result, but for room detection based on what's really in your
            blueprint, connect an AI vision key — see <code className="text-signal">ANTHROPIC_API_KEY</code> in
            the README.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-8 border-b border-ink-line pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm px-3 py-1.5 rounded-sm transition-colors ${
              tab === t ? "bg-signal/10 text-signal border border-signal/30" : "text-slate-soft hover:text-mist"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <RoomOverlay imageUrl={blueprint.imageUrl} rooms={a.rooms} northAngle={a.northAngle} />
            <div className="space-y-4">
              <StatRow label="Plot size" value={`${a.plotSizeSqft} sq.ft`} />
              <StatRow label="Floors" value={a.floors} />
              <StatRow label="Rooms identified" value={a.rooms.length} />
              <StatRow label="Estimated timeline" value={`${a.totalTimelineWeeks} weeks`} />
              <StatRow label="Estimated cost" value={`₹${a.cost.totalEstimate.toLocaleString("en-IN")}`} />
              {a.cost.location && (
                <StatRow label="Priced for" value={`${a.cost.location.city} (Tier ${a.cost.location.tier})`} />
              )}
            </div>
          </div>

          {isEditor && (
            <AssignClient
              blueprintId={blueprint.id}
              clientName={blueprint.clientName}
              onAssigned={setBlueprint}
            />
          )}
        </div>
      )}

      {tab === "3D View" && (
        <>
          <Massing3D
            floors={a.floors}
            rooms={a.rooms}
            plotSizeSqft={a.plotSizeSqft}
            activeSection={activeSection}
            onSectionClick={setActiveSection}
          />
          {activeSection && (
            <FutureLookPanel
              blueprintId={blueprint.id}
              section={activeSection}
              onClose={() => setActiveSection(null)}
            />
          )}
        </>
      )}

      {tab === "Execution & Cost" && (
        <div className="space-y-6">
          <ExecutionTimeline executionPlan={a.executionPlan} totalWeeks={a.totalTimelineWeeks} />
          <ResourcesPanel materials={a.materials} labor={a.labor} />
          <CostBreakdown cost={a.cost} />
        </div>
      )}

      {tab === "Vastu & Ventilation" && (
        <div className="space-y-6">
          <VastuGuidance vastu={a.vastu} />
          <VentilationGuidance ventilation={a.ventilation} />
        </div>
      )}

      {tab === "Progress Photos" && (
        <ProgressPhotos
          blueprintId={blueprint.id}
          photos={blueprint.progressPhotos}
          onUpdated={setBlueprint}
          canEdit={isEditor}
        />
      )}

      {tab === "Budget" && <BudgetTracker blueprintId={blueprint.id} />}

      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => !deleting && setConfirmingDelete(false)}>
          <div className="bg-ink border border-ink-line rounded-sm max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-lg text-mist mb-2">Delete this project?</p>
            <p className="text-sm text-slate-soft mb-1">
              This permanently deletes <span className="text-mist">{blueprint.name}</span>, including its
              analysis, progress photos and expense records. This can't be undone.
            </p>
            {deleteError && <p className="text-sm text-risk-critical mt-3">{deleteError}</p>}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="flex-1 border border-ink-line text-mist py-2 rounded-sm text-sm hover:border-signal transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-risk-critical hover:opacity-90 disabled:opacity-60 text-mist py-2 rounded-sm text-sm transition-opacity"
              >
                {deleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-ink-line/60 pb-3">
      <span className="text-slate-soft text-sm">{label}</span>
      <span className="text-mist font-display">{value}</span>
    </div>
  );
}
