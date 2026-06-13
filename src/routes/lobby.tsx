import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CATEGORIES, type Category } from "@/lib/quiz-data";
import { getPlayer } from "@/lib/quiz-storage";
import { PlayersOnline } from "@/components/PlayersOnline";
import { useEffect } from "react";
import { sfx } from "@/lib/sfx";

export const Route = createFileRoute("/lobby")({
  component: Lobby,
});

function Lobby() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getPlayer()) navigate({ to: "/register" });
  }, [navigate]);
  const p = getPlayer();

  const start = (cat: Category) => {
    sfx.click();
    navigate({ to: "/quiz", search: { cat } });
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest">← Home</Link>
            <h1 className="mt-2 font-display font-black text-4xl neon-text-purple">Lobby</h1>
            <p className="mt-1 text-muted-foreground">Welcome back, <span className="text-foreground font-semibold">{p?.name}</span></p>
          </div>
          <PlayersOnline />
        </div>

        <h2 className="mt-10 font-display text-lg uppercase tracking-widest text-muted-foreground">Pick your category</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => start(c.id)}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-float-up text-left glass rounded-2xl p-6 hover:[border-color:color-mix(in_oklab,var(--neon-cyan)_70%,transparent)] hover:[box-shadow:0_0_28px_color-mix(in_oklab,var(--neon-purple)_30%,transparent)] hover:-translate-y-1 transition"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{c.emoji}</div>
                <div>
                  <div className="font-display font-bold text-xl">{c.label}</div>
                  <div className="text-sm text-muted-foreground">{c.blurb}</div>
                </div>
              </div>
              <div className="mt-4 text-xs uppercase tracking-widest neon-text">Start Round →</div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/leaderboard" className="btn-ghost-neon">🏆 View Leaderboard</Link>
        </div>
      </div>
    </div>
  );
}
