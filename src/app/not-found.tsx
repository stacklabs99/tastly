import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "#13120f" }}
    >
      <p className="font-serif text-8xl font-bold mb-4" style={{ color: "rgba(230,168,30,0.15)" }}>
        404
      </p>
      <h1 className="font-serif text-2xl font-bold mb-2" style={{ color: "#f5f5f0" }}>
        Página não encontrada
      </h1>
      <p className="text-sm mb-8" style={{ color: "#626250" }}>
        O menu ou página que procuras não existe.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
        style={{ background: "#e6a81e", color: "#1a1916" }}
      >
        Voltar ao início
      </Link>
    </div>
  );
}
