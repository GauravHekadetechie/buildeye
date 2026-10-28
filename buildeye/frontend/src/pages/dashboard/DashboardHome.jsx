import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Overview from "./Overview.jsx";
import AdminOverview from "./AdminOverview.jsx";
import BlueprintAnalyzer from "./BlueprintAnalyzer.jsx";

// The dashboard's index route ("/dashboard") shows something different
// depending on who's logged in: admins get a platform-wide overview,
// clients land straight on their assigned projects (they have no reason to
// see the illustrative multi-project mock dashboard), and builders see the
// existing company-dashboard-style Overview.
export default function DashboardHome() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminOverview />;
  if (user?.role === "client") return <BlueprintAnalyzer />;
  return <Overview />;
}
