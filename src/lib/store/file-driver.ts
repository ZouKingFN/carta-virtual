import { promises as fs } from "fs";
import path from "path";
import { timingSafeEqual } from "crypto";
import { sanitizeLetter } from "@/lib/store/sanitize";
import { Driver, NewRecord, SLUG_RE, StoredRecord, emptyEvents } from "@/lib/store/types";

/**
 * Modo desenvolvimento: um JSON por carta em ./.data/letters.
 * Funciona no localhost. NÃO funciona na Vercel (disco somente leitura).
 */
const DIR = path.join(process.cwd(), ".data", "letters");

interface FileRecord extends StoredRecord {
  manageToken?: string;
}

async function read(slug: string): Promise<FileRecord | null> {
  if (!SLUG_RE.test(slug)) return null; // barra "../" e afins
  try {
    const parsed = JSON.parse(await fs.readFile(path.join(DIR, `${slug}.json`), "utf8"));
    // Aceita o formato antigo (a carta "solta", sem token nem eventos).
    const rawLetter = parsed && typeof parsed === "object" && "letter" in parsed ? parsed.letter : parsed;
    const letter = sanitizeLetter(rawLetter);
    if (!letter) return null;
    return {
      letter,
      // Registros antigos (sem campo plan) contam como pagos: não expiram.
      plan: parsed.plan === "free" ? "free" : "paid",
      expiresAt: typeof parsed.expiresAt === "string" ? parsed.expiresAt : undefined,
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : new Date(0).toISOString(),
      manageToken: typeof parsed.manageToken === "string" ? parsed.manageToken : undefined,
      events: { ...emptyEvents(), ...(parsed.events ?? {}) },
    };
  } catch {
    return null;
  }
}

async function write(slug: string, record: FileRecord) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(path.join(DIR, `${slug}.json`), JSON.stringify(record), "utf8");
}

export function fileDriver(): Driver {
  return {
    async insert(slug, rec: NewRecord) {
      if (await read(slug)) return "conflict";
      await write(slug, {
        letter: rec.letter,
        plan: rec.plan,
        expiresAt: rec.expiresAt,
        createdAt: rec.createdAt,
        manageToken: rec.manageToken,
        events: emptyEvents(),
      });
      return "ok";
    },

    async get(slug) {
      const rec = await read(slug);
      if (!rec) return null;
      const { letter, plan, expiresAt, createdAt, events } = rec;
      return { letter, plan, expiresAt, createdAt, events };
    },

    async addEvent(slug, type, noAttempts) {
      const rec = await read(slug);
      if (!rec) return false;
      const now = new Date().toISOString();
      if (type === "open") {
        rec.events.openCount += 1;
        rec.events.openedAt ??= now;
      } else {
        rec.events.acceptedAt ??= now;
        rec.events.noAttempts = Math.max(rec.events.noAttempts, noAttempts);
      }
      await write(slug, rec);
      return true;
    },

    async verifyToken(slug, token) {
      const rec = await read(slug);
      if (!rec?.manageToken || !token) return false;
      const a = Buffer.from(rec.manageToken);
      const b = Buffer.from(token);
      return a.length === b.length && timingSafeEqual(a, b);
    },
  };
}
