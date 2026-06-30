import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { GlassCard } from "@/components/app/glass-card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";

export const Route = createFileRoute("/focus")({
  head: () => ({ meta: [{ title: "Focus Mode — DeadlinePilot" }] }),
  component: () => <AppShell><Focus /></AppShell>,
});

function Focus() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (tick.current) clearInterval(tick.current);
          setRunning(false);
          finish();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (tick.current) clearInterval(tick.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  async function finish() {
    if (mode === "focus" && user) {
      await supabase.from("focus_sessions").insert({ user_id: user.id, duration_minutes: Math.round(duration/60), completed: true });
      toast.success(`Great work! ${Math.round(duration/60)} min focus logged.`);
    }
  }

  function pick(mins: number, m: "focus" | "break") {
    setMode(m); setDuration(mins*60); setRemaining(mins*60); setRunning(false);
  }

  const mm = String(Math.floor(remaining/60)).padStart(2,"0");
  const ss = String(remaining%60).padStart(2,"0");
  const pct = ((duration - remaining) / duration) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold">Focus Mode</h1>
        <p className="text-muted-foreground text-sm mt-1">Pomodoro timer. Deep work, no distractions.</p>
      </div>
      <GlassCard className="p-8 text-center">
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          <Button size="sm" variant={mode==="focus"?"default":"outline"} onClick={() => pick(25, "focus")} className={mode==="focus"?"bg-gradient-primary text-white":"glass border-white/10"}>25m Focus</Button>
          <Button size="sm" variant={mode==="break"?"default":"outline"} onClick={() => pick(5, "break")} className={mode==="break"?"bg-gradient-primary text-white":"glass border-white/10"}><Coffee className="h-3 w-3 mr-1"/>5m Break</Button>
          <Button size="sm" variant="outline" onClick={() => pick(50, "focus")} className="glass border-white/10">50m Deep</Button>
        </div>
        <div className="relative inline-grid place-items-center">
          <svg className="h-64 w-64 -rotate-90">
            <circle cx="128" cy="128" r="118" stroke="oklch(1 0 0 / 0.08)" strokeWidth="10" fill="none" />
            <circle cx="128" cy="128" r="118" stroke="url(#g)" strokeWidth="10" fill="none"
              strokeDasharray={2*Math.PI*118}
              strokeDashoffset={2*Math.PI*118*(1-pct/100)}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.68 0.22 295)" />
                <stop offset="100%" stopColor="oklch(0.62 0.20 255)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute font-display text-6xl font-bold tabular-nums">{mm}:{ss}</div>
        </div>
        <div className="flex justify-center gap-3 mt-8">
          <Button onClick={() => setRunning(r => !r)} className="bg-gradient-primary text-white shadow-[var(--shadow-glow)] px-8">
            {running ? <><Pause className="h-4 w-4 mr-2"/>Pause</> : <><Play className="h-4 w-4 mr-2"/>Start</>}
          </Button>
          <Button variant="outline" onClick={() => { setRemaining(duration); setRunning(false); }} className="glass border-white/10">
            <RotateCcw className="h-4 w-4"/>
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}