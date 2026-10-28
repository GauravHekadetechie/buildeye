import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Loader from "./components/Loader.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import DashboardLayout from "./pages/dashboard/DashboardLayout.jsx";
import RoadmapPage from "./pages/dashboard/RoadmapPage.jsx";
import ProgressTracking from "./pages/dashboard/ProgressTracking.jsx";
import RiskAlerts from "./pages/dashboard/RiskAlerts.jsx";
import Resources from "./pages/dashboard/Resources.jsx";
import Analytics from "./pages/dashboard/Analytics.jsx";
import Settings from "./pages/dashboard/Settings.jsx";
import BlueprintAnalyzer from "./pages/dashboard/BlueprintAnalyzer.jsx";
import BlueprintDetail from "./pages/dashboard/BlueprintDetail.jsx";
import DashboardHome from "./pages/dashboard/DashboardHome.jsx";
import AdminAISettings from "./pages/dashboard/AdminAISettings.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1600);
    return () => clearTimeout(t);
  }, []);

  if (booting) return <Loader />;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="blueprint" element={<BlueprintAnalyzer />} />
        <Route path="blueprint/:id" element={<BlueprintDetail />} />
        <Route path="ai-settings" element={<AdminAISettings />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="progress" element={<ProgressTracking />} />
        <Route path="alerts" element={<RiskAlerts />} />
        <Route path="resources" element={<Resources />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
