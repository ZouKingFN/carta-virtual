import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractSpotifyTrackId(url: string): string | null {
  if (!url) return null;
  // Format: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
  // Or spotify:track:4cOdK2wGLETKBW3PvgPWqT
  const trackMatch = url.match(/track[/:]([a-zA-Z0-9]+)/);
  return trackMatch ? trackMatch[1] : null;
}

export function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "amor"
  );
}

export class ImageError extends Error {}

/**
 * Lê uma foto escolhida pelo usuário, corrige a rotação (EXIF), reduz para no máximo
 * `maxSide` px e devolve um data URL JPEG leve (normalmente 150–400 KB).
 */
export async function compressImage(file: File, maxSide = 1280, quality = 0.82): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new ImageError("Escolha um arquivo de imagem (JPG ou PNG).");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new ImageError("Essa foto passa de 15MB. Escolha uma menor.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageError("Não consegui ler essa imagem (formato HEIC?). Use uma foto JPG ou PNG.");
  }

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageError("Seu navegador não conseguiu processar a imagem.");
  ctx.fillStyle = "#ffffff"; // PNG com fundo transparente vira branco no JPEG
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}
