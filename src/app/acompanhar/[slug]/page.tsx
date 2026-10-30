import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStatus } from "@/lib/letter-store";
import { AutoRefresh } from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Acompanhar carta — CartaVirtual",
  robots: { index: false, follow: false },
};

const fmt = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

export default async function AcompanharPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { slug } = await params;
  const { t } = await searchParams;
  const status = await getStatus(slug, typeof t === "string" ? t : "");
  if (!status) notFound();

  const { events, recipientName, createdAt, plan, expiresAt, expired } = status;
  const opened = events.openCount > 0;
  const accepted = !!events.acceptedAt;

  const steps = [
    { done: true, title: "Carta criada", detail: fmt(createdAt) },
    {
      done: opened,
      title: opened ? `${recipientName || "A pessoa"} abriu a carta` : "Ainda não foi aberta",
      detail: opened ? `Primeira abertura: ${fmt(events.openedAt)} · ${events.openCount}x no total` : "Envie o link e volte aqui.",
    },
    {
      done: accepted,
      title: accepted ? "Respondeu SIM! 💖" : "Ainda não respondeu",
      detail: accepted ? fmt(events.acceptedAt) : opened ? "Ela está lendo... ou pensando." : null,
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
      <AutoRefresh />
      <div className="w-full max-w-md space-y-6">
        <header className="text-center space-y-1">
          <div className="text-3xl">💌</div>
          <h1 className="text-xl font-bold">Carta para {recipientName || "alguém especial"}</h1>
          <p className="text-xs text-neutral-500">Esta página é só sua. Atualiza sozinha a cada 10 segundos.</p>
        </header>

        <div
          className={`rounded-xl border p-3 text-sm text-center ${
            plan === "paid"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : expired
                ? "border-red-500/40 bg-red-500/10 text-red-200"
                : "border-amber-500/40 bg-amber-500/10 text-amber-200"
          }`}
        >
          {plan === "paid"
            ? "Link permanente ✓"
            : expired
              ? "Este link grátis expirou. Quem abrir verá a tela de carta expirada."
              : `Link grátis: expira em ${fmt(expiresAt)}. Depois disso, a pessoa não consegue mais abrir.`}
        </div>

        <ol className="space-y-3">
          {steps.map((s) => (
            <li
              key={s.title}
              className={`rounded-xl border p-4 ${s.done ? "border-emerald-500/40 bg-emerald-500/10" : "border-neutral-800 bg-neutral-900"}`}
            >
              <div className="font-semibold">{s.done ? "✓ " : "○ "}{s.title}</div>
              {s.detail && <div className="text-sm text-neutral-400 mt-1">{s.detail}</div>}
            </li>
          ))}
        </ol>

        {events.noAttempts > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            O botão &quot;Não&quot; foi perseguido <strong>{events.noAttempts}</strong>{" "}
            {events.noAttempts === 1 ? "vez" : "vezes"} antes do SIM. 😏
          </div>
        )}

        <p className="text-[11px] text-neutral-600 text-center">
          Guarde este endereço: quem tiver o link com o código consegue ver esta página.
        </p>
      </div>
    </main>
  );
}
