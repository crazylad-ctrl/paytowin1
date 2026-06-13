import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setErr(null);
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (r.error) setErr(r.error.message ?? "Google sign-in failed");
  };

  return (
    <div className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-md">
        <Link to="/" className="text-xs uppercase tracking-widest underline">← Back</Link>
        <h1 className="mt-4 font-serif text-4xl">
          {mode === "signup" ? "Create account" : "Sign in"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {mode === "signup"
            ? "Make an account to register for the quiz."
            : "Welcome back. Log in to manage your registration."}
        </p>

        <form onSubmit={submit} className="mt-6 paper p-5 space-y-4">
          {mode === "signup" && (
            <Field label="Your name" value={displayName} onChange={setDisplayName} placeholder="Aarav Sharma" />
          )}
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
          <Field label="Password" value={password} onChange={setPassword} placeholder="••••••" type="password" />
          {err && <div className="text-sm bg-destructive text-destructive-foreground border border-foreground rounded px-3 py-2">{err}</div>}
          <button type="submit" disabled={busy} className="btn-retro w-full disabled:opacity-50">
            {busy ? "..." : mode === "signup" ? "Create account →" : "Sign in →"}
          </button>
        </form>

        <div className="mt-3 text-center text-xs uppercase tracking-widest text-muted-foreground">or</div>

        <button onClick={google} className="btn-retro-ghost w-full mt-3">
          Continue with Google
        </button>

        <div className="mt-6 text-center text-sm">
          {mode === "signup" ? (
            <button onClick={() => setMode("signin")} className="underline">Already have an account? Sign in</button>
          ) : (
            <button onClick={() => setMode("signup")} className="underline">No account yet? Create one</button>
          )}
        </div>

        {mode === "signup" && (
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Note: you may need to confirm your email before signing in (check spam too).
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">{label}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        className="w-full bg-input border border-foreground rounded px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition"
      />
    </label>
  );
}
