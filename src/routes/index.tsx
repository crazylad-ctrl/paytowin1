import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayersOnline } from "@/components/PlayersOnline";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user, isAdmin } = useAuth();
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
        <header className="flex items-center justify-between border-b-2 border-foreground pb-3">
          <div className="font-display text-2xl tracking-wider">★ POP·QUIZ</div>
          <nav className="flex items-center gap-3 text-xs uppercase tracking-widest">
            {user ? (
              <>
                {isAdmin && <Link to="/admin" className="underline">Admin</Link>}
                <Link to="/dashboard" className="underline">Dashboard</Link>
              </>
            ) : (
              <Link to="/auth" className="underline">Sign in</Link>
            )}
          </nav>
        </header>

        <section className="mt-10 text-center">
          <div className="inline-block px-2 py-0.5 border border-foreground text-xs uppercase tracking-widest">
            Register here · Play IRL
          </div>
          <h1 className="mt-5 font-serif text-5xl sm:text-6xl leading-[1.05]">
            A tiny <span className="hl">pop quiz</span><br/>
            for your <span className="italic">class.</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg max-w-lg mx-auto text-muted-foreground">
            Sign up online, pay <span className="font-bold text-foreground">Rs 10</span> via eSewa or cash,
            then show up and play in real life. Winner of the round walks home with
            <span className="font-bold text-foreground"> Rs 50</span>.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={user ? "/register" : "/auth"} className="btn-retro">
              ▶ {user ? "Register" : "Sign up to register"}
            </Link>
            <Link to="/leaderboard" className="btn-retro-ghost">Leaderboard</Link>
          </div>

          <div className="mt-4">
            <PlayersOnline />
          </div>
        </section>

        {/* how it works */}
        <section className="mt-14">
          <h2 className="font-display text-2xl tracking-wider uppercase">How it works</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { n: "01", t: "Register", d: "Name, class, phone, username." },
              { n: "02", t: "Pay Rs 10", d: "eSewa to 9866291315, or cash on hand." },
              { n: "03", t: "Play IRL", d: "Join the round in class. Top score wins Rs 50." },
            ].map((s) => (
              <li key={s.n} className="paper-soft p-4">
                <div className="font-display text-3xl">{s.n}</div>
                <div className="mt-1 font-serif text-xl">{s.t}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.d}</div>
              </li>
            ))}
          </ol>
        </section>

        {/* esewa card */}
        <section className="mt-10 paper p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Payment</div>
              <div className="mt-1 font-serif text-2xl">eSewa · 9866291315</div>
              <div className="text-sm text-muted-foreground mt-1">
                Send Rs 10, then bring a screenshot or pay cash to the host.
              </div>
            </div>
            <div className="font-display text-4xl stamp-text border-2 border-current rounded px-3 py-1 rotate-[-4deg]">
              Rs 10
            </div>
          </div>
        </section>

        {/* features */}
        <section className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { t: "4 categories", d: "GK · Anime · School · Chaos" },
            { t: "Streak bonus", d: "+2 every 3 in a row" },
            { t: "50/50 lifeline", d: "Cut two wrong options" },
          ].map((f) => (
            <div key={f.t} className="paper-soft p-4">
              <div className="font-serif text-xl">{f.t}</div>
              <div className="text-sm text-muted-foreground">{f.d}</div>
            </div>
          ))}
        </section>

        <footer className="mt-14 pt-4 border-t-2 border-foreground text-center text-xs uppercase tracking-widest text-muted-foreground">
          © Pop·Quiz · Play fair · No phones during round
        </footer>
      </div>
    </div>
  );
}
