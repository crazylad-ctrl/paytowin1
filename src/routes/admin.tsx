import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Reg = {
  id: string;
  user_id: string;
  full_name: string;
  class_name: string;
  phone: string;
  username: string;
  payment_method: "esewa" | "cash";
  esewa_txn_code: string | null;
  status: "pending" | "paid" | "verified" | "rejected";
  admin_note: string | null;
  created_at: string;
};

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [regs, setRegs] = useState<Reg[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Reg["status"]>("all");

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (!isAdmin) navigate({ to: "/dashboard" });
  }, [user, isAdmin, loading, navigate]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRegs(data as Reg[]);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const updateStatus = async (id: string, status: Reg["status"]) => {
    setBusy(id);
    const patch: any = { status };
    if (status === "verified") {
      patch.verified_by = user!.id;
      patch.verified_at = new Date().toISOString();
    }
    const { error } = await supabase.from("registrations").update(patch).eq("id", id);
    if (error) alert(error.message);
    await load();
    setBusy(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this registration?")) return;
    setBusy(id);
    const { error } = await supabase.from("registrations").delete().eq("id", id);
    if (error) alert(error.message);
    await load();
    setBusy(null);
  };

  if (loading || !user || !isAdmin) {
    return <div className="min-h-screen grid place-items-center text-sm">Loading…</div>;
  }

  const filtered = filter === "all" ? regs : regs.filter(r => r.status === filter);
  const counts = {
    all: regs.length,
    pending: regs.filter(r => r.status === "pending").length,
    paid: regs.filter(r => r.status === "paid").length,
    verified: regs.filter(r => r.status === "verified").length,
    rejected: regs.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between border-b-2 border-foreground pb-3">
          <Link to="/dashboard" className="font-display text-xl tracking-wider">★ ADMIN</Link>
          <Link to="/dashboard" className="text-xs uppercase tracking-widest underline">Dashboard</Link>
        </header>

        <h1 className="mt-6 font-serif text-4xl">Registrations</h1>
        <p className="mt-1 text-muted-foreground">Verify payments and confirm players for the round.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["all", "pending", "paid", "verified", "rejected"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs uppercase tracking-widest px-3 py-1.5 border-2 border-foreground rounded ${
                filter === f ? "bg-foreground text-background" : ""
              }`}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {filtered.length === 0 && (
            <div className="paper-soft p-5 text-sm text-muted-foreground text-center">
              No registrations here yet.
            </div>
          )}
          {filtered.map(r => (
            <div key={r.id} className="paper p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-serif text-xl">{r.full_name} <span className="text-muted-foreground text-base">@{r.username}</span></div>
                  <div className="text-sm text-muted-foreground">
                    {r.class_name} · {r.phone} · {r.payment_method === "esewa" ? "eSewa" : "Cash"}
                    {r.esewa_txn_code && ` · code: ${r.esewa_txn_code}`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs uppercase tracking-widest border border-foreground rounded ${
                  r.status === "verified" ? "bg-green-200" :
                  r.status === "paid" ? "bg-blue-200" :
                  r.status === "rejected" ? "bg-destructive text-destructive-foreground" :
                  "bg-yellow-200"
                }`}>
                  {r.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button disabled={busy === r.id} onClick={() => updateStatus(r.id, "paid")} className="btn-retro-ghost text-xs">Mark Paid</button>
                <button disabled={busy === r.id} onClick={() => updateStatus(r.id, "verified")} className="btn-retro text-xs">Verify ✓</button>
                <button disabled={busy === r.id} onClick={() => updateStatus(r.id, "pending")} className="btn-retro-ghost text-xs">Reset</button>
                <button disabled={busy === r.id} onClick={() => updateStatus(r.id, "rejected")} className="btn-retro-ghost text-xs">Reject</button>
                <button disabled={busy === r.id} onClick={() => remove(r.id)} className="text-xs underline text-destructive-foreground bg-destructive border border-foreground rounded px-2">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
