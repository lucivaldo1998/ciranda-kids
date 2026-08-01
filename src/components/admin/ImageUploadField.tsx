"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

// Campo de imagem do painel: faz upload para /api/uploads e guarda a URL num input hidden,
// para funcionar dentro de qualquer <form action={serverAction}>.
export function ImageUploadField({
  name,
  label,
  defaultUrl,
  hint,
}: {
  name: string;
  label: string;
  defaultUrl?: string | null;
  hint?: string;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Falha no upload.");
      setUrl(body.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <input type="hidden" name={name} value={url} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-3">
        {url ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setUrl("")}
              aria-label="Remover imagem"
              className="absolute right-0 top-0 rounded-bl bg-black/60 p-0.5 text-white"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </div>
        ) : null}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Enviando…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" aria-hidden /> {url ? "Trocar imagem" : "Enviar imagem"}
            </>
          )}
        </button>
      </div>
      {hint && !error ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
