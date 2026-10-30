import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore, FieldValue } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";
import { createHash, randomUUID, timingSafeEqual } from "crypto";
import { sanitizeLetter } from "@/lib/store/sanitize";
import { Driver, LetterEvents, NewRecord, SLUG_RE, StoredRecord, emptyEvents } from "@/lib/store/types";

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

let adminApp: App | undefined;
let firestoreDb: Firestore | undefined;
let storageBucket: Storage | undefined;

function getFirebaseAdmin() {
  if (firestoreDb && storageBucket) {
    return { db: firestoreDb, storage: storageBucket };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Configuração do Firebase incompleta. Defina FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY."
    );
  }

  // Tratamento para quebras de linha em chaves privadas PEM
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (!getApps().length) {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    });
  } else {
    adminApp = getApps()[0];
  }

  firestoreDb = getFirestore(adminApp);
  storageBucket = getStorage(adminApp);

  return { db: firestoreDb, storage: storageBucket };
}

export function firebaseDriver(): Driver {
  /** Faz upload da foto em Base64 para o Firebase Storage */
  async function uploadPhoto(dataUrl: string): Promise<string> {
    const { storage } = getFirebaseAdmin();
    const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!m) throw new Error("Formato de foto não aceito.");
    const bytes = Buffer.from(m[2], "base64");
    if (bytes.length > MAX_PHOTO_BYTES) throw new Error("Foto grande demais.");

    const ext = m[1] === "image/png" ? "png" : m[1] === "image/webp" ? "webp" : "jpg";
    const fileName = `letter-photos/${randomUUID()}.${ext}`;
    const bucket = storage.bucket();
    const file = bucket.file(fileName);

    await file.save(bytes, {
      metadata: {
        contentType: m[1],
        cacheControl: "public, max-age=31536000",
      },
      public: true,
    });

    return file.publicUrl();
  }

  return {
    async insert(slug: string, rec: NewRecord) {
      if (!SLUG_RE.test(slug)) return "conflict";
      const { db } = getFirebaseAdmin();
      const docRef = db.collection("letters").doc(slug);

      let letter = rec.letter;
      if (letter.photoUrl?.startsWith("data:image/")) {
        try {
          letter = { ...letter, photoUrl: await uploadPhoto(letter.photoUrl) };
        } catch (err) {
          console.error("[firebaseDriver] Erro ao subir foto no storage:", err);
        }
      }

      try {
        await docRef.create({
          slug,
          plan: rec.plan,
          content: letter,
          manageTokenHash: sha256(rec.manageToken),
          expiresAt: rec.expiresAt ?? null,
          paidAt: rec.plan === "paid" ? rec.createdAt : null,
          createdAt: rec.createdAt,
          openCount: 0,
          noAttempts: 0,
          openedAt: null,
          acceptedAt: null,
        });
        return "ok";
      } catch (err: any) {
        // Código 6 = ALREADY_EXISTS no Firestore
        if (err?.code === 6 || err?.message?.includes("ALREADY_EXISTS")) {
          return "conflict";
        }
        throw new Error(`Falha ao salvar carta no Firebase: ${err.message}`);
      }
    },

    async get(slug: string) {
      if (!SLUG_RE.test(slug)) return null;
      const { db } = getFirebaseAdmin();
      const docSnap = await db.collection("letters").doc(slug).get();
      if (!docSnap.exists) return null;

      const data = docSnap.data();
      if (!data) return null;

      const letter = sanitizeLetter(data.content);
      if (!letter) return null;

      const events: LetterEvents = {
        ...emptyEvents(),
        openCount: data.openCount ?? 0,
        noAttempts: data.noAttempts ?? 0,
        openedAt: data.openedAt ?? undefined,
        acceptedAt: data.acceptedAt ?? undefined,
      };

      const record: StoredRecord = {
        letter,
        plan: data.plan === "paid" ? "paid" : "free",
        expiresAt: data.expiresAt ?? undefined,
        createdAt: data.createdAt,
        events,
      };
      return record;
    },

    async addEvent(slug: string, type: "open" | "yes", noAttempts: number) {
      if (!SLUG_RE.test(slug)) return false;
      const { db } = getFirebaseAdmin();
      const docRef = db.collection("letters").doc(slug);
      const now = new Date().toISOString();

      try {
        if (type === "open") {
          await docRef.update({
            openCount: FieldValue.increment(1),
            openedAt: FieldValue.serverTimestamp(),
          });
        } else {
          await docRef.update({
            acceptedAt: now,
            noAttempts: FieldValue.increment(Math.min(Math.max(Number(noAttempts) || 0, 0), 9999)),
          });
        }
        return true;
      } catch {
        return false;
      }
    },

    async verifyToken(slug: string, token: string) {
      if (!SLUG_RE.test(slug) || !token) return false;
      const { db } = getFirebaseAdmin();
      const docSnap = await db.collection("letters").doc(slug).get();
      if (!docSnap.exists) return false;

      const data = docSnap.data();
      if (!data?.manageTokenHash) return false;

      const a = Buffer.from(data.manageTokenHash);
      const b = Buffer.from(sha256(token));
      return a.length === b.length && timingSafeEqual(a, b);
    },

    async upgradeToPaid(slug: string, fullLetter, paymentId) {
      if (!SLUG_RE.test(slug)) return false;
      const { db } = getFirebaseAdmin();
      const docRef = db.collection("letters").doc(slug);

      const updates: Record<string, unknown> = {
        plan: "paid",
        expiresAt: null,
        paidAt: new Date().toISOString(),
      };
      if (paymentId) updates.paymentId = paymentId;

      if (fullLetter) {
        let cleanLetter = fullLetter;
        if (cleanLetter.photoUrl?.startsWith("data:image/")) {
          cleanLetter = { ...cleanLetter, photoUrl: await uploadPhoto(cleanLetter.photoUrl) };
        }
        updates.content = cleanLetter;
      }

      await docRef.update(updates);
      return true;
    },
  };
}
