export function AnimatedBg() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full bg-[oklch(0.68_0.22_295/0.35)] blur-3xl animate-blob" />
      <div className="absolute top-1/3 -right-40 h-[36rem] w-[36rem] rounded-full bg-[oklch(0.62_0.20_255/0.32)] blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />
      <div className="absolute -bottom-40 left-1/4 h-[34rem] w-[34rem] rounded-full bg-[oklch(0.70_0.20_200/0.25)] blur-3xl animate-blob" style={{ animationDelay: "-12s" }} />
    </div>
  );
}