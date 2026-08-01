"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Enquanto o pedido aguarda pagamento, recarrega os dados a cada 10s para
// refletir a confirmação do webhook sem o cliente precisar apertar F5.
export function OrderStatusPoller({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const interval = window.setInterval(() => router.refresh(), 10000);
    return () => window.clearInterval(interval);
  }, [active, router]);
  return null;
}
