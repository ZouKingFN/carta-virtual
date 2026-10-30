import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Cormorant_Garamond,
  Playfair_Display,
  Great_Vibes,
  Inter,
  Caveat,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fontes do editor de cartas (antes eram só "font-serif"/"italic", sem fonte de verdade).
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const greatVibes = Great_Vibes({ variable: "--font-great-vibes", subsets: ["latin"], weight: "400" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

const fontVars = [geistSans, geistMono, cormorant, playfair, greatVibes, inter, caveat]
  .map((f) => f.variable)
  .join(" ");

export const metadata: Metadata = {
  // Quando tiver domínio: defina NEXT_PUBLIC_SITE_URL (ex.: https://seudominio.com.br)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "CartaVirtual — Declare seu amor de um jeito inesquecível",
  description: "Cartas digitais interativas com o botão NÃO que foge, raspadinha, música e muito carinho.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fontVars} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
