import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Registration = {
  id: string;
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

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [reg, setReg] = useState<Registration | null>(null);
  const [regLoading, setRegLoading] = useState(true);

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
      setReg(data as Registration | null);
      setRegLoading(false);
    })();
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (loading || !user) return <div className="min-h-screen grid place-items-center text-sm">Loading…</div>;

  return (
    <div className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between border-b-2 border-foreground pb-3">
          <Link to="/" className="font-display text-xl tracking-wider">★ POP·QUIZ</Link>
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest">
            {isAdmin && <Link to="/admin" className="underline">Admin</Link>}
            <button onClick={signOut} className="underline">Sign out</button>
          </div>
        </header>

        <h1 className="mt-6 font-serif text-4xl">Hi, {user.email}</h1>

        {regLoading ? (
          <div className="mt-6 text-sm text-muted-foreground">Loading your registration…</div>
        ) : reg ? (
          <RegCard reg={reg} />
        ) : (
          <div className="mt-6 paper p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">No registration yet</div>
            <div className="mt-1 font-serif text-2xl">Register for the next round</div>
            <p className="text-sm text-muted-foreground mt-1">
              Fill the form, pay Rs 10, then show up to play in class.
            </p>
            <Link to="/register" className="btn-retro mt-4 inline-block">Register now →</Link>
          </div>
        )}

        <div className="mt-6 flex gap-3 flex-wrap">
          <Link to="/leaderboard" className="btn-retro-ghost">Leaderboard</Link>
          <Link to="/lobby" className="btn-retro-ghost">Practice quiz</Link>
        </div>
      </div>
    </div>
  );
}

function RegCard({ reg }: { reg: Registration }) {
  const statusColors: Record<Registration["status"], string> = {
    pending: "bg-yellow-200 text-foreground",
    paid: "bg-blue-200 text-foreground",
    verified: "bg-green-200 text-foreground",
    rejected: "bg-destructive text-destructive-foreground",
  };
  return (
    <div className="mt-6 paper p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Your registration</div>
          <div className="mt-1 font-serif text-2xl">@{reg.username}</div>
        </div>
        <span className={`px-2 py-1 text-xs uppercase tracking-widest border border-foreground rounded ${statusColors[reg.status]}`}>
          {reg.status}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Row k="Name" v={reg.full_name} />
        <Row k="Class" v={reg.class_name} />
        <Row k="Phone" v={reg.phone} />
        <Row k="Payment" v={reg.payment_method === "esewa" ? "eSewa" : "Cash"} />
        {reg.esewa_txn_code && <Row k="eSewa code" v={reg.esewa_txn_code} />}
      </dl>
      {reg.admin_note && (
        <div className="mt-4 paper-soft p-3 text-sm">
          <span className="font-semibold">Admin note:</span> {reg.admin_note}
        </div>
      )}
      {reg.status === "pending" && (
        <div className="mt-4 text-xs text-muted-foreground">
          Waiting for the host to verify your payment. You'll see "verified" once you're confirmed.
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}
