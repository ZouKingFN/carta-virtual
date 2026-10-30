import { NextResponse } from "next/server";
import { getPaymentStatus } from "@/lib/mercadopago";
import { upgradeLetter, getLetterRecord } from "@/lib/letter-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId");
    const slug = searchParams.get("slug");

    if (!paymentId || !slug) {
      return NextResponse.json({ error: "Parâmetros ausentes." }, { status: 400 });
    }

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Token Mercado Pago não configurado." }, { status: 503 });
    }

    const payment = await getPaymentStatus(paymentId);
    const record = await getLetterRecord(slug);

    if (payment.status === "approved" && record && record.plan !== "paid") {
      await upgradeLetter(slug, record.letter, paymentId);
    }

    return NextResponse.json({
      status: payment.status,
      isPaid: payment.status === "approved" || record?.plan === "paid",
    });
  } catch (err: any) {
    console.error("[api/checkout/status] Erro:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
