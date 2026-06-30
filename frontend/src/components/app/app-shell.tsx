import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { AnimatedBg } from "@/components/app/animated-bg";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, ListChecks, Sparkles, Timer, BarChart3, Settings, Rocket, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FloatingChat } from "@/components/app/floating-chat";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/planner", label: "AI Planner", icon: Sparkles },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/focus", label: "Focus", icon: Timer },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center">
        <AnimatedBg />
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBg />

      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-30 glass-strong border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-primary"><Rocket className="h-4 w-4 text-white" /></div>
          <span className="font-display font-bold">DeadlinePilot</span>
        </Link>
        <button onClick={() => setMobileOpen((v) => !v)} className="p-2 rounded-lg hover:bg-white/5">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed md:sticky inset-y-0 left-0 z-20 w-64 glass-strong border-r border-white/10 px-4 py-6 transition-transform md:translate-x-0",
            "top-[57px] md:top-0 h-[calc(100vh-57px)] md:h-screen",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Link to="/dashboard" className="hidden md:flex items-center gap-2 mb-8">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-primary shadow-[var(--shadow-glow)]"><Rocket className="h-4 w-4 text-white" /></div>
            <div>
              <div className="font-display font-bold leading-tight">DeadlinePilot</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Companion</div>
            </div>
          </Link>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                    active
                      ? "bg-gradient-primary text-white shadow-[var(--shadow-glow)]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto absolute bottom-6 left-4 right-4">
            <div className="glass rounded-xl p-3 text-xs">
              <div className="truncate font-medium">{user.user_metadata?.full_name || user.email}</div>
              <div className="truncate text-muted-foreground text-[11px]">{user.email}</div>
              <Button
                onClick={async () => { await supabase.auth.signOut(); nav({ to: "/auth" }); }}
                variant="ghost" size="sm" className="w-full mt-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8">
          {children}
        </main>
      </div>

      <FloatingChat />
    </div>
  );
}// trigger
