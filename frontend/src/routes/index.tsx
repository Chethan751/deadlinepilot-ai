import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatedBg } from "@/components/app/animated-bg";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/app/glass-card";
import { Rocket, Sparkles, Timer, BarChart3, ListChecks, MessageCircle, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DeadlinePilot AI — Your Autonomous Productivity Companion" },
      { name: "description", content: "AI that extracts, prioritizes, and schedules your tasks before deadlines slip. Powered by Gemini." },
      { property: "og:title", content: "DeadlinePilot AI" },
      { property: "og:description", content: "Plan, prioritize, and finish before the deadline — autonomously." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Sparkles, title: "AI Planner", desc: "Brain-dump in plain English. Gemini extracts every task, estimates time, sets priority." },
  { icon: ListChecks, title: "Smart Tasks", desc: "Each task ranked by urgency, risk, and deadline pressure — updated live." },
  { icon: Timer, title: "Focus Mode", desc: "Built-in Pomodoro timer logs every deep work session automatically." },
  { icon: MessageCircle, title: "AI Coach", desc: "Ask anytime: 'what should I do now?' Get a clear, motivating answer." },
  { icon: BarChart3, title: "Analytics", desc: "See your completion patterns, streaks, and where you tend to stall." },
  { icon: Zap, title: "Autonomous", desc: "Not a reminder app. DeadlinePilot decides what matters next, for you." },
];

function Landing() {
  const nav = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) nav({ to: "/dashboard", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [nav]);
  return (
    <div className="relative min-h-screen">
      <AnimatedBg />

      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-primary shadow-[var(--shadow-glow)]"><Rocket className="h-4 w-4 text-white" /></div>
          <span className="font-display text-lg font-bold">DeadlinePilot</span>
        </div>
        <Link to="/auth"><Button variant="outline" className="glass border-white/10">Sign in</Button></Link>
      </header>

      <section className="px-6 pt-12 pb-20 max-w-5xl mx-auto text-center">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-white/10 text-xs text-muted-foreground mb-6">
          <Sparkles className="h-3 w-3 text-primary" /> Powered by Gemini 3 · Vibe2Ship Hackathon
        </motion.div>
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
          The last-minute<br/><span className="text-gradient">life saver.</span>
        </motion.h1>
        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          DeadlinePilot is an autonomous AI companion that plans, prioritizes, and pushes you across the finish line — before the deadline becomes a regret.
        </motion.p>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-primary text-white shadow-[var(--shadow-glow)] text-base h-12 px-7">
              Get started free <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="glass border-white/10 text-base h-12 px-7">See it in action</Button>
          </Link>
        </motion.div>
      </section>

      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.05}}>
                <GlassCard className="h-full">
                  <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center mb-3"><Icon className="h-5 w-5 text-white" /></div>
                  <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <GlassCard className="p-10 text-center bg-gradient-to-br from-primary/10 to-secondary/10">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Stop missing deadlines.</h2>
          <p className="text-muted-foreground mt-2">Let DeadlinePilot decide what matters next.</p>
          <Link to="/auth"><Button size="lg" className="mt-6 bg-gradient-primary text-white shadow-[var(--shadow-glow)]">Take the controls →</Button></Link>
        </GlassCard>
      </section>

      <footer className="px-6 py-8 text-center text-xs text-muted-foreground border-t border-white/5">
        © {new Date().getFullYear()} DeadlinePilot AI · Built for Vibe2Ship
      </footer>
    </div>
  );
}
