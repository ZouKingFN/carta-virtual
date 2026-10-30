import { DEFAULT_LETTER, LetterContent } from "@/lib/templates";

export type Plan = "free" | "paid";

/**
 * Regras do plano grátis — ajuste tudo aqui, em um só lugar.
 * (O servidor aplica estas regras ao salvar; o editor só mostra o cadeado.)
 */
export const FREE_PLAN = {
  templateId: DEFAULT_LETTER.templateId, // único tema liberado
  fontId: DEFAULT_LETTER.fontId, // fonte fixa
  maxPrompts: 1, // slides no carrossel
  linkTtlMs: 2 * 24 * 60 * 60 * 1000, // link expira em 2 dias
} as const;

/** Remove da carta tudo o que o plano grátis não inclui. */
export function applyPlanLimits(letter: LetterContent, plan: Plan): LetterContent {
  if (plan === "paid") return letter;
  return {
    ...letter,
    templateId: FREE_PLAN.templateId,
    fontId: FREE_PLAN.fontId,
    prompts: letter.prompts.slice(0, FREE_PLAN.maxPrompts),
    photoUrl: undefined,
    spotifyUrl: "",
  };
}
