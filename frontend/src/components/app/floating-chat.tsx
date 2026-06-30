import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({ api: "/api/chat" } as any);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const loading = status === "submitted" || status === "streaming";

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-gradient-primary shadow-[var(--shadow-glow)] grid place-items-center text-white hover:scale-105 transition"
        aria-label="AI assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
      <div
        className={cn(
          "fixed bottom-24 right-5 z-40 w-[min(380px,calc(100vw-2rem))] h-[520px] glass-strong rounded-2xl flex flex-col overflow-hidden transition-all origin-bottom-right",
          open
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-95 opacity-0 pointer-events-none",
        )}
      >
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
          <div className="grid place-items-center h-7 w-7 rounded-lg bg-gradient-primary">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-sm">DeadlinePilot AI</div>
            <div className="text-[10px] text-muted-foreground">Your autonomous coach</div>
          </div>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
          {messages.length === 0 && (
            <div className="text-muted-foreground text-center mt-10">
              Ask me anything.
              <br />
              <span className="text-xs">"What should I do now?" · "Am I behind schedule?"</span>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2",
                  m.role === "user" ? "bg-gradient-primary text-white" : "glass",
                )}
              >
                <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1">
                  <ReactMarkdown>
                    {m.parts.map((p: any) => (p.type === "text" ? p.text : "")).join("")}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && <div className="text-muted-foreground text-xs">Thinking…</div>}
        </div>
        <form onSubmit={send} className="p-3 border-t border-white/10 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask DeadlinePilot…"
            className="glass border-white/10"
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            className="bg-gradient-primary shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
