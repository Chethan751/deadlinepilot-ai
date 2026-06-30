import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GlassCard } from "@/components/app/glass-card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/app-shell";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — DeadlinePilot" }] }),
  component: () => <AppShell><Settings /></AppShell>,
});

function Settings() {
  const { user } = useAuth();
  const nav = useNavigate();
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account.</p>
      </div>
      <GlassCard>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-primary grid place-items-center text-white text-xl font-bold">
            {(user?.user_metadata?.full_name || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{user?.user_metadata?.full_name || "Pilot"}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="font-display font-semibold mb-2">Session</h3>
        <p className="text-sm text-muted-foreground mb-4">Sign out of this device.</p>
        <Button variant="outline" className="glass border-white/10" onClick={async ()=>{ await supabase.auth.signOut(); nav({to:"/auth"}); }}>Sign out</Button>
      </GlassCard>
    </div>
  );
}