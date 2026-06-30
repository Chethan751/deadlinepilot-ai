import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchTasks,
  setTaskStatus,
  deleteTask,
  priorityColor,
  riskColor,
  relativeDeadline,
  createTask,
  type Task,
} from "@/lib/task-helpers";
import { GlassCard } from "@/components/app/glass-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — DeadlinePilot" }] }),
  component: () => (
    <AppShell>
      <Tasks />
    </AppShell>
  ),
});

function Tasks() {
  const qc = useQueryClient();
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const filtered = tasks.filter((t) =>
    filter === "all"
      ? true
      : filter === "completed"
        ? t.status === "completed"
        : t.status !== "completed",
  );

  async function toggle(t: Task) {
    await setTaskStatus(t.id, t.status === "completed" ? "pending" : "completed");
    qc.invalidateQueries({ queryKey: ["tasks"] });
  }
  async function remove(t: Task) {
    await deleteTask(t.id);
    qc.invalidateQueries({ queryKey: ["tasks"] });
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Everything on your plate, ranked by urgency.
          </p>
        </div>
        <NewTaskDialog onCreated={() => qc.invalidateQueries({ queryKey: ["tasks"] })} />
      </div>

      <div className="flex gap-2">
        {(["all", "pending", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs capitalize border ${filter === f ? "bg-gradient-primary text-white border-transparent" : "glass border-white/10 text-muted-foreground hover:text-foreground"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <GlassCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No tasks here.</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((t) => (
              <li key={t.id} className="flex items-start gap-3 p-4 hover:bg-white/[0.02]">
                <Checkbox
                  checked={t.status === "completed"}
                  onCheckedChange={() => toggle(t)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium ${t.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                  >
                    {t.title}
                  </div>
                  {t.description && (
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {t.description}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${priorityColor(t.priority)}`}
                    >
                      {t.priority}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${riskColor(t.risk)}`}
                    >
                      {t.risk}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full glass border-white/10 text-muted-foreground">
                      {relativeDeadline(t.deadline)}
                    </span>
                    {t.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full glass border-white/10 text-muted-foreground">
                        {t.category}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => remove(t)}
                  className="text-muted-foreground hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}

function NewTaskDialog({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [minutes, setMinutes] = useState(60);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await createTask({
        user_id: user.id,
        title,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        estimated_minutes: minutes,
      });
      toast.success("Task added");
      setTitle("");
      setDeadline("");
      setMinutes(60);
      setOpen(false);
      onCreated();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary text-white shadow-[var(--shadow-glow)]">
          <Plus className="h-4 w-4 mr-1" /> New task
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-white/10">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass border-white/10 mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Deadline</Label>
              <Input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="glass border-white/10 mt-1"
              />
            </div>
            <div>
              <Label>Minutes</Label>
              <Input
                type="number"
                min={15}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="glass border-white/10 mt-1"
              />
            </div>
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-white">
            {busy ? "Saving…" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
