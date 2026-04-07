import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Upload, FileText, BarChart3, Settings,
  LogOut, MessageSquare, Lightbulb, Menu, X, CalendarDays,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: CalendarDays, label: "Meetings", path: "/meetings" },
  { icon: Lightbulb, label: "Insights", path: "/insights" },
  { icon: MessageSquare, label: "AI Chat", path: "/chat" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: FileText, label: "BRDs", path: "/brds" },
  { icon: BarChart3, label: "Metrics", path: "/metrics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const sidebar = (
    <>
      <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-xs font-bold text-sidebar-primary-foreground">MW</span>
          </div>
          <span className="text-base font-bold text-sidebar-foreground tracking-tight">MeetingWeaver</span>
        </Link>
        <button onClick={() => setMobileOpen(false)} className="lg:hidden text-sidebar-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <button onClick={toggleTheme} className="sidebar-link w-full">
          {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <button onClick={handleLogout} className="sidebar-link w-full">
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card border border-border rounded-lg p-2 shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - mobile */}
      <aside className={`fixed left-0 top-0 h-screen w-60 bg-sidebar flex flex-col z-50 transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebar}
      </aside>

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 bg-sidebar flex-col z-30">
        {sidebar}
      </aside>
    </>
  );
}
