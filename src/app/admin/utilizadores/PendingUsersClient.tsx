"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, UserCheck } from "lucide-react";
import { approveUserAction, rejectUserAction, type PendingUser } from "@/actions/superadmin";

export function PendingUsersClient({ users }: { users: PendingUser[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function handleApprove(userId: string) {
    setActionUserId(userId);
    setError("");
    startTransition(async () => {
      try {
        await approveUserAction(userId);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao aprovar");
      } finally {
        setActionUserId(null);
      }
    });
  }

  function handleReject(userId: string, email: string) {
    if (!confirm(`Rejeitar e eliminar a conta de ${email}? Esta acção é irreversível.`)) return;
    setActionUserId(userId);
    setError("");
    startTransition(async () => {
      try {
        await rejectUserAction(userId);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao rejeitar");
      } finally {
        setActionUserId(null);
      }
    });
  }

  if (users.length === 0) {
    return (
      <div
        className="rounded-2xl p-10 text-center"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <UserCheck className="w-10 h-10 mx-auto mb-3" style={{ color: "#484640" }} />
        <p className="text-sm" style={{ color: "#484640" }}>Nenhum utilizador pendente de aprovação.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs rounded-xl px-3 py-2.5" style={{ background: "rgba(230,126,75,0.1)", color: "#e67e4b", border: "1px solid rgba(230,126,75,0.2)" }}>
          {error}
        </p>
      )}

      {users.map((u) => {
        const isActing = pending && actionUserId === u.id;
        const date = new Date(u.created_at).toLocaleDateString("pt-PT", {
          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        });

        return (
          <div
            key={u.id}
            className="flex items-center gap-4 rounded-2xl px-5 py-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
              style={{ background: "rgba(230,168,30,0.12)", color: "#e6a81e" }}
            >
              {u.email[0]?.toUpperCase() ?? "?"}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "#e8e8e0" }}>{u.email}</p>
              <p className="text-xs mt-0.5" style={{ color: "#484640" }}>Registado em {date}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleApprove(u.id)}
                disabled={isActing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                style={{ background: "rgba(126,184,164,0.15)", color: "#7eb8a4", border: "1px solid rgba(126,184,164,0.25)" }}
              >
                {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Aprovar
              </button>
              <button
                onClick={() => handleReject(u.id, u.email)}
                disabled={isActing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                style={{ background: "rgba(230,126,75,0.12)", color: "#e67e4b", border: "1px solid rgba(230,126,75,0.2)" }}
              >
                <X className="w-3.5 h-3.5" />
                Rejeitar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
