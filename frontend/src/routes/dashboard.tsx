import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks, relativeDeadline, riskColor } from "@/lib/task-helpers";
import { GlassCard } from "@/components/app/glass-card";
import { ListChecks, CheckCircle2, AlertTriangle, Zap, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AppShell } from "@/components/app/app-shell";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DeadlinePilot" }] }),
  component: () => <AppShell><Dashboard /></AppShell>,
});

const QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "A goal without a plan is just a wish.",
  "You don't have to be extreme, just consistent.",
  "The secret of getting ahead is getting started.",
];

function Dashboard() {
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });

  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  const todays = tasks.filter(t => t.deadline && new Date(t.deadline) >= today && new Date(t.deadline) < tomorrow);
  const upcoming = tasks.filter(t => t.status !== "completed" && t.deadline && new Date(t.deadline) >= tomorrow).slice(0,5);
  const completed = tasks.filter(t => t.status === "completed").length;
  const pending = tasks.filter(t => t.status !== "completed").length;
  const critical = tasks.filter(t => t.risk === "critical" && t.status !== "completed").length;
  const total = tasks.length;
  const score = total > 0 ? Math.round((completed / total) * 100) : 0;
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  const stats = [
    { label: "Pending", value: pending, icon: ListChecks },
    { label: "Completed", value: completed, icon: CheckCircle2 },
    { label: "At Risk", value: critical, icon: AlertTriangle },
    { label: "Productivity", value: `${score}%`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Welcome back, <span className="text-gradient">pilot</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{quote}</p>
        </div>
        <Link to="/planner">
          <Button className="bg-gradient-primary text-white shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4 mr-2" /> Plan with AI
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity:0, y: 10 }} animate={{ opacity:1, y: 0 }} transition={{ delay: i*0.05 }}>
              <GlassCard className="relative overflow-hidden">
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-primary opacity-20 blur-2xl" />
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="font-display text-3xl font-bold mt-2">{isLoading ? "—" : s.value}</div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Today's tasks</h2>
            <Link to="/tasks" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          {todays.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-2">
              {todays.map(t => (
                <li key={t.id} className="glass rounded-xl p-3 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-gradient-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{relativeDeadline(t.deadline)} · {t.estimated_minutes}m</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskColor(t.risk)}`}>{t.risk}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard>
          <h2 className="font-display text-lg font-semibold mb-1">Daily progress</h2>
          <p className="text-xs text-muted-foreground mb-4">Productivity score</p>
          <div className="font-display text-5xl font-bold text-gradient">{score}%</div>
          <Progress value={score} className="mt-4" />
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-primary" /> {completed} of {total} tasks done
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="font-display text-lg font-semibold mb-4">Upcoming deadlines</h2>
        {upcoming.length === 0 ? (
          <EmptyState message="No upcoming deadlines. You're cruising." />
        ) : (
          <ul className="space-y-2">
            {upcoming.map(t => (
              <li key={t.id} className="glass rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{relativeDeadline(t.deadline)}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskColor(t.risk)}`}>{t.risk}</span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}

function EmptyState({ message = "Nothing scheduled yet. Use the AI Planner to drop in your week." }: { message?: string }) {
  return (
    <div className="text-center py-10 text-sm text-muted-foreground">
      <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
      {message}
      <div className="mt-3">
        <Link to="/planner" className="text-primary text-sm hover:underline">Open AI Planner →</Link>
      </div>
    </div>
  );
}