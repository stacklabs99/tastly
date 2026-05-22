import { listPendingUsers } from "@/actions/superadmin";
import { PendingUsersClient } from "./PendingUsersClient";

export const dynamic = "force-dynamic";

export default async function UtilizadoresPage() {
  const pending = await listPendingUsers();

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#f5f5f0" }}>Utilizadores</h1>
        <p className="text-sm mt-1" style={{ color: "#626250" }}>
          {pending.length === 0
            ? "Nenhum registo pendente"
            : `${pending.length} registo${pending.length !== 1 ? "s" : ""} a aguardar aprovação`}
        </p>
      </div>

      <PendingUsersClient users={pending} />
    </div>
  );
}
