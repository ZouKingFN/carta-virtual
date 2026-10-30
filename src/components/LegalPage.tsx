import Link from "next/link";
import React from "react";

interface LegalPageProps {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}

// Moldura comum das páginas legais (Termos e Privacidade).
export function LegalPage({ title, updatedAt, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <header className="border-b border-neutral-900 px-4 sm:px-8 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-100">
          <span>💌</span>
          <span className="font-bold">CartaVirtual</span>
          <span aria-hidden>← voltar</span>
        </Link>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10 space-y-6 leading-relaxed">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">{title}</h1>
        <p className="text-xs text-neutral-500">Última atualização: {updatedAt}</p>
        <div className="space-y-5 text-sm sm:text-base text-neutral-300 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:pt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {children}
        </div>
      </main>
    </div>
  );
}

/** Destaca no texto o que PRECISA ser preenchido/revisado antes de publicar. */
export function Todo({ children }: { children: React.ReactNode }) {
  // Estilo inline de propósito: a tag <mark> tem fundo amarelo padrão do navegador
  // e brigava com as classes, deixando o texto ilegível.
  return (
    <span
      style={{
        background: "rgba(251, 191, 36, 0.14)",
        color: "#fcd34d",
        border: "1px dashed rgba(251, 191, 36, 0.55)",
        borderRadius: 6,
        padding: "1px 6px",
        fontSize: "0.92em",
      }}
    >
      [{children}]
    </span>
  );
}
