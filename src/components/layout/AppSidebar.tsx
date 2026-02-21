import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Upload, FileText, BarChart3, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: FileText, label: "BRDs", path: "/brds" },
  { icon: BarChart3, label: "Metrics", path: "/metrics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-sidebar sidebar-glow">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Zap className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-base font-semibold text-sidebar-accent-foreground tracking-tight">
          BRD Agent
        </span>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex-1 px-3 space-y-0.5">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-4">
        <p className="text-xs text-sidebar-muted">
          AI-Powered BRD Generation
        </p>
      </div>
    </aside>
  );
}
