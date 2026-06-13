import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { CATEGORIES, QUESTIONS, type Category } from "@/lib/quiz-data";
import { addLeaderboardEntry, getPlayer } from "@/lib/quiz-storage";
import { sfx } from "@/lib/sfx";

const search = z.object({ cat: z.enum(["general", "anime", "school", "chaos"]) });

export const Route = createFileRoute("/quiz")({
  validateSearch: (s) => search.parse(s),
  component: Quiz,
});

const QUESTION_TIME = 15;
const MEMES = ["💀", "😭", "🤡", "🧠❌", "BRUH MOMENT", "skill issue tbh", "no thoughts head empty"];

function Quiz() {
  const { cat } = Route.useSearch();
  const navigate = useNavigate();
  const player = getPlayer();
  const category = CATEGORIES.find(c => c.id === cat)!;

  const questions = useMemo(() => {
    const all = [...QUESTIONS[cat as Category]];
    return all.sort(() => Math.random() - 0.5).slice(0, 10);
  }, [cat]);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [time, setTime] = useState(QUESTION_TIME);
  const [chosen, setChosen] = useState<number | null>(null);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [lifelineUsed, setLifelineUsed] = useState(false);
  const [meme, setMeme] = useState<string | null>(null);
  const [warned, setWarned] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!player) { navigate({ to: "/register" }); return; }
    history.pushState(null, "", location.href);
    const block = () => history.pushState(null, "", location.href);
    window.addEventListener("popstate", block);
    const onVis = () => {
      if (document.hidden && !warned) setWarned(true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("popstate", block);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [navigate, player, warned]);

  // Timer
  useEffect(() => {
    if (chosen !== null) return;
    if (time <= 0) { handleAnswer(-1); return; }
    const id = setTimeout(() => {
      if (time <= 4) sfx.tick();
      setTime(t => t - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [time, chosen]);

  const q = questions[idx];

  const handleAnswer = (choice: number) => {
    if (chosen !== null) return;
    setChosen(choice);
    const right = choice === q.answer;
    if (right) {
      sfx.correct();
      setCorrect(c => c + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(m => Math.max(m, newStreak));
      const bonus = newStreak > 0 && newStreak % 3 === 0 ? 5 : 0;
      const timeBonus = Math.max(0, time);
      setScore(s => s + 10 + bonus + timeBonus);
    } else {
      sfx.wrong();
      setStreak(0);
      setMeme(MEMES[Math.floor(Math.random() * MEMES.length)]);
    }
    setTimeout(() => {
      setMeme(null);
      if (idx + 1 >= questions.length) finish(right);
      else { setIdx(idx + 1); setTime(QUESTION_TIME); setChosen(null); setEliminated([]); }
    }, 1400);
  };

  const finish = (lastRight: boolean) => {
    const finalCorrect = correct + (lastRight ? 1 : 0);
    const entry = {
      username: player!.username,
      name: player!.name,
      category: cat as Category,
      score,
      correct: finalCorrect,
      total: questions.length,
      timeMs: Date.now() - startRef.current,
      maxStreak,
      playedAt: Date.now(),
    };
    addLeaderboardEntry(entry);
    navigate({ to: "/result", search: { id: entry.playedAt } });
  };

  const useLifeline = () => {
    if (lifelineUsed || chosen !== null) return;
    const wrongs = q.choices.map((_, i) => i).filter(i => i !== q.answer);
    const shuffled = wrongs.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminated(shuffled);
    setLifelineUsed(true);
    sfx.click();
  };

  const progress = (time / QUESTION_TIME) * 100;

  return (
    <div className="min-h-screen px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        {/* HUD */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] sm:flex sm:items-center sm:justify-between gap-3 mb-6">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{category.emoji} {category.label}</div>
            <div className="font-display font-bold truncate">Q {idx + 1} <span className="text-muted-foreground">/ {questions.length}</span></div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Stat label="Score" value={score} accent="cyan" />
            <Stat label="Streak" value={`🔥${streak}`} accent="purple" />
          </div>
        </div>

        {/* Timer */}
        <div className="h-2 rounded-full bg-input overflow-hidden mb-6">
          <div
            className="h-full transition-all duration-1000 ease-linear"
            style={{
              width: `${progress}%`,
              background: time <= 4
                ? "linear-gradient(90deg, oklch(0.65 0.25 20), oklch(0.7 0.25 350))"
                : "linear-gradient(90deg, var(--neon-cyan), var(--neon-purple))",
              boxShadow: "0 0 12px color-mix(in oklab, var(--neon-cyan) 60%, transparent)",
            }}
          />
        </div>

        {/* Question */}
        <div key={idx} className="glass rounded-2xl p-6 sm:p-8 animate-float-up">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            <span>Question</span>
            <span className={time <= 4 ? "text-destructive font-bold" : ""}>{time}s</span>
          </div>
          <h2 className="mt-3 font-display font-bold text-xl sm:text-2xl leading-snug">{q.q}</h2>

          <div className="mt-6 grid gap-3">
            {q.choices.map((c, i) => {
              const isChosen = chosen === i;
              const isRight = chosen !== null && i === q.answer;
              const isWrong = isChosen && i !== q.answer;
              const isElim = eliminated.includes(i);
              return (
                <button
                  key={i}
                  disabled={chosen !== null || isElim}
                  onClick={() => handleAnswer(i)}
                  className={[
                    "text-left px-4 py-3 rounded-xl border transition font-medium",
                    "disabled:cursor-not-allowed",
                    isElim ? "opacity-30 line-through" : "",
                    chosen === null
                      ? "bg-input/40 border-border hover:border-[color:var(--neon-cyan)] hover:bg-[color:color-mix(in_oklab,var(--neon-cyan)_10%,transparent)]"
                      : isRight
                        ? "bg-[color:color-mix(in_oklab,var(--success)_25%,transparent)] border-[color:var(--success)]"
                        : isWrong
                          ? "bg-[color:color-mix(in_oklab,var(--destructive)_25%,transparent)] border-destructive animate-shake"
                          : "bg-input/30 border-border opacity-60",
                  ].join(" ")}
                >
                  <span className="inline-block w-6 font-display font-bold neon-text">{String.fromCharCode(65 + i)}</span>
                  {c}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={useLifeline}
              disabled={lifelineUsed || chosen !== null}
              className="btn-ghost-neon text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ⚡ 50/50 {lifelineUsed ? "Used" : "Lifeline"}
            </button>
            <div className="text-xs text-muted-foreground">✅ {correct} correct</div>
          </div>
        </div>

        {warned && (
          <div className="mt-4 text-center text-xs text-destructive">⚠ Anti-cheat: tab-switch detected</div>
        )}
      </div>

      {meme && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-purple rounded-3xl px-10 py-8 text-center animate-float-up">
            <div className="text-6xl">{q.choices.length && "❌"}</div>
            <div className="mt-3 font-display font-black text-2xl neon-text-purple">{meme}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent: "cyan" | "purple" }) {
  return (
    <div className="glass rounded-xl px-3 py-1.5 text-right min-w-[72px]">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display font-bold ${accent === "cyan" ? "neon-text" : "neon-text-purple"}`}>{value}</div>
    </div>
  );
}
