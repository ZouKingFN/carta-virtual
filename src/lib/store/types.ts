import type { LetterContent } from "@/lib/templates";
import type { Plan } from "@/lib/plan";

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,59}$/;

export interface LetterEvents {
  openedAt?: string;
  openCount: number;
  acceptedAt?: string;
  noAttempts: number;
}

export interface StoredRecord {
  letter: LetterContent;
  plan: Plan;
  expiresAt?: string; // só no plano grátis
  createdAt: string;
  events: LetterEvents;
}

export interface NewRecord {
  letter: LetterContent;
  plan: Plan;
  expiresAt?: string;
  createdAt: string;
  manageToken: string; // em texto puro aqui; cada driver decide como guardar
}

/** Onde as cartas ficam guardadas: arquivo local (dev) ou Supabase (produção). */
export interface Driver {
  insert(slug: string, rec: NewRecord): Promise<"ok" | "conflict">;
  get(slug: string): Promise<StoredRecord | null>;
  addEvent(slug: string, type: "open" | "yes", noAttempts: number): Promise<boolean>;
  verifyToken(slug: string, token: string): Promise<boolean>;
  upgradeToPaid(slug: string, fullLetter?: LetterContent, paymentId?: string): Promise<boolean>;
}

export const emptyEvents = (): LetterEvents => ({ openCount: 0, noAttempts: 0 });
