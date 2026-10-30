import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/letter-store";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = (await req.json().catch(() => null)) as { type?: unknown; noAttempts?: unknown } | null;

  if (!body || (body.type !== "open" && body.type !== "yes")) {
    return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  }
  const ok = await recordEvent(slug, body.type, Number(body.noAttempts) || 0);
  return ok ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Carta não encontrada." }, { status: 404 });
}
