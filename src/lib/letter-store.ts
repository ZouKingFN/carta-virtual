import { randomBytes } from "crypto";
import { slugify } from "@/lib/utils";
import { applyPlanLimits, FREE_PLAN, Plan } from "@/lib/plan";
import type { LetterContent } from "@/lib/templates";
import { sanitizeLetter } from "@/lib/store/sanitize";
import { Driver, LetterEvents, StoredRecord } from "@/lib/store/types";
import { fileDriver } from "@/lib/store/file-driver";
import { supabaseDriver } from "@/lib/store/supabase-driver";
import { firebaseDriver } from "@/lib/store/firebase-driver";

export { sanitizeLetter };
export type { LetterEvents };

/**
 * Armazenamento das cartas — a API usada pelo resto do site.
 *  - Com SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY definidos: usa o Supabase.
 *  - Sem elas, em desenvolvimento: arquivos em ./.data (só localhost).
 *  - Sem elas, em produção: erro explícito (disco da Vercel não é gravável).
 */
let driver: Driver | undefined;

function getDriver(): Driver {
  if (driver) return driver;

  // 1. Prioridade: Firebase (se as variáveis do Firebase estiverem configuradas)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    driver = firebaseDriver();
    return driver;
  }

  // 2. Supabase (fallback)
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    driver = supabaseDriver(url, key);
    return driver;
  }

  // 3. Em produção, se nenhum banco em nuvem estiver configurado, avisa com erro explícito
  if (process.env.NODE_ENV === "production") {
    throw new Error("Configure as variáveis do Firebase ou Supabase no ambiente de produção.");
  }

  // 4. Desenvolvimento local: guarda em arquivos (./.data/letters)
  driver = fileDriver();
  return driver;
}

const isExpired = (r: StoredRecord) => !!r.expiresAt && Date.parse(r.expiresAt) <= Date.now();

export async function saveLetter(
  input: unknown,
  plan: Plan = "free"
): Promise<{ slug: string; manageToken: string; plan: Plan; expiresAt?: string } | null> {
  const clean = sanitizeLetter(input);
  if (!clean) return null;
  const letter = applyPlanLimits(clean, plan); // o servidor é quem manda: o editor pode ser burlado

  const manageToken = randomBytes(16).toString("hex");
  const now = Date.now();
  const createdAt = new Date(now).toISOString();
  const expiresAt = plan === "free" ? new Date(now + FREE_PLAN.linkTtlMs).toISOString() : undefined;

  // Slug repetido é raro (nome + 3 bytes aleatórios), mas tentamos de novo se acontecer.
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = `${slugify(letter.recipientName)}-${randomBytes(3).toString("hex")}`;
    const res = await getDriver().insert(slug, { letter, plan, expiresAt, createdAt, manageToken });
    if (res === "ok") return { slug, manageToken, plan, expiresAt };
  }
  throw new Error("Não foi possível gerar um endereço único para a carta.");
}

export async function getLetter(slug: string): Promise<LetterContent | null> {
  return (await getDriver().get(slug))?.letter ?? null;
}

/** Carta + situação do link (plano e se já expirou). */
export async function getLetterRecord(slug: string) {
  const rec = await getDriver().get(slug);
  if (!rec) return null;
  return { letter: rec.letter, plan: rec.plan, expiresAt: rec.expiresAt, expired: isExpired(rec) };
}

/** Registra o que aconteceu na carta (abertura / resposta SIM / tentativas no NÃO). */
export async function recordEvent(slug: string, type: "open" | "yes", noAttempts = 0): Promise<boolean> {
  const attempts = Math.min(Math.max(Math.floor(Number(noAttempts) || 0), 0), 9999);
  return getDriver().addEvent(slug, type, attempts);
}

/** Só devolve o status se o token do link de acompanhamento estiver correto. */
export async function getStatus(slug: string, token: string) {
  if (!(await getDriver().verifyToken(slug, token))) return null;
  const rec = await getDriver().get(slug);
  if (!rec) return null;
  return {
    recipientName: rec.letter.recipientName,
    createdAt: rec.createdAt,
    events: rec.events,
    plan: rec.plan,
    expiresAt: rec.expiresAt,
    expired: isExpired(rec),
  };
}

/** Atualiza a carta para plano pago (libera link permanente e dados completos). */
export async function upgradeLetter(
  slug: string,
  fullLetter?: LetterContent,
  paymentId?: string
): Promise<boolean> {
  const clean = fullLetter ? sanitizeLetter(fullLetter) : undefined;
  return getDriver().upgradeToPaid(slug, clean ?? undefined, paymentId);
}