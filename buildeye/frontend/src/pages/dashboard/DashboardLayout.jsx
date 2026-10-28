import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Camera,
  BellRing,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  ScanEye,
  ShieldCheck,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import Logo from "../../components/Logo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const ROLE_LABEL = { admin: "Admin", builder: "Builder / Contractor", client: "Client" };

function navForRole(role) {
  if (role === "admin") {
    return [
      { to: "/dashboard", label: "Admin Overview", icon: ShieldCheck, end: true },
      { to: "/dashboard/blueprint", label: "All Projects", icon: ScanEye },
      { to: "/dashboard/ai-settings", label: "AI Settings", icon: Sparkles },
      { to: "/dashboard/roadmap", label: "Project Roadmap", icon: Map },
      { to: "/dashboard/progress", label: "Demo: Progress Zones", icon: Camera },
      { to: "/dashboard/alerts", label: "Risk & Alerts", icon: BellRing },
      { to: "/dashboard/resources", label: "Resource Management", icon: Users },
      { to: "/dashboard/analytics", label: "Model Insights", icon: BarChart3 },
      { to: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
    ];
  }
  if (role === "builder") {
    return [
      { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/dashboard/blueprint", label: "Blueprint Analyzer", icon: ScanEye },
      { to: "/dashboard/roadmap", label: "Project Roadmap", icon: Map },
      { to: "/dashboard/progress", label: "Demo: Progress Zones", icon: Camera },
      { to: "/dashboard/alerts", label: "Risk & Alerts", icon: BellRing },
      { to: "/dashboard/resources", label: "Resource Management", icon: Users },
      { to: "/dashboard/analytics", label: "Model Insights", icon: BarChart3 },
      { to: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
    ];
  }
  // client
  return [
    { to: "/dashboard", label: "My Projects", icon: FolderKanban, end: true },
    { to: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
  ];
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = navForRole(user?.role);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-ink flex">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-ink-line bg-ink-panel/40 px-5 py-6">
        <SidebarContent navItems={navItems} handleLogout={handleLogout} user={user} />
      </aside>

      {/* Sidebar - mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-ink-panel px-5 py-6 flex flex-col">
            <SidebarContent
              navItems={navItems}
              handleLogout={handleLogout}
              user={user}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-ink-line">
          <Logo className="h-6 w-auto" />
          <button onClick={() => setMobileOpen(true)} className="text-mist">
            <Menu size={22} />
          </button>
        </div>
        <main className="p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navItems, handleLogout, user, onNavigate }) {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <Logo />
      </div>

      {user?.role && (
        <span className="tag-label inline-block border border-ink-line rounded-sm px-2 py-1 mb-6 w-fit">
          {ROLE_LABEL[user.role] || user.role}
        </span>
      )}

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                isActive
                  ? "bg-signal/10 text-signal border border-signal/30"
                  : "text-slate-soft hover:text-mist hover:bg-ink-line/40"
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-line pt-4 mt-4">
        <p className="text-sm text-mist truncate">{user?.name}</p>
        <p className="text-xs text-slate-soft truncate">{user?.identifier}</p>
        <button
          onClick={handleLogout}
          className="mt-4 w-full flex items-center gap-2 text-sm text-slate-soft hover:text-risk-critical transition-colors"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </>
  );
}
