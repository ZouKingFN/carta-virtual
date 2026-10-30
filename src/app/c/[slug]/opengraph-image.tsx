import { ImageResponse } from "next/og";
import { getLetter } from "@/lib/letter-store";

export const alt = "Uma mensagem especial para você";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagem que aparece quando o link é colado no WhatsApp/Instagram.
// Neutra de propósito: não revela nada da carta, só convida a abrir.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const letter = await getLetter(slug);
  const name = letter?.recipientName?.trim();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1b0f1f 0%, #3a1230 55%, #7a1f4d 100%)",
          color: "#fff",
          fontFamily: "serif",
        }}
      >
        {/* Envelope desenhado com formas, sem emoji (emoji exigiria baixar fonte extra) */}
        <div
          style={{
            width: 260,
            height: 170,
            borderRadius: 18,
            background: "#fbe9ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "130px solid transparent",
              borderRight: "130px solid transparent",
              borderTop: "95px solid #f3b6c6",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 27,
              background: "#c81e5a",
              position: "absolute",
              top: 68,
              left: 103,
            }}
          />
        </div>
        <div style={{ fontSize: 64, marginTop: 46, fontWeight: 700, textAlign: "center", display: "flex" }}>
          {name ? `Uma mensagem para ${name}` : "Você recebeu uma carta"}
        </div>
        <div style={{ fontSize: 30, marginTop: 14, opacity: 0.8, display: "flex" }}>
          Toque para abrir
        </div>
      </div>
    ),
    { ...size }
  );
}
