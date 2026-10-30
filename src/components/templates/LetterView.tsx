"use client";

import React, { useState, useRef } from "react";
import confetti from "canvas-confetti";
import { LetterContent, TEMPLATES, FONTS } from "@/lib/templates";
import { FloatingParticles } from "@/components/interactive/FloatingParticles";
import { RunawayButton } from "@/components/interactive/RunawayButton";
import { ScratchCard } from "@/components/interactive/ScratchCard";
import { WaxEnvelopeIntro } from "@/components/interactive/WaxEnvelopeIntro";
import { extractSpotifyTrackId } from "@/lib/utils";

interface LetterViewProps {
  content: LetterContent;
  isWatermarked?: boolean;
  interactivePreview?: boolean;
  viewportMode?: "mobile" | "desktop";
  skipIntro?: boolean;
  /** Disparado quando o destinatário abre o envelope. */
  onOpened?: () => void;
  /** Disparado quando o destinatário clica em SIM (com quantas vezes o NÃO fugiu). */
  onAccepted?: (info: { noAttempts: number }) => void;
}

export const LetterView: React.FC<LetterViewProps> = ({
  content,
  isWatermarked = false,
  interactivePreview = false,
  viewportMode = "mobile",
  skipIntro = false,
  onOpened,
  onAccepted,
}) => {
  const noAttemptsRef = useRef(0);
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(skipIntro);
  // Current active stage: 'letter' | 'prompts' | 'scratch' | 'question' | 'post-yes'
  const [stage, setStage] = useState<"letter" | "prompts" | "scratch" | "question" | "post-yes">(
    "letter"
  );
  const [carouselIndex, setCarouselIndex] = useState(0);
  // Maior slide já visto: o botão "Ainda quero te dizer mais uma coisa" só aparece no fim.
  const [maxSeenSlide, setMaxSeenSlide] = useState(0);
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [yesScale, setYesScale] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const template = TEMPLATES[content.templateId] || TEMPLATES["midnight-rose"];
  const font = FONTS[content.fontId] || FONTS["cormorant"];
  const spotifyTrackId = extractSpotifyTrackId(content.spotifyUrl || "");

  const prompts = content.prompts || [];
  const carouselDone = prompts.length === 0 || maxSeenSlide >= prompts.length - 1;

  const goToSlide = (next: number) => {
    const clamped = Math.min(Math.max(0, next), Math.max(prompts.length - 1, 0));
    setCarouselIndex(clamped);
    setMaxSeenSlide((m) => Math.max(m, clamped));
  };

  const handleEvadeCount = (count: number) => {
    noAttemptsRef.current = count;
    // Grow YES button progressively as NO is evaded
    setYesScale(1 + Math.min(count * 0.12, 0.9));
  };

  const handleSayYes = () => {
    setStage("post-yes");
    onAccepted?.({ noAttempts: noAttemptsRef.current });

    // Full canvas confetti celebration
    const end = Date.now() + 2.5 * 1000;
    const colors = template.particles.colors;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  return (
    <>
      {/* 1. Wax Envelope Intro Overlay (Only on launch / unskipped) */}
      {!isEnvelopeOpened && (
        <WaxEnvelopeIntro
          senderName={content.senderName}
          recipientName={content.recipientName}
          accentColor={template.palette.accent}
          onOpen={() => {
            setIsEnvelopeOpened(true);
            onOpened?.();
          }}
        />
      )}

      {/* 2. Main Step-by-Step Experience Container */}
      <div
        ref={containerRef}
        className={`relative ${interactivePreview ? "min-h-full" : "min-h-screen"} w-full flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden transition-colors duration-700 select-none ${
          font.styleClass
        } ${viewportMode === "desktop" ? "py-12" : "py-6"}`}
        style={{
          background: template.palette.bg,
          color: template.palette.textPrimary,
          fontFamily: font.family,
        }}
      >
        {/* Floating Background Particles */}
        <FloatingParticles
          types={template.particles.types}
          colors={template.particles.colors}
          count={22}
        />

        {/* Ambient Glows */}
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40 -top-20 -left-20 animate-pulse"
          style={{ background: template.palette.accentGlow }}
        />
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30 -bottom-20 -right-20 animate-pulse"
          style={{ background: template.palette.accentGlow }}
        />

        {/* Step-by-Step Progress Dots */}
        {isEnvelopeOpened && stage !== "post-yes" && (
          <div className="relative z-20 flex items-center gap-2 mb-4">
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                stage === "letter" ? "w-6 bg-rose-400" : "bg-white/30"
              }`}
            />
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                stage === "prompts" ? "w-6 bg-rose-400" : "bg-white/30"
              }`}
            />
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                stage === "scratch" ? "w-6 bg-rose-400" : "bg-white/30"
              }`}
            />
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                stage === "question" ? "w-6 bg-rose-400" : "bg-white/30"
              }`}
            />
          </div>
        )}

        {/* The Card */}
        <div
          className={`relative z-10 w-full rounded-3xl p-5 sm:p-8 backdrop-blur-xl shadow-2xl transition-all duration-500 border ${
            viewportMode === "desktop" ? "max-w-2xl" : "max-w-md"
          }`}
          style={{
            background: template.palette.cardBg,
            borderColor: template.palette.cardBorder,
            boxShadow: `0 20px 50px -10px ${template.palette.accentGlow}`,
          }}
        >
          {/* Subtle Corner Accents */}
          <div
            className="absolute top-3 left-3 text-xs opacity-40 font-mono"
            style={{ color: template.palette.accent }}
          >
            ✦ ✦
          </div>
          <div
            className="absolute top-3 right-3 text-xs opacity-40 font-mono"
            style={{ color: template.palette.accent }}
          >
            ✦ ✦
          </div>

          {/* ===================================================================
              FASE 1: A CARTA PRINCIPAL ("Eu quero te dizer que:")
             =================================================================== */}
          {stage === "letter" && (
            <div className="flex flex-col items-center text-center space-y-5 animate-in fade-in duration-500">
              <span
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-sans font-medium tracking-wider uppercase border"
                style={{
                  backgroundColor: template.palette.badgeBg,
                  borderColor: template.palette.cardBorder,
                  color: template.palette.accent,
                }}
              >
                <span>💌</span> Eu quero te dizer que...
              </span>

              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ color: template.palette.textPrimary }}
              >
                {content.recipientName || "Meu Amor"}
              </h1>

              {/* Spotify Player */}
              {spotifyTrackId && (
                <div className="w-full overflow-hidden rounded-xl shadow-sm">
                  <iframe
                    src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator&theme=0`}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-xl"
                  />
                </div>
              )}

              {/* Main Letter Body */}
              <div
                className="text-base sm:text-lg leading-relaxed whitespace-pre-line text-left sm:text-center px-1 font-normal opacity-95"
                style={{ color: template.palette.textSecondary }}
              >
                {content.letterText ||
                  "Cada dia com você faz a vida parecer mais leve, bonita e cheia de sentido."}
              </div>

              {/* Accent Note */}
              {content.accentNote && (
                <div
                  className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm italic font-sans opacity-90 border border-dashed"
                  style={{
                    borderColor: template.palette.cardBorder,
                    color: template.palette.textSecondary,
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  {content.accentNote}
                </div>
              )}

              {/* Forward to Carrossel */}
              <button
                type="button"
                onClick={() => setStage("prompts")}
                className="mt-4 px-6 py-3 rounded-full text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:brightness-110 active:scale-95 flex items-center gap-2 cursor-pointer"
                style={{ background: template.palette.yesBtnBg }}
              >
                <span>Avançar para nossas memórias</span>
                <span>→</span>
              </button>
            </div>
          )}

          {/* ===================================================================
              FASE 2: CARROSSEL DE MOMENTOS ESPECIAIS EDITÁVEIS
             =================================================================== */}
          {stage === "prompts" && (
            <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium tracking-wider uppercase border"
                style={{
                  backgroundColor: template.palette.badgeBg,
                  borderColor: template.palette.cardBorder,
                  color: template.palette.accent,
                }}
              >
                <span>✨</span> Detalhes que eu amo em nós ({carouselIndex + 1}/{prompts.length || 1})
              </span>

              {/* Slide Card */}
              {prompts[carouselIndex] ? (
                <div
                  key={prompts[carouselIndex].id || carouselIndex}
                  className="w-full min-h-[220px] p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between text-left font-sans animate-in zoom-in-95 duration-300"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderColor: template.palette.cardBorder,
                  }}
                >
                  <div>
                    <div
                      className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                      style={{ color: template.palette.accent }}
                    >
                      <span>♡</span>
                      <span>{prompts[carouselIndex].title}</span>
                    </div>
                    <p
                      className="text-sm sm:text-base font-light leading-relaxed whitespace-pre-line"
                      style={{ color: template.palette.textSecondary }}
                    >
                      {prompts[carouselIndex].content || "..."}
                    </p>
                  </div>

                  {/* Carousel navigation buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                    <button
                      type="button"
                      disabled={carouselIndex === 0}
                      onClick={() => goToSlide(carouselIndex - 1)}
                      className="text-xs font-bold text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <span>←</span>
                      <span>Anterior</span>
                    </button>

                    <div className="flex gap-1.5">
                      {prompts.map((_, i) => (
                        <span
                          key={i}
                          onClick={() => goToSlide(i)}
                          className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                            carouselIndex === i ? "w-4 bg-rose-400" : "bg-white/20"
                          }`}
                        />
                      ))}
                    </div>

                    {carouselIndex < prompts.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => goToSlide(carouselIndex + 1)}
                        className="text-xs font-bold text-rose-300 hover:text-white cursor-pointer flex items-center gap-1"
                      >
                        <span>Próximo</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-amber-300 font-bold">Último momento ♡</span>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Só aparece quando o carrossel termina */}
              <div className="pt-2 w-full flex flex-col items-center min-h-[84px]">
                {carouselDone && (
                  <button
                    type="button"
                    onClick={() => setStage("scratch")}
                    className="animate-in px-6 py-3.5 rounded-full text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:brightness-110 active:scale-95 flex items-center gap-2 cursor-pointer"
                    style={{ background: template.palette.yesBtnBg }}
                  >
                    <span>Ainda quero te dizer mais uma coisa</span>
                    <span>→</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setStage("letter")}
                  className="mt-3 text-xs opacity-50 hover:opacity-100 font-sans cursor-pointer underline"
                >
                  ← Voltar à carta
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================
              FASE 3: A RASPADINHA INTERATIVA
             =================================================================== */}
          {stage === "scratch" && (
            <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium tracking-wider uppercase border"
                style={{
                  backgroundColor: template.palette.badgeBg,
                  borderColor: template.palette.cardBorder,
                  color: template.palette.accent,
                }}
              >
                <span>🪙</span> Um segredo guardado só para você
              </span>

              <h2
                className="text-2xl sm:text-3xl font-bold px-2"
                style={{ color: template.palette.textPrimary }}
              >
                Raspe com o dedo para revelar
              </h2>

              <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-xs">
                Passe o dedo ou mouse sobre a tinta dourada abaixo:
              </p>

              {/* Scratch card component */}
              <ScratchCard
                hiddenMessage={
                  content.scratchSecret || "Você é o meu lugar favorito no mundo todo ♡"
                }
                hiddenSubtext="♡ guardado a sete chaves ♡"
                accentColor={template.palette.accent}
                initiallyRevealed={scratchRevealed}
                onReveal={() => setScratchRevealed(true)}
              />

              {/* Botão de transição pedido pelo usuário: "Você pensa que acabou?" */}
              <div className="pt-4 w-full flex flex-col items-center min-h-[84px]">
                {scratchRevealed && (
                  <button
                    type="button"
                    onClick={() => setStage("question")}
                    className="animate-in px-7 py-3.5 rounded-full text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-white shadow-xl transition-all hover:brightness-110 active:scale-95 flex items-center gap-2 cursor-pointer"
                    style={{ background: template.palette.yesBtnBg }}
                  >
                    <span>Você pensa que acabou?</span>
                    <span>→</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setStage("prompts")}
                  className="mt-3 text-xs opacity-50 hover:opacity-100 font-sans cursor-pointer underline"
                >
                  ← Voltar aos momentos
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================
              FASE 4: A GRANDE PERGUNTA & O BOTÃO FUGITIVO INFINITO
             =================================================================== */}
          {stage === "question" && (
            <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <span
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-sans font-medium tracking-wider uppercase border"
                style={{
                  backgroundColor: template.palette.badgeBg,
                  borderColor: template.palette.cardBorder,
                  color: template.palette.accent,
                }}
              >
                <span>♡</span> A pergunta mais importante <span>♡</span>
              </span>

              {/* Recipient name */}
              <h2
                className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                style={{ color: template.palette.textPrimary }}
              >
                {content.recipientName || "Meu Amor"}
              </h2>

              {/* The Big Question */}
              <p
                className="text-2xl sm:text-3xl font-bold px-2 leading-snug"
                style={{ color: template.palette.textPrimary }}
              >
                {content.question || "Quer ser meu amor para sempre?"}
              </p>

              <p className="text-xs text-neutral-400 font-sans">
                Pense bem na sua resposta... se conseguir clicar nela! 😜
              </p>

              {/* Action Buttons: YES vs INFINITE RUNAWAY NO */}
              <div className="relative w-full pt-4 pb-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                {/* YES BUTTON */}
                <button
                  type="button"
                  data-yes-button
                  onClick={handleSayYes}
                  style={{
                    background: template.palette.yesBtnBg,
                    color: template.palette.yesBtnText,
                    transform: `scale(${yesScale})`,
                    boxShadow: `0 8px 25px -4px ${template.palette.accentGlow}`,
                  }}
                  className="px-8 py-3.5 rounded-full text-base font-sans font-bold tracking-wider uppercase transition-all duration-200 hover:brightness-110 active:scale-95 cursor-pointer shadow-lg z-20 flex items-center gap-2"
                >
                  <span>SIM, MEU AMOR ♡</span>
                </button>

                {/* INFINITE RUNAWAY NO BUTTON */}
                <RunawayButton
                  label="NÃO 🙃"
                  boundsSelector={interactivePreview ? "[data-runaway-bounds]" : undefined}
                  avoidSelector="[data-yes-button]"
                  onEvadeCountChange={handleEvadeCount}
                  className="font-sans font-bold shadow-2xl"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    color: template.palette.textPrimary,
                    border: `1.5px solid ${template.palette.accent}`,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => setStage("scratch")}
                className="text-xs opacity-40 hover:opacity-100 font-sans cursor-pointer underline"
              >
                ← Voltar à raspadinha
              </button>
            </div>
          )}

          {/* ===================================================================
              FASE 5: APÓS O ACEITE ("SIM") - TEXTO EDITÁVEL CUSTOMIZADO & FOTO
             =================================================================== */}
          {stage === "post-yes" && (
            <div className="flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-700">
              <span
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-sans font-medium tracking-wider uppercase border animate-bounce"
                style={{
                  backgroundColor: template.palette.badgeBg,
                  borderColor: template.palette.cardBorder,
                  color: template.palette.accent,
                }}
              >
                ♡ você disse sim! ♡
              </span>

              {/* Post-Yes Headline (Editável) */}
              <h2
                className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                style={{ color: template.palette.textPrimary }}
              >
                {content.postYesHeadline || "Eu escolheria você de novo."}
              </h2>

              {/* Photo Reveal (Only after YES) */}
              {content.photoUrl ? (
                <div
                  className="relative p-2 rounded-2xl border shadow-xl max-w-xs overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                  style={{
                    borderColor: template.palette.cardBorder,
                    background: "rgba(255,255,255,0.06)",
                  }}
                >
                  <img
                    src={content.photoUrl}
                    alt="Nossa foto especial"
                    className="rounded-xl w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] text-white">
                    ♡ nós dois
                  </div>
                </div>
              ) : (
                <div
                  className="p-6 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center max-w-xs"
                  style={{
                    borderColor: template.palette.cardBorder,
                    color: template.palette.textSecondary,
                  }}
                >
                  <span className="text-3xl mb-1">💑</span>
                  <p className="text-xs font-sans">
                    Nossa história é a coisa mais linda que já me aconteceu.
                  </p>
                </div>
              )}

              {/* Post-Yes Message & Promise (Totalmente Editáveis) */}
              <div
                className="text-base sm:text-lg leading-relaxed space-y-3 font-normal"
                style={{ color: template.palette.textSecondary }}
              >
                <p className="whitespace-pre-line">
                  {content.postYesText ||
                    "Você é incrível de todas as formas possíveis, e eu quero todos os meus dias e amanheceres ao seu lado."}
                </p>
                {content.postYesPromise && (
                  <p className="font-semibold whitespace-pre-line" style={{ color: template.palette.textPrimary }}>
                    {content.postYesPromise}
                  </p>
                )}
              </div>

              {/* Final Signature */}
              <div
                className="pt-3 border-t w-full flex flex-col items-center gap-1 opacity-90"
                style={{ borderColor: template.palette.cardBorder }}
              >
                <span className="text-xs uppercase tracking-widest font-sans opacity-70">
                  Para todo o sempre,
                </span>
                <span
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: template.palette.accent }}
                >
                  {content.senderName || "Seu amor"} ♡
                </span>
              </div>

              {interactivePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setStage("letter");
                    setCarouselIndex(0);
                    setMaxSeenSlide(0);
                    setScratchRevealed(false);
                    setYesScale(1);
                  }}
                  className="mt-2 text-xs opacity-60 hover:opacity-100 underline font-sans cursor-pointer"
                >
                  ↺ Reiniciar fluxo do início (Modo Teste)
                </button>
              )}
            </div>
          )}

          {/* Free Plan Watermark */}
          {isWatermarked && (
            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-center">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-sans opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1"
              >
                <span>Feito com</span>
                <strong className="underline underline-offset-2">CartaVirtual.app.br</strong>
                <span>✨ Crie a sua</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
