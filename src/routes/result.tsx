import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { sortedLeaderboard } from "@/lib/quiz-storage";
import { Confetti } from "@/components/Confetti";
import { sfx } from "@/lib/sfx";

const search = z.object({ id: z.number() });

export const Route = createFileRoute("/result")({
  validateSearch: (s) => search.parse(s),
  component: Result,
});

function Result() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const board = useMemo(() => sortedLeaderboard(), []);
  const entry = board.find(e => e.playedAt === id);
  const rank = entry ? board.findIndex(e => e.playedAt === id) + 1 : 0;
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (!entry) navigate({ to: "/" });
    else if (rank <= 3) { setConfetti(true); sfx.win(); }
  }, [entry, rank, navigate]);

  if (!entry) return null;

  const pct = Math.round((entry.correct / entry.total) * 100);
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <>
      <Confetti active={confetti} />
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-lg text-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Round Complete</div>
          {medal && <div className="mt-4 text-7xl animate-medal inline-block">{medal}</div>}
          <h1 className="mt-4 font-display font-black text-5xl neon-text">{entry.score}</h1>
          <p className="text-muted-foreground mt-1">points</p>

          <div className="mt-8 glass rounded-2xl p-6 grid grid-cols-2 gap-4 text-left">
            <Cell label="Rank" value={`#${rank}`} />
            <Cell label="Accuracy" value={`${pct}%`} />
            <Cell label="Correct" value={`${entry.correct}/${entry.total}`} />
            <Cell label="Max Streak" value={`🔥 ${entry.maxStreak}`} />
            <Cell label="Time" value={`${(entry.timeMs / 1000).toFixed(1)}s`} />
            <Cell label="Player" value={entry.name} />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/lobby" className="btn-neon">↻ Play Again</Link>
            <Link to="/leaderboard" className="btn-ghost-neon">🏆 Leaderboard</Link>
          </div>
        </div>
      </div>
    </>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display font-bold text-lg truncate">{value}</div>
    </div>
  );
}
