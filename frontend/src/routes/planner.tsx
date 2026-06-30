import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { planFromBrainDump, reprioritizeTasks } from "@/lib/ai-planner.functions";
import { GlassCard } from "@/components/app/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Mic, MicOff, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { priorityColor, riskColor, relativeDeadline } from "@/lib/task-helpers";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app/app-shell";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "AI Planner — DeadlinePilot" }] }),
  component: () => (
    <AppShell>
      <Planner />
    </AppShell>
  ),
});

const EXAMPLES = [
  "DBMS assignment due tomorrow, Java lab on Friday, ML exam next week",
  "Finish design mockups by Thursday 6pm, send investor update Friday, gym 3x this week",
];

function Planner() {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const qc = useQueryClient();
  const plan = useServerFn(planFromBrainDump);
  const reprio = useServerFn(reprioritizeTasks);

  const planMut = useMutation({
    mutationFn: (t: string) => plan({ data: { text: t } }),
    onSuccess: (res) => {
      toast.success(`Created ${res.tasks?.length ?? 0} tasks`);
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setText("");
    },
    onError: (e: any) => toast.error(e?.message || "AI planning failed"),
  });

  const reprioMut = useMutation({
    mutationFn: () => reprio({ data: {} }),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(res?.nudge || `Reprioritized ${res?.updated ?? 0} tasks`);
    },
  });

  function startVoice() {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    r.onresult = (e: any) => setText((p) => (p + " " + e.results[0][0].transcript).trim());
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start();
    setListening(true);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          <span className="text-gradient">AI Planner</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Brain-dump everything. Gemini extracts, prioritizes, and schedules.
        </p>
      </div>

      <GlassCard className="p-6">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. I have a DBMS assignment due tomorrow, Java lab on Friday, and ML exam next week..."
          className="min-h-32 glass border-white/10 text-base resize-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={listening ? undefined : startVoice}
              disabled={listening}
              className="glass border-white/10"
            >
              {listening ? (
                <>
                  <MicOff className="h-3.5 w-3.5 mr-1.5 text-rose-400 animate-pulse" /> Listening…
                </>
              ) : (
                <>
                  <Mic className="h-3.5 w-3.5 mr-1.5" /> Voice
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => reprioMut.mutate()}
              disabled={reprioMut.isPending}
              className="glass border-white/10"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${reprioMut.isPending ? "animate-spin" : ""}`}
              />{" "}
              Reprioritize
            </Button>
          </div>
          <Button
            onClick={() => planMut.mutate(text)}
            disabled={planMut.isPending || text.trim().length < 4}
            className="bg-gradient-primary text-white shadow-[var(--shadow-glow)]"
          >
            {planMut.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate plan
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setText(ex)}
              className="text-xs px-3 py-1.5 rounded-full glass border border-white/10 hover:bg-white/5"
            >
              {ex.slice(0, 60)}
              {ex.length > 60 ? "…" : ""}
            </button>
          ))}
        </div>
      </GlassCard>

      {planMut.isPending && (
        <GlassCard>
          <div className="shimmer h-2 w-full rounded-full bg-white/5" />
          <p className="text-xs text-muted-foreground mt-3">
            Gemini is reading your tasks, estimating time, and building your schedule…
          </p>
        </GlassCard>
      )}

      {planMut.data && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold">{planMut.data.summary}</h2>
          </div>
          <ul className="space-y-2">
            {planMut.data.tasks?.map((t: any, i: number) => (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-xl p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {relativeDeadline(t.deadline)} · {t.estimated_minutes}m · {t.category}
                    </div>
                    {t.ai_reasoning && (
                      <div className="text-xs text-muted-foreground/80 mt-2 italic">
                        "{t.ai_reasoning}"
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
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
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </GlassCard>
      )}

      {planMut.isError && (
        <GlassCard className="border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-300">
            <AlertTriangle className="h-4 w-4" />{" "}
            {(planMut.error as any)?.message || "Something went wrong"}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
