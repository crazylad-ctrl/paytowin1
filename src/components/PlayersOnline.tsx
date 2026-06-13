import { useEffect, useState } from "react";

export function PlayersOnline() {
  const [n, setN] = useState(24);
  useEffect(() => {
    const id = setInterval(() => {
      setN(prev => Math.max(12, Math.min(48, prev + Math.floor(Math.random() * 7) - 3)));
    }, 2500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-foreground rounded text-xs font-mono">
      <span className="inline-block h-2 w-2 rounded-full bg-foreground animate-blink" />
      <span className="font-bold">{n}</span>
      <span className="uppercase tracking-widest text-muted-foreground">registered today</span>
    </div>
  );
}
