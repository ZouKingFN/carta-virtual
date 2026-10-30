import React from "react";

// Mostrada ao destinatário quando o link grátis (2 dias) já expirou.
// Não revela nada do conteúdo da carta.
export function ExpiredLetter() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <div className="max-w-sm text-center space-y-4">
        <div className="text-5xl">⏳</div>
        <h1 className="text-2xl font-bold">Esta carta expirou</h1>
        <p className="text-sm text-neutral-400 leading-relaxed">
          O link grátis do CartaVirtual dura 2 dias. Se você recebeu essa mensagem de alguém especial, peça
          para a pessoa liberar a carta para sempre e enviar o link de novo. 💌
        </p>
      </div>
    </main>
  );
}
