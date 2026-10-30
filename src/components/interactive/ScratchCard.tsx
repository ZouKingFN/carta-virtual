"use client";

import React, { useRef, useEffect, useState } from "react";

interface ScratchCardProps {
  hiddenMessage: string;
  hiddenSubtext?: string;
  onReveal?: () => void;
  accentColor?: string;
  coverText?: string;
  /** Se true, a raspadinha já nasce revelada (ex.: a pessoa voltou para essa tela). */
  initiallyRevealed?: boolean;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  hiddenMessage,
  hiddenSubtext = "♡ guardado com muito carinho ♡",
  onReveal,
  accentColor = "#E63956",
  coverText = "Raspe com o dedo aqui ✨",
  initiallyRevealed = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(initiallyRevealed);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const lastCheck = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);

    // Create luxury scratchable surface (metallic gradient)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#C5A059");
    gradient.addColorStop(0.3, "#E8D5B5");
    gradient.addColorStop(0.5, "#A37C3F");
    gradient.addColorStop(0.7, "#E8D5B5");
    gradient.addColorStop(1, "#8A662D");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative texture & pattern
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    for (let i = 0; i < width; i += 16) {
      ctx.fillRect(i, 0, 1, height);
    }

    // Text on scratch surface
    ctx.fillStyle = "#3D2A10";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(coverText, width / 2, height / 2);

    ctx.font = "11px system-ui, sans-serif";
    ctx.fillStyle = "rgba(61, 42, 16, 0.75)";
    ctx.fillText("♡ segredo especial ♡", width / 2, height / 2 + 18);
  }, [coverText]);

  const scratch = (clientX: number, clientY: number, timeStamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Traça uma linha contínua entre o ponto anterior e o atual. Antes eram só
    // "carimbos" redondos: num arrasto rápido o dedo pulava e deixava buracos.
    const prev = lastPoint.current ?? { x, y };
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 44;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    lastPoint.current = { x, y };

    // Lê os pixels no máximo a cada 80ms (getImageData a cada movimento é pesado).
    if (timeStamp - lastCheck.current > 80) {
      lastCheck.current = timeStamp;
      checkScratchedPercentage();
    }
  };

  const checkScratchedPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    // Sample every 8th pixel for fast performance
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let transparentCount = 0;
    const totalPixels = data.length / 4;

    for (let i = 3; i < data.length; i += 32) {
      if (data[i] === 0) transparentCount++;
    }

    const percentage = transparentCount / (totalPixels / 8);
    if (percentage > 0.42 && !isRevealed) {
      setIsRevealed(true);
      onReveal?.();
      // Auto-clear canvas with smooth animation
      ctx.clearRect(0, 0, width, height);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    lastPoint.current = null;
    scratch(e.clientX, e.clientY, e.timeStamp);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    scratch(e.clientX, e.clientY, e.timeStamp);
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
    lastPoint.current = null;
    checkScratchedPercentage(); // checagem final, caso a última leitura tenha sido pulada
  };

  return (
    <div className="relative w-full max-w-sm h-36 rounded-2xl overflow-hidden shadow-xl border border-amber-500/30 select-none bg-neutral-900/90 flex flex-col items-center justify-center p-4 text-center">
      {/* Hidden Secret Content revealed beneath */}
      <div className="z-0 px-4 space-y-1">
        <span className="text-xl">✨ 🤫 ✨</span>
        <p className="text-base sm:text-lg font-bold text-amber-200 leading-snug">
          &ldquo;{hiddenMessage}&rdquo;
        </p>
        <p className="text-[11px] text-amber-300/70 font-sans">{hiddenSubtext}</p>
      </div>

      {/* Canvas scratch surface */}
      {!isRevealed && (
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none z-10 transition-opacity duration-500"
        />
      )}
    </div>
  );
};
