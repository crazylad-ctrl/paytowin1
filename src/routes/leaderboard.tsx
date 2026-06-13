import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { sortedLeaderboard } from "@/lib/quiz-storage";
import { CATEGORIES } from "@/lib/quiz-data";

export const Route = createFileRoute("/leaderboard")({
  component: Leaderboard,
});

const medalStyle = (rank: number) => {
  if (rank === 1) return { color: "var(--gold)", glow: "oklch(0.85 0.17 90 / 0.6)", emoji: "🥇" };
  if (rank === 2) return { color: "var(--silver)", glow: "oklch(0.85 0.02 250 / 0.5)", emoji: "🥈" };
  if (rank === 3) return { color: "var(--bronze)", glow: "oklch(0.65 0.13 55 / 0.5)", emoji: "🥉" };
  return null;
};

function Leaderboard() {
  const board = useMemo(() => sortedLeaderboard().slice(0, 50), []);
  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest">← Home</Link>
        <h1 className="mt-4 font-display font-black text-5xl text-center neon-text">🏆 Leaderboard</h1>
        <p className="text-center text-muted-foreground mt-2">Top minds in the arena</p>

        {board.length === 0 ? (
          <div className="mt-12 glass rounded-2xl p-10 text-center text-muted-foreground">
            No scores yet. <Link to="/register" className="neon-text underline">Be the first.</Link>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {board.map((e, i) => {
              const rank = i + 1;
              const m = medalStyle(rank);
              const cat = CATEGORIES.find(c => c.id === e.category);
              return (
                <div
                  key={e.playedAt}
                  style={{
                    animationDelay: `${i * 40}ms`,
                    borderColor: m?.color ?? undefined,
                    boxShadow: m ? `0 0 20px ${m.glow}` : undefined,
                  }}
                  className="animate-float-up glass rounded-2xl p-4 flex items-center gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-xl grid place-items-center font-display font-black text-xl shrink-0"
                    style={{ color: m?.color ?? "var(--neon-cyan)", background: "color-mix(in oklab, var(--card) 80%, transparent)" }}
                  >
                    {m ? m.emoji : `#${rank}`}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold truncate">{e.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {cat?.emoji} {cat?.label} · 🔥{e.maxStreak} · {(e.timeMs / 1000).toFixed(1)}s
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-black text-2xl neon-text">{e.score}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{e.correct}/{e.total}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/lobby" className="btn-neon">⚡ Play Now</Link>
        </div>
      </div>
    </div>
  );
}
