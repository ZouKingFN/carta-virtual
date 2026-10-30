"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Atualiza os dados da página a cada alguns segundos, sem recarregar tudo.
export function AutoRefresh({ everyMs = 10000 }: { everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), everyMs);
    return () => clearInterval(id);
  }, [router, everyMs]);
  return null;
}
