import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createHash, randomUUID, timingSafeEqual } from "crypto";
import { sanitizeLetter } from "@/lib/store/sanitize";
import { Driver, LetterEvents, NewRecord, SLUG_RE, StoredRecord, emptyEvents } from "@/lib/store/types";

const BUCKET = "letter-photos";
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/**
 * Produção: Supabase (Postgres + Storage), acessado SÓ pelo servidor com a service_role key.
 * As tabelas têm RLS ligado e nenhuma policy (veja supabase/setup.sql).
 */
export function supabaseDriver(url: string, serviceKey: string): Driver {
  const db: SupabaseClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  /** Foto em data URL (vinda do editor) vai para o Storage; a carta guarda só o endereço. */
  async function uploadPhoto(dataUrl: string): Promise<string> {
    const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!m) throw new Error("Formato de foto não aceito.");
    const bytes = Buffer.from(m[2], "base64");
    if (bytes.length > MAX_PHOTO_BYTES) throw new Error("Foto grande demais.");

    const ext = m[1] === "image/png" ? "png" : m[1] === "image/webp" ? "webp" : "jpg";
    const objectPath = `${randomUUID()}.${ext}`; // endereço imprevisível
    const { error } = await db.storage.from(BUCKET).upload(objectPath, bytes, {
      contentType: m[1],
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw new Error(`Falha ao enviar a foto: ${error.message}`);
    return db.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
  }

  return {
    async insert(slug, rec: NewRecord) {
      let letter = rec.letter;
      if (letter.photoUrl?.startsWith("data:image/")) {
        letter = { ...letter, photoUrl: await uploadPhoto(letter.photoUrl) };
      }

      const { error } = await db.from("letters").insert({
        slug,
        plan: rec.plan,
        content: letter,
        manage_token_hash: sha256(rec.manageToken),
        expires_at: rec.expiresAt ?? null,
        paid_at: rec.plan === "paid" ? rec.createdAt : null,
        created_at: rec.createdAt,
      });
      if (error?.code === "23505") return "conflict"; // slug repetido
      if (error) throw new Error(`Falha ao salvar a carta: ${error.message}`);
      return "ok";
    },

    async get(slug) {
      if (!SLUG_RE.test(slug)) return null;
      const { data, error } = await db
        .from("letters")
        .select("content, plan, expires_at, created_at, opened_at, open_count, accepted_at, no_attempts")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(`Falha ao ler a carta: ${error.message}`);
      if (!data) return null;

      const letter = sanitizeLetter(data.content);
      if (!letter) return null;
      const events: LetterEvents = {
        ...emptyEvents(),
        openCount: data.open_count ?? 0,
        noAttempts: data.no_attempts ?? 0,
        openedAt: data.opened_at ?? undefined,
        acceptedAt: data.accepted_at ?? undefined,
      };
      const rec: StoredRecord = {
        letter,
        plan: data.plan === "paid" ? "paid" : "free",
        expiresAt: data.expires_at ?? undefined,
        createdAt: data.created_at,
        events,
      };
      return rec;
    },

    async addEvent(slug, type, noAttempts) {
      if (!SLUG_RE.test(slug)) return false;
      const { data, error } = await db.rpc("record_letter_event", {
        p_slug: slug,
        p_type: type,
        p_no_attempts: noAttempts,
      });
      if (error) throw new Error(`Falha ao registrar evento: ${error.message}`);
      return data === true;
    },

    async verifyToken(slug, token) {
      if (!SLUG_RE.test(slug) || !token) return false;
      const { data, error } = await db
        .from("letters")
        .select("manage_token_hash")
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) return false;
      const a = Buffer.from(data.manage_token_hash);
      const b = Buffer.from(sha256(token));
      return a.length === b.length && timingSafeEqual(a, b);
    },

    async upgradeToPaid(slug, fullLetter, paymentId) {
      if (!SLUG_RE.test(slug)) return false;
      const updates: Record<string, unknown> = {
        plan: "paid",
        expires_at: null,
        paid_at: new Date().toISOString(),
      };
      if (paymentId) updates.payment_id = paymentId;
      if (fullLetter) {
        let cleanLetter = fullLetter;
        if (cleanLetter.photoUrl?.startsWith("data:image/")) {
          cleanLetter = { ...cleanLetter, photoUrl: await uploadPhoto(cleanLetter.photoUrl) };
        }
        updates.content = cleanLetter;
      }
      const { error } = await db.from("letters").update(updates).eq("slug", slug);
      if (error) throw new Error(`Falha ao atualizar plano da carta: ${error.message}`);
      return true;
    },
  };
}
