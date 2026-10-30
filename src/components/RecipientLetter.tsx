"use client";

import React from "react";
import { LetterContent } from "@/lib/templates";
import { LetterView } from "@/components/templates/LetterView";

interface RecipientLetterProps {
  slug: string;
  content: LetterContent;
  /** false na carta de demonstração (não existe registro para gravar). */
  track: boolean;
}

// Visão de quem RECEBE + aviso silencioso para o servidor (abriu / disse SIM).
export function RecipientLetter({ slug, content, track }: RecipientLetterProps) {
  const send = (type: "open" | "yes", noAttempts = 0) => {
    if (!track) return;
    fetch(`/api/letters/${slug}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, noAttempts }),
      keepalive: true,
    }).catch(() => {});
  };

  return (
    <LetterView
      content={content}
      isWatermarked={false}
      interactivePreview={false}
      viewportMode="mobile"
      skipIntro={false}
      onOpened={() => send("open")}
      onAccepted={({ noAttempts }) => send("yes", noAttempts)}
    />
  );
}
