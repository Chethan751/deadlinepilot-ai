import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/app/glass-card";
import { AnimatedBg } from "@/components/app/animated-bg";
import { toast } from "sonner";
import { Rocket, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — DeadlinePilot AI" }] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/dashboard" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) nav({ to: "/dashboard" });
    });
    return () => sub.subscription.unsubscribe();
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Account created — check your email if confirmation is on.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) toast.error("Google sign-in failed");
    if (!res.error && !res.redirected) nav({ to: "/dashboard", replace: true });
    setBusy(false);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <AnimatedBg />
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-primary shadow-[var(--shadow-glow)]">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold">DeadlinePilot</span>
        </Link>
        <GlassCard className="p-7">
          <h1 className="font-display text-2xl font-bold">
            {mode === "signin" ? "Welcome back" : "Take flight"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Sign in to your autonomous companion" : "Create your DeadlinePilot account"}
          </p>

          <Button onClick={google} disabled={busy} variant="outline" className="w-full mt-5 glass border-white/10">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="#fff" d="M21.35 11.1H12v3.2h5.35c-.23 1.23-1.46 3.6-5.35 3.6-3.22 0-5.84-2.66-5.84-5.95s2.62-5.95 5.84-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.83 3.5 14.65 2.5 12 2.5 6.76 2.5 2.5 6.76 2.5 12S6.76 21.5 12 21.5c6.93 0 9.5-4.85 9.5-7.34 0-.5-.05-.84-.15-1.06Z"/></svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 my-5 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-white/10" /> OR <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" className="glass border-white/10 mt-1" />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="glass border-white/10 mt-1" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="glass border-white/10 mt-1" />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-white shadow-[var(--shadow-glow)] hover:opacity-95">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 text-sm text-muted-foreground hover:text-foreground w-full text-center"
          >
            {mode === "signin" ? "New here? Create an account →" : "Already have an account? Sign in →"}
          </button>
        </GlassCard>
      </div>
    </div>
  );
}