import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setOtpSent(true);
      setMsg("Code sent! Check your email (and spam folder).");
    } catch (e: any) {
      setErr(e.message ?? "Failed to send code");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email, token: otpCode, type: "email",
      });
      if (error) throw error;
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      setErr(e.message ?? "Invalid or expired code");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setErr(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setErr(error.message);
  };

  return (
    <div className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-md">
        <Link to="/" className="text-xs uppercase tracking-widest underline">← Back</Link>
        <h1 className="mt-4 font-serif text-4xl">Sign in</h1>
        <p className="mt-1 text-muted-foreground">Sign in or create an account to register for the quiz.</p>

        <button onClick={google} className="btn-retro-ghost w-full mt-5 flex items-center justify-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="mt-5 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <div className="flex-1 border-t border-foreground/20" />or<div className="flex-1 border-t border-foreground/20" />
        </div>

        <div className="mt-4 paper p-5 space-y-4">
          {!otpSent ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
              {err && <p className="text-sm bg-destructive text-destructive-foreground border border-foreground rounded px-3 py-2">{err}</p>}
              <button type="submit" disabled={busy} className="btn-retro w-full disabled:opacity-50">
                {busy ? "Sending..." : "Send OTP Code →"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
              <Field label="6-digit code" value={otpCode} onChange={setOtpCode} placeholder="123456" />
              {err && <p className="text-sm bg-destructive text-destructive-foreground border border-foreground rounded px-3 py-2">{err}</p>}
              <button type="submit" disabled={busy} className="btn-retro w-full disabled:opacity-50">
                {busy ? "Verifying..." : "Verify Code →"}
              </button>
              <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); setErr(null); }} className="w-full text-xs underline text-muted-foreground">
                ← Use a different email
              </button>
            </form>
          )}
        </div>
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
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
        className="w-full bg-input border border-foreground rounded px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition" />
    </label>
  );
}
