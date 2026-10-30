"use client";

import React from "react";
import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-rose-500 selection:text-white font-sans">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-neutral-950/70 backdrop-blur-xl border-b border-neutral-800/80 px-4 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl animate-pulse">💌</span>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
            CartaVirtual
          </span>
          <span className="text-[10px] font-mono uppercase bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/20">
            .app.br
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/criar"
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:brightness-110 active:scale-95 text-white shadow-lg shadow-rose-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Criar Minha Carta</span>
            <span>→</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 px-4 sm:px-8 text-center max-w-5xl mx-auto flex flex-col items-center">
        {/* Glow ambient spot */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Small Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-800 text-rose-300 mb-6 shadow-sm">
          <span>✨</span>
          <span>A forma mais inesquecível de declarar seu amor</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Não mande apenas uma mensagem.{" "}
          <span className="bg-gradient-to-r from-rose-400 via-pink-300 to-amber-200 bg-clip-text text-transparent">
            Crie uma experiência romântica interativa.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-neutral-400 max-w-2xl mb-8 leading-relaxed font-light">
          Cartas digitais ultra premium com o famoso botão <strong>&quot;NÃO&quot; que foge</strong>, raspadinha
          e animações cinematográficas. No plano completo, também música do Spotify e revelação de fotos.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/criar"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:brightness-110 active:scale-95 text-white shadow-xl shadow-rose-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Montar Minha Carta Agora</span>
            <span>💌</span>
          </Link>
          <a
            href="#templates"
            className="w-full sm:w-auto px-6 py-4 rounded-full text-base font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer"
          >
            Ver Modelos & Demos
          </a>
        </div>

        <p className="text-xs text-neutral-400 mt-4 flex items-center gap-1.5">
          <span>⚡</span>
          <span>100% grátis* para criar e testar. Liberação instantânea via PIX.</span>
        </p>
        <p className="text-xs text-neutral-400 mt-2 max-w-md text-center leading-relaxed">
          * 100% grátis apenas para as funcionalidades do plano grátis: 1 tema, 1 slide no carrossel e link que
          expira em 2 dias. As demais funcionalidades (outros temas, mais slides, foto, música, troca de fonte e
          link permanente) são pagas.
        </p>
      </section>

      {/* Feature Pillars: How It Works */}
      <section className="py-16 px-4 sm:px-8 border-y border-neutral-900 bg-neutral-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">
              Passo a Passo
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-white">
              Como funciona o CartaVirtual?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xl font-bold flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Personalize sua História</h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed">
                Escolha o tema, digite seus nomes e escreva seus sentimentos. No plano completo, você
                ainda escolhe a trilha sonora perfeita do Spotify.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xl font-bold flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">O Jogo do Botão Fugitivo</h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed">
                Ao abrir o link no celular, o botão &quot;NÃO&quot; foge de qualquer tentativa de toque,
                transformando a declaração num momento divertido e inesquecível.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xl font-bold flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">A Grande Revelação</h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed">
                Ao clicar em &quot;SIM&quot;, uma chuva de confetes se espalha pela tela, revelando uma mensagem
                de amor eterno (e, no plano completo, a foto de vocês).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section id="templates" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">
            Temas Artesanais
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Design de Luxo para Todas as Histórias
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 mt-2 font-light">
            Nada de cartões genéricos. Cada paleta foi criada para transmitir intimidade e nobreza.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.values(TEMPLATES).map((tmpl) => (
            <div
              key={tmpl.id}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 flex flex-col justify-between hover:border-neutral-700 transition-all group"
            >
              <div>
                <div
                  className="w-full h-36 rounded-xl mb-4 border flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: tmpl.palette.bg,
                    borderColor: tmpl.palette.cardBorder,
                  }}
                >
                  <span
                    className="px-3 py-1 rounded-full text-xs font-serif font-bold shadow-md"
                    style={{
                      background: tmpl.palette.cardBg,
                      color: tmpl.palette.textPrimary,
                      borderColor: tmpl.palette.cardBorder,
                    }}
                  >
                    {tmpl.name}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{tmpl.name}</h3>
                <p className="text-xs text-rose-300 font-medium mb-2">{tmpl.tagline}</p>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <Link
                href="/criar"
                className="mt-4 w-full py-2 rounded-xl text-xs font-semibold text-center border border-neutral-700 hover:border-rose-500 hover:bg-rose-500/10 text-neutral-300 hover:text-white transition-all block"
              >
                Usar este Modelo →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-8 border-t border-neutral-900 bg-neutral-900/20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">
            Preços Transparentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Mais inesquecível que um presente físico
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 mt-2 font-light">
            Comece no plano grátis* e libere o plano completo quando quiser, pagando uma única vez.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Plan 1 */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Individual
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Carta Única</h3>
              <div className="text-3xl font-extrabold text-white mt-4">
                R$ 14,99{" "}
                <span className="text-xs font-normal text-neutral-400">/ pagamento único</span>
              </div>
              <p className="text-xs text-neutral-400 mt-2">
                Ideal para um pedido de namoro, casamento ou aniversário especial.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-neutral-300 text-left">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Link permanente que nunca expira
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> 4 temas e todas as fontes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Carrossel com quantos slides quiser
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Botão &quot;NÃO&quot; fugitivo para celular & PC
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Música de fundo via Spotify
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Revelação de foto secreta ao dizer SIM
                </li>
              </ul>
            </div>

            <Link
              href="/criar"
              className="mt-8 w-full py-3 rounded-full text-xs sm:text-sm font-bold border border-neutral-700 hover:border-rose-500 hover:bg-rose-500/10 text-white transition-all text-center block"
            >
              Começar agora
            </Link>
          </div>

          {/* Plan 2 */}
          <div className="rounded-3xl border-2 border-rose-500/60 bg-gradient-to-b from-rose-950/20 to-neutral-900/90 p-6 sm:p-8 flex flex-col justify-between relative shadow-xl shadow-rose-950/40">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-rose-500 text-black text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
              Mais Escolhido
            </span>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Pacote Especial
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Pack Amor (3 Cartas)</h3>
              <div className="text-3xl font-extrabold text-white mt-4">
                R$ 24,99{" "}
                <span className="text-xs font-normal text-neutral-400">(R$ 8,33 por carta)</span>
              </div>
              <p className="text-xs text-neutral-400 mt-2">
                Para comemorar múltiplos momentos especiais ou datas comemorativas.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-neutral-300 text-left">
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">✓</span> 3 Cartas com links permanentes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">✓</span> Todos os benefícios da Carta
                  Única
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">✓</span> Link com nome personalizado
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">✓</span> Acesso antecipado a novos temas
                </li>
              </ul>
            </div>

            <Link
              href="/criar"
              className="mt-8 w-full py-3.5 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:brightness-110 active:scale-95 text-white shadow-lg shadow-rose-500/25 transition-all text-center block cursor-pointer"
            >
              Criar com o Pack Amor
            </Link>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 text-left">
          <div className="text-sm font-bold text-white">* Plano grátis (R$ 0)</div>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            Inclui 1 tema, 1 slide no carrossel, raspadinha e a pergunta com o botão &quot;NÃO&quot; fugitivo. O link
            grátis expira em 2 dias. Não inclui foto do casal, música do Spotify, troca de fonte, os outros
            temas nem link permanente: essas funcionalidades são do plano pago.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-8 border-t border-neutral-900 text-center text-xs text-neutral-500">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-lg">💌</span>
          <span className="font-bold text-neutral-300">CartaVirtual.app.br</span>
        </div>
        <p>© 2026 CartaVirtual. Feito com amor para momentos inesquecíveis.</p>
        <p className="mt-2 flex items-center justify-center gap-4">
          <a href="/termos" className="underline hover:text-neutral-300">Termos de Uso</a>
          <a href="/privacidade" className="underline hover:text-neutral-300">Política de Privacidade</a>
        </p>
        <p className="mt-1 text-[11px] text-neutral-600">
          Pagamentos seguros processados via Mercado Pago (PIX & Cartão de Crédito).
        </p>
      </footer>
    </div>
  );
}
