import { NextResponse } from "next/server";
import { saveLetter } from "@/lib/letter-store";
import type { Plan } from "@/lib/plan";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { letter?: unknown; plan?: unknown } | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Carta inválida." }, { status: 400 });
  }

  // O plano PAGO só vale com pagamento confirmado (Mercado Pago, em breve).
  // Enquanto isso, só é aceito fora de produção, para você testar o plano completo.
  const simulatedPaidAllowed = process.env.NODE_ENV !== "production";
  const plan: Plan = body.plan === "paid" && simulatedPaidAllowed ? "paid" : "free";

  let saved;
  try {
    saved = await saveLetter(body.letter, plan);
  } catch (err) {
    console.error("[api/letters] falha ao salvar:", err);
    return NextResponse.json({ error: "Não foi possível salvar a carta agora. Tente de novo." }, { status: 500 });
  }
  if (!saved) {
    return NextResponse.json({ error: "Carta inválida." }, { status: 400 });
  }
  // manageToken é o "segredo" do link de acompanhamento: só quem criou a carta recebe.
  return NextResponse.json(saved);
}
