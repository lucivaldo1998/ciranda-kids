"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CopyPixButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          // clipboard bloqueado — usuário pode selecionar o texto manualmente
        }
      }}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" aria-hidden /> Copiado!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" aria-hidden /> Copiar código PIX
        </>
      )}
    </Button>
  );
}
