"use client";

import React, { useState } from "react";

interface WaxEnvelopeIntroProps {
  senderName: string;
  recipientName: string;
  accentColor?: string;
  onOpen: () => void;
}

export const WaxEnvelopeIntro: React.FC<WaxEnvelopeIntroProps> = ({
  senderName,
  recipientName,
  accentColor = "#E63956",
  onOpen,
}) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenClick = () => {
    if (isOpening) return;
    setIsOpening(true);
    setTimeout(() => {
      onOpen();
    }, 1200); // Transition timing after flap animation
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-neutral-950 via-[#12080E] to-neutral-950 text-white select-none overflow-hidden">
      {/* Soft romantic ambient glows */}
      <div className="absolute w-80 h-80 rounded-full blur-[100px] bg-rose-500/15 pointer-events-none animate-pulse" />
      <div className="absolute w-96 h-96 rounded-full blur-[120px] bg-amber-500/10 pointer-events-none -bottom-20" />

      {/* Intro Header Note */}
      <div className="relative z-10 text-center mb-8 space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-sans tracking-widest uppercase bg-rose-500/10 text-rose-300 border border-rose-500/20">
          💌 Entrega Especial
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100">
          Uma mensagem para você, {recipientName || "meu amor"}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-sans font-light">
          Enviada com todo carinho por <strong className="text-rose-300">{senderName || "alguém especial"}</strong>
        </p>
      </div>

      {/* 3D Envelope Container */}
      <div
        onClick={handleOpenClick}
        className={`relative z-10 w-72 sm:w-80 h-48 sm:h-52 cursor-pointer group transition-all duration-700 transform ${
          isOpening ? "scale-105" : "hover:scale-[1.03] active:scale-95"
        }`}
        style={{ perspective: "1000px" }}
      >
        {/* Envelope Base Body */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E1520] via-[#1F0C15] to-[#14060C] rounded-2xl border border-rose-500/30 shadow-2xl overflow-hidden flex flex-col justify-end p-5">
          {/* Subtle interior letter sliding up when opening */}
          <div
            className={`absolute inset-x-4 top-4 bottom-4 bg-[#FFF9F2] rounded-xl shadow-lg border border-amber-200/50 p-4 transition-transform duration-1000 flex flex-col items-center justify-center text-center ${
              isOpening ? "-translate-y-24 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            <span className="text-xl">✨</span>
            <p className="text-xs font-serif font-bold text-neutral-800 line-clamp-1">
              Eu quero te dizer que...
            </p>
          </div>

          {/* Envelope Diagonal Folds */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              clipPath: "polygon(0% 100%, 50% 50%, 100% 100%)",
              background: "rgba(255, 255, 255, 0.03)",
              borderTop: "1px solid rgba(230, 185, 128, 0.2)",
            }}
          />
        </div>

        {/* Envelope Flap (Triangle) */}
        <div
          className={`absolute top-0 inset-x-0 h-28 sm:h-32 transition-transform duration-700 origin-top ${
            isOpening ? "-rotate-x-180" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
            background: "linear-gradient(180deg, #381A27 0%, #200D17 100%)",
            borderBottom: "1px solid rgba(244, 114, 182, 0.3)",
          }}
        />

        {/* Realistic Wax Seal in the Center */}
        <div
          className={`absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center border-2 border-rose-400/50 transition-all duration-500 ${
            isOpening
              ? "opacity-0 scale-125"
              : "group-hover:scale-110 shadow-rose-600/40 animate-pulse"
          }`}
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #FF4D6D 0%, #C9184A 55%, #590D22 100%)",
            boxShadow: "0 8px 25px rgba(225, 29, 72, 0.6)",
          }}
        >
          <span className="text-white text-lg sm:text-xl font-serif font-bold drop-shadow">
            ♡
          </span>
        </div>
      </div>

      {/* Floating CTA Callout */}
      <div className="relative z-10 mt-8 text-center">
        <button
          onClick={handleOpenClick}
          className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-white bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 shadow-lg shadow-rose-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 mx-auto cursor-pointer"
        >
          <span>Toque no selo para abrir a carta</span>
          <span>💌</span>
        </button>
      </div>
    </div>
  );
};
