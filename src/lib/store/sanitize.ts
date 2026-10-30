import {
  DEFAULT_PROMPTS,
  FONTS,
  LetterContent,
  RomanticPrompt,
  TEMPLATES,
  FontId,
  TemplateId,
} from "@/lib/templates";

const str = (v: unknown, max: number, fallback = ""): string =>
  typeof v === "string" ? v.slice(0, max) : fallback;

/** Aceita só os campos conhecidos e limita tamanhos — nunca grava o body cru. */
export function sanitizeLetter(input: unknown): LetterContent | null {
  if (!input || typeof input !== "object") return null;
  const l = input as Record<string, unknown>;

  const prompts: RomanticPrompt[] = Array.isArray(l.prompts)
    ? l.prompts.slice(0, 12).map((p, i) => {
        const o = (p ?? {}) as Record<string, unknown>;
        return {
          id: str(o.id, 40, `p${i + 1}`),
          title: str(o.title, 140),
          content: str(o.content, 1200),
        };
      })
    : DEFAULT_PROMPTS;

  const photo = typeof l.photoUrl === "string" ? l.photoUrl : "";
  // Aceita foto enviada pelo editor (data URL) ou já hospedada (https, ou o Storage do próprio Supabase).
  const supaStorage = process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL}/storage/` : null;
  const photoOk =
    photo.length <= 6_000_000 &&
    (/^data:image\/(jpeg|png|webp);base64,/.test(photo) ||
      photo.startsWith("https://") ||
      (supaStorage !== null && photo.startsWith(supaStorage)));

  const templateId = (typeof l.templateId === "string" && l.templateId in TEMPLATES
    ? l.templateId
    : "teal-whisper") as TemplateId;
  const fontId = (typeof l.fontId === "string" && l.fontId in FONTS ? l.fontId : "cormorant") as FontId;

  return {
    senderName: str(l.senderName, 80),
    recipientName: str(l.recipientName, 80),
    question: str(l.question, 200),
    letterText: str(l.letterText, 4000),
    accentNote: str(l.accentNote, 400),
    prompts,
    scratchSecret: str(l.scratchSecret, 300),
    postYesHeadline: str(l.postYesHeadline, 200),
    postYesText: str(l.postYesText, 4000),
    postYesPromise: str(l.postYesPromise, 1000),
    templateId,
    fontId,
    photoUrl: photoOk ? photo : undefined,
    spotifyUrl: str(l.spotifyUrl, 300),
  };
}
