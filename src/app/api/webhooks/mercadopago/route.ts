import { NextResponse } from "next/server";
import { getPaymentStatus } from "@/lib/mercadopago";
import { upgradeLetter, getLetterRecord } from "@/lib/letter-store";

export const dynamic = "force-dynamic";

/** Webhook oficial do Mercado Pago para confirmação de pagamento instantânea */
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const body = (await req.json().catch(() => null)) as {
      type?: string;
      action?: string;
      data?: { id?: string };
    } | null;

    // O ID pode vir por query param (?data.id=... ou ?id=...) ou no corpo
    const paymentId =
      body?.data?.id ||
      url.searchParams.get("data.id") ||
      url.searchParams.get("id");

    const topic = body?.type || body?.action || url.searchParams.get("type") || url.searchParams.get("topic");

    // Só processamos notificações relacionadas a pagamentos
    if (!paymentId || (topic && topic !== "payment" && !topic.includes("payment"))) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Consulta o Mercado Pago no servidor de forma segura
    const payment = await getPaymentStatus(paymentId);

    if (payment.status === "approved") {
      const slug = payment.metadata?.slug as string | undefined;
      if (slug) {
        const record = await getLetterRecord(slug);
        if (record && record.plan !== "paid") {
          // Atualiza a carta para plano pago permanente
          await upgradeLetter(slug, record.letter, paymentId);
          console.log(`[Webhook MercadoPago] Carta ${slug} promovida para plano PAGO!`);
        }
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("[api/webhooks/mercadopago] Erro no webhook:", err);
    // Retorna 200 para evitar retentativas infinitas do MP em erros de formatação
    return NextResponse.json({ error: err?.message }, { status: 200 });
  }
}
