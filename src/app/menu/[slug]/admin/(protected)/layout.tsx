import { redirect } from "next/navigation";
import { AdminProvider } from "@/contexts/AdminContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function ProtectedAdminLayout({ children, params }: Props) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/menu/${slug}/admin/login`);

  return (
    <AdminProvider slug={slug}>
      <div className="flex min-h-dvh" style={{ background: "#141412" }}>
        <AdminSidebar slug={slug} userEmail={user.email ?? ""} />
        <main className="flex-1 overflow-auto min-w-0">
          <div className="md:hidden h-14" />
          {children}
        </main>
      </div>
    </AdminProvider>
  );
}
