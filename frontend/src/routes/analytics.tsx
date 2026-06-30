import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/lib/task-helpers";
import { GlassCard } from "@/components/app/glass-card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AppShell } from "@/components/app/app-shell";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — DeadlinePilot" }] }),
  component: () => <AppShell><Analytics /></AppShell>,
});

function Analytics() {
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
    return d;
  });
  const weekData = days.map((d) => {
    const next = new Date(d); next.setDate(d.getDate()+1);
    const completed = tasks.filter(t => t.completed_at && new Date(t.completed_at) >= d && new Date(t.completed_at) < next).length;
    return { day: d.toLocaleDateString(undefined,{weekday:"short"}), completed };
  });

  const riskCounts = ["safe","moderate","high","critical"].map((r) => ({
    name: r, value: tasks.filter(t => t.risk === r && t.status !== "completed").length,
  }));
  const colors = ["#10b981","#f59e0b","#fb923c","#f43f5e"];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">See your productivity patterns.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard>
          <h2 className="font-display font-semibold mb-4">Weekly completions</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={weekData}>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background:"rgba(20,20,40,0.9)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px" }} />
                <Bar dataKey="completed" fill="url(#barG)" radius={[8,8,0,0]} />
                <defs>
                  <linearGradient id="barG" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.22 295)" />
                    <stop offset="100%" stopColor="oklch(0.62 0.20 255)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="font-display font-semibold mb-4">Risk distribution (open tasks)</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={riskCounts} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={4}>
                  {riskCounts.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background:"rgba(20,20,40,0.9)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            {riskCounts.map((r,i)=> (
              <div key={r.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{background: colors[i]}} />
                <span className="capitalize text-muted-foreground">{r.name}</span>
                <span className="font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}