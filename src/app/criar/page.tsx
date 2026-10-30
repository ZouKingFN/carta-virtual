"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { applyPlanLimits, FREE_PLAN, Plan } from "@/lib/plan";
import {
  LetterContent,
  TEMPLATES,
  FONTS,
  FontId,
  RomanticPrompt,
  DEFAULT_LETTER,
} from "@/lib/templates";
import { LetterView } from "@/components/templates/LetterView";
import { compressImage, slugify } from "@/lib/utils";

const PRESET_PROMPT_TITLES = [
  "Quando te vi pela primeira vez...",
  "Eu amo isso em você...",
  "Quando eu te vejo eu sinto...",
  "Meus dias sem você...",
  "O meu dia perfeito...",
  "O momento em que soube que te amava...",
  "Nossa lembrança mais engraçada...",
  "Minha promessa para o nosso futuro...",
];

export default function BuilderPage() {
  const [letter, setLetter] = useState<LetterContent>(DEFAULT_LETTER);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [viewportMode, setViewportMode] = useState<"mobile" | "desktop">("mobile");
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"single" | "pack">("single");
  const [previewKey, setPreviewKey] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedPath, setPublishedPath] = useState<string | null>(null);
  const [trackPath, setTrackPath] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedPlan, setPublishedPlan] = useState<Plan | null>(null);
  const [publishedExpiresAt, setPublishedExpiresAt] = useState<string | null>(null);

  // "tier" = o que está liberado no editor. Começa grátis; o pagamento (em breve) libera o completo.
  const [tier, setTier] = useState<Plan>("free");
  const [lockReason, setLockReason] = useState<string | null>(null);
  const isFree = tier === "free";
  // O que de fato vai para a carta: o preview e o link já respeitam os limites do plano.
  const effective = applyPlanLimits(letter, tier);

  const openUpgrade = (reason: string) => {
    setLockReason(reason);
    setIsCheckoutModalOpen(true);
  };
  const closeCheckout = () => {
    closeCheckout();
    setLockReason(null);
  };

  // Salva a carta e devolve o link que a outra pessoa vai abrir (/c/<slug>).
  const handlePublishTest = async (requested: Plan) => {
    setIsPublishing(true);
    setPublishError(null);
    setPublishedPath(null);
    setTrackPath(null);
    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letter, plan: requested }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Não foi possível salvar a carta.");
      setPublishedPath(`/c/${data.slug}`);
      setPublishedPlan(data.plan === "paid" ? "paid" : "free");
      setPublishedExpiresAt(data.expiresAt ?? null);
      if (data.plan === "paid") setTier("paid");
      setTrackPath(`/acompanhar/${data.slug}?t=${data.manageToken}`);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Erro inesperado ao salvar.");
    } finally {
      setIsPublishing(false);
    }
  };

  const updateLetter = <K extends keyof LetterContent>(field: K, value: LetterContent[K]) => {
    setLetter((prev) => ({ ...prev, [field]: value }));
  };

  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setPhotoError(null);
    setPhotoLoading(true);
    try {
      updateLetter("photoUrl", await compressImage(file));
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Não foi possível usar essa foto.");
    } finally {
      setPhotoLoading(false);
      input.value = ""; // permite escolher o mesmo arquivo de novo
    }
  };

  const updatePrompt = (id: string, field: "title" | "content", val: string) => {
    const updated = letter.prompts.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    updateLetter("prompts", updated);
  };

  const promptSeq = useRef(0);

  const addPrompt = (title = "Mais uma coisa sobre você...") => {
    const newPrompt: RomanticPrompt = {
      id: `p_novo_${++promptSeq.current}`,
      title,
      content: "",
    };
    updateLetter("prompts", [...letter.prompts, newPrompt]);
  };

  const removePrompt = (id: string) => {
    updateLetter(
      "prompts",
      letter.prompts.filter((p) => p.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl">💌</span>
            <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
              CartaVirtual
            </span>
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
            Estúdio de Criação
          </span>
        </div>

        {/* Viewport & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Viewport Switcher (Mobile vs PC Desktop) */}
          <div className="hidden md:flex items-center bg-neutral-800 rounded-xl p-1 border border-neutral-700/80">
            <button
              onClick={() => setViewportMode("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewportMode === "mobile"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Visualizar em formato Celular"
            >
              <span>📱</span>
              <span>Celular</span>
            </button>
            <button
              onClick={() => setViewportMode("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewportMode === "desktop"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Visualizar em formato Computador/PC"
            >
              <span>💻</span>
              <span>Computador</span>
            </button>
          </div>

          {/* Re-trigger Envelope Animation */}
          <button
            onClick={() => setPreviewKey((k) => k + 1)}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-all cursor-pointer"
            title="Reiniciar animação da carta abrindo"
          >
            <span>✉️</span>
            <span>Reiniciar Fluxo</span>
          </button>

          {/* Mobile view switcher */}
          <div className="lg:hidden flex bg-neutral-800 rounded-lg p-0.5 border border-neutral-700">
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "edit"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Editar
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "preview"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Ver Carta
            </button>
          </div>

          {/* Plano atual */}
          <button
            type="button"
            onClick={() => setIsCheckoutModalOpen(true)}
            className={`hidden sm:inline-flex px-3 py-1.5 rounded-full text-[11px] font-semibold border cursor-pointer ${
              isFree
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {isFree ? "Plano grátis · ver completo 🔒" : "Plano completo ✓"}
          </button>

          {/* Share & Paywall Trigger Button */}
          <button
            onClick={() => setIsCheckoutModalOpen(true)}
            className="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:brightness-110 active:scale-95 text-white shadow-lg shadow-rose-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Gerar Link</span>
            <span>✨</span>
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* LEFT: Controls Editor Panel */}
        <div
          className={`w-full lg:w-[480px] xl:w-[540px] bg-neutral-900 border-r border-neutral-800 flex-shrink-0 p-4 sm:p-6 space-y-6 ${
            activeTab === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Section 1: Template Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                1. Escolha a Vibe & Tema
              </label>
              <span className="text-[11px] text-rose-400 font-medium">
                {isFree ? "1 de 4 temas liberado" : "4 opções premium"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {Object.values(TEMPLATES).map((tmpl) => {
                const isSelected = effective.templateId === tmpl.id;
                const isLocked = isFree && tmpl.id !== FREE_PLAN.templateId;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => (isLocked ? openUpgrade("Os outros temas") : updateLetter("templateId", tmpl.id))}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? "border-rose-500 bg-rose-500/10 shadow-sm"
                        : "border-neutral-800 bg-neutral-800/40 hover:border-neutral-700"
                    }`}
                  >
                    <div className="font-semibold text-xs text-white flex items-center justify-between mb-1">
                      <span>{tmpl.name}</span>
                      {isSelected && <span className="text-rose-400 text-xs">✓</span>}
                      {isLocked && <span className="text-xs">🔒</span>}
                    </div>
                    <div className="text-[11px] text-neutral-400 line-clamp-1">
                      {tmpl.tagline}
                    </div>
                    <div className="flex gap-1 mt-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: tmpl.palette.accent }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: tmpl.palette.textSecondary }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Person Names */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              2. Os Nomes do Casal
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">De (Seu nome)</label>
                <input
                  type="text"
                  value={letter.senderName}
                  onChange={(e) => updateLetter("senderName", e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-neutral-800/70 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Para (O amor)</label>
                <input
                  type="text"
                  value={letter.recipientName}
                  onChange={(e) => updateLetter("recipientName", e.target.value)}
                  placeholder="Nome dela(e)"
                  className="w-full bg-neutral-800/70 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Typography Font */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              3. Estilo de Tipografia & Fonte
            </label>
            <select
              value={effective.fontId}
              disabled={isFree}
              onChange={(e) => updateLetter("fontId", e.target.value as FontId)}
              className="w-full disabled:opacity-60 disabled:cursor-not-allowed bg-neutral-800/70 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors cursor-pointer"
            >
              {Object.entries(FONTS).map(([id, font]) => (
                <option key={id} value={id}>
                  {font.name}
                </option>
              ))}
            </select>
            {isFree && (
              <button
                type="button"
                onClick={() => openUpgrade("Troca de fonte")}
                className="text-[11px] text-amber-300 hover:text-amber-200 cursor-pointer"
              >
                🔒 Trocar a fonte faz parte do plano completo
              </button>
            )}
          </div>

          {/* Section 4: The Main Love Note (BEFORE QUESTION) */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                4. Carta Inicial (Antes da Pergunta)
              </label>
              <span className="text-[11px] text-rose-400">Fase 1</span>
            </div>
            <textarea
              rows={4}
              value={letter.letterText}
              onChange={(e) => updateLetter("letterText", e.target.value)}
              placeholder="Escreva seus sentimentos com carinho..."
              className="w-full bg-neutral-800/70 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors resize-none leading-relaxed"
            />
            <input
              type="text"
              value={letter.accentNote || ""}
              onChange={(e) => updateLetter("accentNote", e.target.value)}
              placeholder="Mensagem em destaque (ex: Só porque eu te amo ♡)"
              className="w-full bg-neutral-800/70 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {isFree && (
              <button
                type="button"
                onClick={() => openUpgrade("Música do Spotify")}
                className="text-[11px] text-amber-300 hover:text-amber-200 cursor-pointer"
              >
                🔒 Liberar música no plano completo
              </button>
            )}
          </div>

          {/* Section 5: Dynamic Romantic Prompts Carousel */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                5. Carrossel de Memórias (Editáveis)
              </label>
              <span className="text-[11px] text-rose-400 font-medium">
                {effective.prompts.length} {effective.prompts.length === 1 ? "slide" : "slides"}{isFree ? " · grátis" : ""}
              </span>
            </div>

            <p className="text-[11px] text-neutral-400 leading-normal">
              A pessoa verá estes momentos em formato de carrossel passando um por um:
            </p>

            <div className="space-y-3">
              {(isFree ? letter.prompts.slice(0, FREE_PLAN.maxPrompts) : letter.prompts).map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl border border-neutral-750 bg-neutral-850/60 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={p.title}
                      onChange={(e) => updatePrompt(p.id, "title", e.target.value)}
                      placeholder="Título (ex: Quando te vi...)"
                      className="w-full bg-neutral-800/90 border border-neutral-700 rounded-md px-2.5 py-1 text-xs font-bold text-rose-300 focus:outline-none focus:border-rose-500"
                    />
                    <button
                      hidden={isFree}
                      onClick={() => removePrompt(p.id)}
                      className="text-neutral-500 hover:text-red-400 text-xs px-1.5 py-0.5 rounded"
                      title="Excluir este bloco"
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={p.content}
                    onChange={(e) => updatePrompt(p.id, "content", e.target.value)}
                    placeholder="O que você quer dizer sobre isso..."
                    className="w-full bg-neutral-800/70 border border-neutral-700 rounded-md p-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-neutral-500 block mb-1.5 font-medium">
                + Adicionar slide de sugestão rápida:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PROMPT_TITLES.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => (isFree ? openUpgrade("Mais momentos no carrossel") : addPrompt(title))}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-all cursor-pointer"
                  >
                    {isFree ? "🔒 " : "+ "}{title}
                  </button>
                ))}
              </div>
              {isFree && (
                <p className="text-[11px] text-amber-300 mt-2">
                  O plano grátis tem 1 slide no carrossel. O completo libera quantos você quiser.
                </p>
              )}
            </div>
          </div>

          {/* Section 6: Interactive Scratch Card Secret */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                6. Raspadinha Interativa (Fase 3)
              </label>
              <span className="text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                Raspar para ler ✨
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Após o carrossel, a pessoa verá o botão &quot;Ainda quero te dizer mais uma coisa&quot; que leva
              a esta raspadinha:
            </p>
            <input
              type="text"
              value={letter.scratchSecret}
              onChange={(e) => updateLetter("scratchSecret", e.target.value)}
              placeholder="Ex: Você é o meu maior presente de todos os dias ♡"
              className="w-full bg-neutral-800/70 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Section 7: The Big Question (Fase 4) */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                7. A Pergunta Principal (Fase 4)
              </label>
              <span className="text-[11px] text-rose-400">Botão NÃO foge infinitamente</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Ao raspar, surge o botão &quot;Você pensa que acabou?&quot; levando a esta pergunta:
            </p>
            <input
              type="text"
              value={letter.question}
              onChange={(e) => updateLetter("question", e.target.value)}
              placeholder="Ex: Quer namorar comigo? / Casa comigo?"
              className="w-full bg-neutral-800/70 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Section 8: Photo Upload */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                8. Foto do Casal
              </label>
              <span className="text-[11px] text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20">
                Aparece ao clicar SIM ♡
              </span>
            </div>
            {isFree ? (
              <button
                type="button"
                onClick={() => openUpgrade("Foto do casal")}
                className="w-full flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 rounded-xl p-4 bg-neutral-800/20 text-center cursor-pointer hover:border-amber-500/50"
              >
                <span className="text-2xl mb-1">🔒</span>
                <span className="text-xs font-medium text-neutral-400">Foto do casal no plano completo</span>
              </button>
            ) : (
            <div className="flex items-center gap-3">
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 hover:border-rose-500 rounded-xl p-4 cursor-pointer bg-neutral-800/30 transition-all text-center">
                <span className="text-2xl mb-1">📸</span>
                <span className="text-xs font-medium text-neutral-300">
                  {letter.photoUrl ? "Trocar foto selecionada" : "Fazer upload da foto do casal"}
                </span>
                <span className="text-[10px] text-neutral-500 mt-0.5">
                  {photoLoading ? "Ajustando a foto..." : "PNG ou JPG — reduzimos automaticamente"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {letter.photoUrl && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-neutral-700 flex-shrink-0">
                  <img src={letter.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => updateLetter("photoUrl", undefined)}
                    className="absolute top-0 right-0 bg-red-600/90 text-white w-5 h-5 flex items-center justify-center text-xs rounded-bl-lg"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            )}
            {photoError && <p className="text-xs text-red-400">{photoError}</p>}
          </div>

          {/* Section 9: NEW - POST-YES EDITABLE MESSAGES (Fase 5) */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                9. Mensagens APÓS Ela Dizer &quot;SIM&quot; (Fase 5)
              </label>
              <span className="text-[11px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                Comemoração Final ✨
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Assim que ela clicar em SIM e os confetes estourarem, ela lerá estas palavras
              especiais:
            </p>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                Título de celebração:
              </label>
              <input
                type="text"
                value={letter.postYesHeadline}
                onChange={(e) => updateLetter("postYesHeadline", e.target.value)}
                placeholder="Ex: Eu escolheria você de novo."
                className="w-full bg-neutral-800/70 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                Mensagem apaixonada após o aceite:
              </label>
              <textarea
                rows={3}
                value={letter.postYesText}
                onChange={(e) => updateLetter("postYesText", e.target.value)}
                placeholder="Escreva o que você sente sabendo que ela disse SIM..."
                className="w-full bg-neutral-800/70 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                Sua promessa para o futuro:
              </label>
              <input
                type="text"
                value={letter.postYesPromise}
                onChange={(e) => updateLetter("postYesPromise", e.target.value)}
                placeholder="Ex: Sempre estarei aqui para te abraçar e ser o seu porto seguro."
                className="w-full bg-neutral-800/70 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          {/* Section 10: Spotify Song */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              10. Trilha Sonora (Spotify)
            </label>
            <input
              type="text"
              value={letter.spotifyUrl || ""}
              onChange={(e) => updateLetter("spotifyUrl", e.target.value)}
              disabled={isFree}
              placeholder={isFree ? "🔒 Música no plano completo" : "Cole o link da música no Spotify (ex: https://open.spotify.com/track/...)"}
              className="w-full bg-neutral-800/70 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
        </div>

        {/* RIGHT: Live Interactive Preview (Sticky & Stays in View while Scrolling) */}
        <div
          className={`flex-1 bg-neutral-950 p-2 sm:p-6 flex flex-col items-center justify-center overflow-hidden lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)] ${
            activeTab === "edit" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Header indicator inside preview */}
          <div className="w-full max-w-4xl flex items-center justify-between pb-3 px-2 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>
                Visualizando como:{" "}
                <strong className="text-white">
                  {viewportMode === "mobile" ? "Smartphone (Celular)" : "Computador (PC Desktop)"}
                </strong>
              </span>
            </div>
            <button
              onClick={() => setPreviewKey((k) => k + 1)}
              className="text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>↺ Reiniciar Fluxo</span>
            </button>
          </div>

          {/* VIEWPORT WRAPPER: Mobile Bezel OR Desktop Screen */}
          {viewportMode === "mobile" ? (
            /* Smartphone Mockup */
            <div className="w-full max-w-[370px] h-[calc(100vh-140px)] max-h-[760px] rounded-[44px] border-[10px] border-neutral-800 shadow-2xl overflow-hidden relative flex flex-col bg-black">
              {/* Phone speaker/camera notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-5 bg-neutral-800 rounded-b-2xl z-40 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700" />
              </div>

              {/* In-Phone Scrollable Screen */}
              <div data-runaway-bounds className="flex-1 w-full overflow-y-auto">
                <LetterView
                  key={previewKey}
                  content={effective}
                  isWatermarked={false}
                  interactivePreview={true}
                  viewportMode="mobile"
                  skipIntro={previewKey === 0}
                />
              </div>
            </div>
          ) : (
            /* Desktop PC Monitor Mockup */
            <div className="w-full max-w-4xl h-[calc(100vh-140px)] max-h-[760px] rounded-2xl border-4 border-neutral-800 shadow-2xl overflow-hidden relative flex flex-col bg-neutral-900">
              {/* Browser window titlebar */}
              <div className="h-8 bg-neutral-800 border-b border-neutral-700 flex items-center px-4 gap-2 z-40">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center text-[11px] text-neutral-400 font-mono">
                  seusite.com.br/c/{slugify(letter.recipientName)}-xxxxxx
                </div>
              </div>

              {/* In-PC Scrollable Screen */}
              <div data-runaway-bounds className="flex-1 w-full overflow-y-auto">
                <LetterView
                  key={previewKey}
                  content={effective}
                  isWatermarked={false}
                  interactivePreview={true}
                  viewportMode="desktop"
                  skipIntro={previewKey === 0}
                />
              </div>
            </div>
          )}

          <p className="mt-3 text-xs text-neutral-500 font-sans hidden sm:block">
            ✨ Teste interativo real: avance as etapas, passe o carrossel, raspe o bilhete e tente
            clicar em <span className="text-rose-400">&quot;NÃO 🙃&quot;</span>!
          </p>
        </div>
      </div>

      {/* CHECKOUT MODAL (MONETIZATION PAYWALL) */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white text-xl w-8 h-8 rounded-full flex items-center justify-center bg-neutral-800/50"
            >
              ✕
            </button>

            {lockReason && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs px-3 py-2 text-center">
                🔒 {lockReason} faz parte do plano completo.
              </div>
            )}

            <div className="text-center space-y-2">
              <span className="text-3xl">💌</span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Sua carta para {letter.recipientName || "seu amor"} está pronta!
              </h2>
              <p className="text-sm text-neutral-400">
                Libere o plano completo (link permanente) ou envie agora no plano grátis, que dura 2 dias.
              </p>
            </div>

            {/* Plan Selector */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setSelectedPlan("single")}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  selectedPlan === "single"
                    ? "border-rose-500 bg-rose-500/10 shadow-sm"
                    : "border-neutral-800 bg-neutral-850 hover:border-neutral-700"
                }`}
              >
                <div className="text-xs text-neutral-400 mb-1">Carta Única</div>
                <div className="text-2xl font-extrabold text-white">R$ 14,99</div>
                <div className="text-[11px] text-rose-300 mt-2 space-y-0.5">
                  <div>✓ Link permanente</div>
                  <div>✓ 4 temas e todas as fontes</div>
                  <div>✓ Foto, música e carrossel completo</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedPlan("pack")}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  selectedPlan === "pack"
                    ? "border-rose-500 bg-rose-500/10 shadow-sm"
                    : "border-neutral-800 bg-neutral-850 hover:border-neutral-700"
                }`}
              >
                <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-400 to-rose-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                  MELHOR VALOR
                </span>
                <div className="text-xs text-neutral-400 mb-1">Pack Amor (3 Cartas)</div>
                <div className="text-2xl font-extrabold text-white">R$ 24,99</div>
                <div className="text-[11px] text-amber-300 mt-2 space-y-0.5">
                  <div>✓ 3 cartas completas</div>
                  <div>✓ R$ 8,33 por carta</div>
                  <div>✓ Link com nome próprio</div>
                </div>
              </button>
            </div>

            {/* Payment Features Assurance */}
            <div className="bg-neutral-800/50 rounded-xl p-3 border border-neutral-700/50 space-y-1.5 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">⚡</span>
                <span>
                  <strong>PIX Instantâneo:</strong> O link é liberado em menos de 5 segundos.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-400">🔒</span>
                <span>Pagamento 100% seguro processado pelo Mercado Pago.</span>
              </div>
            </div>

            {/* Teste local: gera o link sem pagamento real */}
            <div className="bg-neutral-800/50 rounded-xl p-3 border border-neutral-700/50 space-y-2 text-xs text-neutral-300">
              <div className="font-semibold text-neutral-100">Modo de teste (sem pagamento real)</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePublishTest("free")}
                  disabled={isPublishing}
                  className="px-3 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 cursor-pointer"
                >
                  {isPublishing ? "Salvando..." : "Gerar link GRÁTIS (expira em 2 dias)"}
                </button>
                <button
                  type="button"
                  onClick={() => handlePublishTest("paid")}
                  disabled={isPublishing}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 cursor-pointer"
                >
                  Simular pagamento e gerar link PERMANENTE
                </button>
              </div>

              {publishedPath && (
                <div className="space-y-2 pt-1">
                  <div className="font-mono break-all text-emerald-300">
                    {typeof window !== "undefined" ? window.location.origin : ""}
                    {publishedPath}
                  </div>
                  <div className={publishedPlan === "paid" ? "text-emerald-300" : "text-amber-300"}>
                    {publishedPlan === "paid"
                      ? "Link permanente."
                      : `Link grátis: expira em ${publishedExpiresAt ? new Date(publishedExpiresAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "2 dias"}.`}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard?.writeText(`${window.location.origin}${publishedPath}`)
                      }
                      className="px-3 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 cursor-pointer"
                    >
                      Copiar link
                    </button>
                    <a
                      href={publishedPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-rose-500 hover:brightness-110 text-white"
                    >
                      Abrir como quem recebe →
                    </a>
                  </div>
                  {trackPath && (
                    <div className="pt-2 border-t border-neutral-700/50 space-y-1.5">
                      <div className="text-neutral-400">Acompanhe se ela abriu e respondeu (link só seu):</div>
                      <a
                        href={trackPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600"
                      >
                        Abrir painel de acompanhamento →
                      </a>
                    </div>
                  )}
                </div>
              )}
              {publishError && <div className="text-red-400">{publishError}</div>}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => {
                alert(
                  `Iniciando checkout com Mercado Pago via PIX (${
                    selectedPlan === "single" ? "R$ 14,99" : "R$ 24,99"
                  }). Na próxima etapa vamos integrar o webhook oficial!`
                );
              }}
              className="w-full py-3.5 rounded-full text-base font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 active:scale-95 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Pagar com PIX & Liberar Link</span>
              <span>→</span>
            </button>

            <p className="text-[11px] text-neutral-500 text-center">
              Ao continuar, você concorda com os{" "}
              <a href="/termos" target="_blank" rel="noopener noreferrer" className="underline">Termos de Uso</a> e a{" "}
              <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="underline">Política de Privacidade</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
