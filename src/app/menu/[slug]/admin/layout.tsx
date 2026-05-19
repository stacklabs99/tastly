export const metadata = { title: "Admin · Tastly" };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "#0f0f0d", minHeight: "100dvh" }}>{children}</div>;
}
