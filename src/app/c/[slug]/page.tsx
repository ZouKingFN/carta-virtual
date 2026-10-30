import React from "react";
import type { Metadata } from "next";
import { DEFAULT_LETTER, LetterContent } from "@/lib/templates";
import { RecipientLetter } from "@/components/RecipientLetter";
import { getLetterRecord } from "@/lib/letter-store";
import { ExpiredLetter } from "@/components/ExpiredLetter";

// Cada acesso busca a carta salva; nada de pré-render estático.
export const dynamic = "force-dynamic";

interface LetterRecipientPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: LetterRecipientPageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = await getLetterRecord(slug);
  if (record?.expired) {
    return { title: "Carta expirada — CartaVirtual", robots: { index: false, follow: false } };
  }
  const name = record?.letter.recipientName?.trim();
  const title = name ? `Uma mensagem para ${name} 💌` : "Você recebeu uma carta 💌";
  // Neutro de propósito: não entrega a surpresa no preview do WhatsApp.
  const description = "Alguém preparou uma coisa especial para você. Toque para abrir.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale: "pt_BR" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: false }, // carta é privada: fora do Google
  };
}

export default async function LetterRecipientPage({ params }: LetterRecipientPageProps) {
  const { slug } = await params;

  // 1) Carta que a pessoa montou no editor e salvou.
  // 2) Sem carta salva (ex.: /c/inaya): mostra a carta de demonstração com o nome do slug.
  // Em produção: só entregar cartas com is_paid = true.
  const record = await getLetterRecord(slug);
  if (record?.expired) return <ExpiredLetter />;
  const stored = record?.letter ?? null;
  const letterData: LetterContent =
    stored ?? {
      ...DEFAULT_LETTER,
      recipientName: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Inaya",
    };

  return (
    <main className="min-h-screen w-full bg-neutral-950">
      {/* Visão de quem RECEBE: sem painel de edição, sem botões de criador. */}
      <RecipientLetter slug={slug} content={letterData} track={!!stored} />
    </main>
  );
}
