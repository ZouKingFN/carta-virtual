import { NextResponse } from "next/server";
import { createPixPayment } from "@/lib/mercadopago";
import { saveLetter } from "@/lib/letter-store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as {
      letter?: unknown;
      planType?: "single" | "pack";
      payerEmail?: string;
    } | null;

    if (!body || typeof body !== "object" || !body.letter) {
      return NextResponse.json({ error: "Dados da carta inválidos." }, { status: 400 });
    }

    const email = body.payerEmail?.trim() || "contato@cartavirtual.app.br";
    const isPack = body.planType === "pack";
    const amount = isPack ? 24.99 : 14.99;
    const description = isPack
      ? "CartaVirtual - Pack Amor (3 Cartas Permanentes)"
      : "CartaVirtual - Carta Única Permanente";

    // 1. Salva a carta inicialmente como grátis no banco
    const saved = await saveLetter(body.letter, "free");
    if (!saved) {
      return NextResponse.json({ error: "Falha ao preparar a carta para pagamento." }, { status: 400 });
    }

    // 2. Cria o pagamento PIX no Mercado Pago
    // Se o token do Mercado Pago ainda não estiver configurado no .env, avisa com clareza
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        {
          error: "MERCADO_PAGO_ACCESS_TOKEN não configurado. Adicione no seu .env.local para gerar PIX real.",
          slug: saved.slug,
          manageToken: saved.manageToken,
        },
        { status: 503 }
      );
    }

    const pix = await createPixPayment({
      amount,
      description,
      payerEmail: email,
      metadata: {
        slug: saved.slug,
        planType: isPack ? "pack" : "single",
      },
    });

    return NextResponse.json({
      paymentId: pix.id,
      qrCode: pix.qrCode,
      qrCodeBase64: pix.qrCodeBase64,
      ticketUrl: pix.ticketUrl,
      amount,
      slug: saved.slug,
      manageToken: saved.manageToken,
    });
  } catch (err: any) {
    console.error("[api/checkout/pix] Erro ao gerar PIX:", err);
    return NextResponse.json(
      { error: err?.message || "Erro interno ao processar pagamento via PIX." },
      { status: 500 }
    );
  }
}
