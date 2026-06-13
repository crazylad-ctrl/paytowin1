import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { setPlayer } from "@/lib/quiz-storage";

export const Route = createFileRoute("/register")({
  component: Register,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  class_name: z.string().trim().min(1, "Enter your class").max(40),
  phone: z.string().trim().regex(/^\d{7,15}$/, "Phone: 7–15 digits"),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,20}$/, "Username: 3–20 chars, a–z, 0–9, _"),
  payment_method: z.enum(["esewa", "cash"]),
  esewa_txn_code: z.string().trim().max(60).optional(),
});

function Register() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    class_name: "",
    phone: "",
    username: "",
    payment_method: "esewa" as "esewa" | "cash",
    esewa_txn_code: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("registrations")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setExisting(true);
        setForm({
          full_name: data.full_name,
          class_name: data.class_name,
          phone: data.phone,
          username: data.username,
          payment_method: data.payment_method,
          esewa_txn_code: data.esewa_txn_code ?? "",
        });
      }
    })();
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErr(parsed.error.issues[0].message);
      return;
    }
    if (!user) return;
    setBusy(true);
    try {
      const payload = {
        user_id: user.id,
        full_name: parsed.data.full_name,
        class_name: parsed.data.class_name,
        phone: parsed.data.phone,
        username: parsed.data.username,
        payment_method: parsed.data.payment_method,
        esewa_txn_code: parsed.data.esewa_txn_code || null,
      };
      const { error } = await supabase
        .from("registrations")
        .upsert(payload, { onConflict: "user_id" });
      if (error) {
        if (error.message.includes("registrations_username_key")) {
          throw new Error("That username is already taken.");
        }
        throw error;
      }
      // sync local player so quiz still works
      setPlayer({
        name: parsed.data.full_name,
        className: parsed.data.class_name,
        phone: parsed.data.phone,
        username: parsed.data.username,
      });
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      setErr(e.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) return <div className="min-h-screen grid place-items-center text-sm">Loading…</div>;

  return (
    <div className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-md">
        <Link to="/dashboard" className="text-xs uppercase tracking-widest underline">← Back</Link>
        <h1 className="mt-4 font-serif text-4xl">{existing ? "Update registration" : "Register"}</h1>
        <p className="mt-1 text-muted-foreground">Fill the form, then pay Rs 10 to lock your seat.</p>

        <div className="mt-5 paper-soft p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Pay Rs 10 to</div>
          <div className="mt-1 font-serif text-2xl">eSewa · <span className="stamp-text">9866291315</span></div>
          <div className="text-xs text-muted-foreground mt-1">Or pay cash to the host in class. Winner gets Rs 50.</div>
        </div>

        <form onSubmit={submit} className="mt-5 paper p-5 space-y-4">
          <Field label="Full Name" value={form.full_name} onChange={v => setForm(f => ({ ...f, full_name: v }))} placeholder="Aarav Sharma" />
          <Field label="Class / Grade" value={form.class_name} onChange={v => setForm(f => ({ ...f, class_name: v }))} placeholder="Grade 10" />
          <Field label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v.replace(/\D/g, "") }))} placeholder="98XXXXXXXX" inputMode="tel" />
          <Field label="Username" value={form.username} onChange={v => setForm(f => ({ ...f, username: v.toLowerCase() }))} placeholder="quiz_lord_99" />

          <div>
            <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Payment method</span>
            <div className="grid grid-cols-2 gap-2">
              {(["esewa", "cash"] as const).map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setForm(f => ({ ...f, payment_method: m }))}
                  className={`border-2 rounded px-3 py-2 text-sm uppercase tracking-widest ${
                    form.payment_method === m ? "border-foreground bg-foreground text-background" : "border-foreground/30"
                  }`}
                >
                  {m === "esewa" ? "eSewa" : "Cash"}
                </button>
              ))}
            </div>
          </div>

          {form.payment_method === "esewa" && (
            <Field
              label="eSewa transaction code (optional)"
              value={form.esewa_txn_code}
              onChange={v => setForm(f => ({ ...f, esewa_txn_code: v }))}
              placeholder="e.g. AB12CD34"
            />
          )}

          {err && <div className="text-sm text-destructive-foreground bg-destructive border border-foreground rounded px-3 py-2">{err}</div>}

          <button type="submit" disabled={busy} className="btn-retro w-full disabled:opacity-50">
            {busy ? "Saving…" : existing ? "Update registration" : "Submit registration →"}
          </button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          The host will verify your payment manually. You'll see your status on your dashboard.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, inputMode }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; inputMode?: "tel";
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">{label}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full bg-input border border-foreground rounded px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition"
      />
    </label>
  );
}
