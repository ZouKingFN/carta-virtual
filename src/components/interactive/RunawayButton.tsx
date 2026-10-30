"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface RunawayButtonProps {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Seletor CSS do elemento que limita a área de fuga (ex.: a "tela" do celular
   * no preview do editor). Sem isso, o botão foge pela janela inteira.
   */
  boundsSelector?: string;
  /** Seletor dos elementos que o botão nunca deve cobrir (ex.: o botão SIM). */
  avoidSelector?: string;
  onEvadeCountChange?: (count: number) => void;
}

const TAUNTS = [
  "NÃO 🙃",
  "Tem certeza? 🥺",
  "Pensa com carinho!",
  "Ops! Quase pegou...",
  "O botão tem ótimo cardio! 🏃",
  "Você não consegue dizer não ❤️",
  "Desiste e clica no SIM!",
  "Minha resposta favorita é SIM ✨",
  "Não adianta fugir do destino! 🔮",
  "Tenta de novo se tiver coragem 😜",
  "O botão correu mais rápido! 💨",
  "Só existe uma resposta certa ♡",
];

const MARGIN = 12;
const PROXIMITY_PX = 95;
const COOLDOWN_MS = 120;

type Pos = { x: number; y: number };
type Box = { left: number; top: number; right: number; bottom: number };

export const RunawayButton: React.FC<RunawayButtonProps> = ({
  label = "NÃO 🙃",
  className = "",
  style,
  boundsSelector,
  avoidSelector,
  onEvadeCountChange,
}) => {
  const [pos, setPos] = useState<Pos | null>(null);
  const [slot, setSlot] = useState<{ w: number; h: number } | null>(null);
  const [tauntIndex, setTauntIndex] = useState(0);
  const [evadeCount, setEvadeCount] = useState(0);

  // Wrapper que fica SEMPRE no fluxo da página (guarda o lugar do botão).
  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 130, h: 48 });
  const posRef = useRef<Pos | null>(null);
  const pointerRef = useRef<Pos | null>(null);
  const countRef = useRef(0);
  const lastMoveRef = useRef(0);
  const pendingFirstMove = useRef(false);
  const lastPointerDownRef = useRef(0);
  const tauntRef = useRef(0);

  const getBounds = useCallback((): Box => {
    const vw = document.documentElement.clientWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const host = boundsSelector ? wrapRef.current?.closest(boundsSelector) : null;
    if (host) {
      const r = host.getBoundingClientRect();
      return {
        left: Math.max(0, r.left),
        top: Math.max(0, r.top),
        right: Math.min(vw, r.right),
        bottom: Math.min(vh, r.bottom),
      };
    }
    return { left: 0, top: 0, right: vw, bottom: vh };
  }, [boundsSelector]);

  // O texto muda a cada fuga (de "NÃO" para frases longas), e a largura muda junto.
  // Medimos o botão com o PRÓXIMO texto para a posição escolhida caber na tela.
  const measureWith = useCallback((text: string) => {
    const btn = btnRef.current;
    if (!btn) return sizeRef.current;
    const clone = btn.cloneNode(false) as HTMLButtonElement;
    clone.textContent = text;
    clone.style.cssText +=
      ";position:fixed;left:-9999px;top:0;visibility:hidden;transition:none;white-space:nowrap;transform:none";
    document.body.appendChild(clone);
    const r = clone.getBoundingClientRect();
    document.body.removeChild(clone);
    return { w: r.width, h: r.height };
  }, []);

  const pickPosition = useCallback(
    (w: number, h: number, from: Pos): Pos => {
      const b = getBounds();
      const minX = b.left + MARGIN;
      const maxX = Math.max(minX, b.right - w - MARGIN);
      const minY = b.top + MARGIN;
      const maxY = Math.max(minY, b.bottom - h - MARGIN);

      const avoid: Box[] = avoidSelector
        ? Array.from(document.querySelectorAll(avoidSelector)).map((el) => {
            const r = el.getBoundingClientRect();
            return { left: r.left - 10, top: r.top - 10, right: r.right + 10, bottom: r.bottom + 10 };
          })
        : [];

      let best: Pos = from;
      for (let i = 0; i < 30; i++) {
        const x = Math.round(minX + Math.random() * (maxX - minX));
        const y = Math.round(minY + Math.random() * (maxY - minY));
        best = { x, y };

        const overlapsAvoid = avoid.some(
          (a) => x < a.right && x + w > a.left && y < a.bottom && y + h > a.top
        );
        if (overlapsAvoid) continue;

        // Nas primeiras tentativas, exige um salto bem longe da posição atual
        // e longe do ponteiro, para ficar impossível de alcançar.
        if (i < 22) {
          const farFromCurrent = Math.hypot(x - from.x, y - from.y) > 110;
          const p = pointerRef.current;
          const farFromPointer = !p || Math.hypot(x + w / 2 - p.x, y + h / 2 - p.y) > 130;
          if (!farFromCurrent || !farFromPointer) continue;
        }
        return best;
      }
      return best;
    },
    [avoidSelector, getBounds]
  );

  const moveButton = useCallback(() => {
    const now = Date.now();
    if (now - lastMoveRef.current < COOLDOWN_MS || pendingFirstMove.current) return;
    lastMoveRef.current = now;

    const btn = btnRef.current;
    const isFirst = posRef.current === null;

    const nextTaunt = (tauntRef.current + 1) % TAUNTS.length;
    const { w: nextW, h: nextH } = measureWith(TAUNTS[nextTaunt]);

    if (isFirst) {
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setSlot({ w: rect.width, h: rect.height });

      const start: Pos = { x: rect.left, y: rect.top };
      const next = pickPosition(nextW, nextH, start);
      sizeRef.current = { w: nextW, h: nextH };

      // 1º frame: já em position:fixed no mesmo lugar onde estava;
      // 2º frame: anima até o destino (a transição CSS cuida do resto).
      posRef.current = start;
      setPos(start);
      pendingFirstMove.current = true;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          posRef.current = next;
          setPos(next);
          pendingFirstMove.current = false;
        })
      );
    } else {
      const next = pickPosition(nextW, nextH, posRef.current as Pos);
      sizeRef.current = { w: nextW, h: nextH };
      posRef.current = next;
      setPos(next);
    }

    tauntRef.current = nextTaunt;
    countRef.current += 1;
    setEvadeCount(countRef.current);
    setTauntIndex(nextTaunt);
    onEvadeCountChange?.(countRef.current);
  }, [measureWith, onEvadeCountChange, pickPosition]);

  // Mouse (desktop): foge quando o cursor chega perto.
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
      if (e.pointerType !== "mouse") return;

      const el = btnRef.current;
      if (!el) return;
      const { w, h } = sizeRef.current;
      // Usa a posição de DESTINO (posRef), não a animada, para não tremer.
      const origin = posRef.current ?? (() => {
        const r = el.getBoundingClientRect();
        return { x: r.left, y: r.top };
      })();
      const dist = Math.hypot(e.clientX - (origin.x + w / 2), e.clientY - (origin.y + h / 2));
      if (dist < PROXIMITY_PX) moveButton();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [moveButton]);

  // Se a janela mudar de tamanho (ou o celular girar), mantém o botão na tela.
  useEffect(() => {
    const clamp = () => {
      const cur = posRef.current;
      if (!cur) return;
      const { w, h } = sizeRef.current;
      const b = getBounds();
      const next = {
        x: Math.min(Math.max(cur.x, b.left + MARGIN), Math.max(b.left + MARGIN, b.right - w - MARGIN)),
        y: Math.min(Math.max(cur.y, b.top + MARGIN), Math.max(b.top + MARGIN, b.bottom - h - MARGIN)),
      };
      posRef.current = next;
      setPos(next);
    };
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, [getBounds]);

  const currentLabel = evadeCount === 0 ? label : TAUNTS[tauntIndex];

  const buttonProps = {
    type: "button" as const,
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") moveButton();
    },
    // pointerdown cobre toque e mouse; foge antes mesmo do "click" acontecer.
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      lastPointerDownRef.current = Date.now();
      moveButton();
    },
    onClick: (e: React.MouseEvent) => {
      // Teclado (Enter/Espaço) ou clique que passou: também foge.
      e.preventDefault();
      e.stopPropagation();
      // Toque/clique já fez o botão fugir no pointerdown; não foge duas vezes.
      if (Date.now() - lastPointerDownRef.current < 600) return;
      lastMoveRef.current = 0;
      moveButton();
    },
    className: `px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide shadow-xl backdrop-blur-md cursor-pointer select-none active:scale-95 ${className}`,
  };

  return (
    <span
      ref={wrapRef}
      className="inline-flex"
      style={slot ? { width: slot.w, height: slot.h } : undefined}
    >
      {pos === null ? (
        <button
          ref={btnRef}
          {...buttonProps}
          style={{ ...style, touchAction: "none", transition: "transform 0.15s ease" }}
        >
          {currentLabel}
        </button>
      ) : (
        // O botão vai para o <body> via portal. Isso é essencial: o card da carta
        // usa backdrop-filter/overflow-hidden, o que faz "position: fixed" deixar de
        // ser relativo à tela e o botão ficava cortado/invisível depois da 1ª fuga.
        createPortal(
          <button
            ref={btnRef}
            {...buttonProps}
            style={{
              ...style,
              position: "fixed",
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              zIndex: 2147483000,
              touchAction: "none",
              whiteSpace: "nowrap",
              transition:
                "left 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {currentLabel}
          </button>,
          document.body
        )
      )}
    </span>
  );
};
