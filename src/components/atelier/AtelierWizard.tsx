"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Shirt, Camera, Sparkles, Upload, Loader2, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { MEASUREMENT_FIELDS } from "@/lib/measurements";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Field";
import { submitCustomOrder, generateSketch } from "@/app/(site)/atelie/actions";

export type BaseModel = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl: string | null;
};

type PathType = "modelo" | "referencia" | "ia";

const PATHS: { type: PathType; icon: typeof Shirt; title: string; text: string }[] = [
  {
    type: "modelo",
    icon: Shirt,
    title: "A partir da coleção",
    text: "Escolha uma peça da lojinha e receba a versão sob medida do seu pequeno — no tecido e cor que quiser.",
  },
  {
    type: "referencia",
    icon: Camera,
    title: "A partir de uma foto",
    text: "Viu uma fantasia, look de festa ou roupa de personagem? Envie a foto e nós recriamos com o toque do ateliê.",
  },
  {
    type: "ia",
    icon: Sparkles,
    title: "Criar com IA",
    text: "Descreva a roupa dos sonhos do seu pequeno e gere um croqui na hora. Ajuste até ficar perfeito.",
  },
];

export function AtelierWizard({
  baseModels,
  aiEnabled,
  preselectedModelId,
}: {
  baseModels: BaseModel[];
  aiEnabled: boolean;
  preselectedModelId: string | null;
}) {
  const [step, setStep] = useState(preselectedModelId ? 1 : 0);
  const [type, setType] = useState<PathType | null>(preselectedModelId ? "modelo" : null);
  const [baseProductId, setBaseProductId] = useState<string | null>(preselectedModelId);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiImageUrl, setAiImageUrl] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [fabric, setFabric] = useState("");
  const [colorNotes, setColorNotes] = useState("");
  const [details, setDetails] = useState("");
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<{ id: string; code: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = ["Caminho", "Detalhes", "Medidas", "Contato"];

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/atelier-upload", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Falha no upload.");
      setReferenceImageUrl(body.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  }

  function handleGenerate() {
    setGenerating(true);
    setError(null);
    startTransition(async () => {
      const result = await generateSketch(aiPrompt);
      if (result.ok) {
        setAiImageUrl(result.url);
      } else {
        setError(result.message);
      }
      setGenerating(false);
    });
  }

  function canAdvanceFromStep0() {
    if (!type) return false;
    if (type === "modelo") return Boolean(baseProductId);
    return true;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const contact = Object.fromEntries(
      ["customerName", "customerEmail", "customerPhone", "customerCity"].map((k) => [
        k,
        String(formData.get(k) ?? ""),
      ])
    );
    startTransition(async () => {
      const result = await submitCustomOrder({
        type,
        baseProductId: baseProductId ?? "",
        referenceImageUrl,
        aiPrompt,
        aiImageUrl,
        fabric,
        colorNotes,
        details,
        measurements,
        ...contact,
      });
      if (result.ok) {
        setDone({ id: result.id, code: result.code });
      } else {
        setError(result.message);
      }
    });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" aria-hidden />
        <h2 className="mt-5 font-display text-3xl font-medium">Encomenda recebida!</h2>
        <p className="mt-3 text-ink/70">
          Sua encomenda <strong>{done.code}</strong> chegou ao ateliê. A Cleide vai avaliar a peça e
          você receberá o orçamento em breve — acompanhe tudo pela página da encomenda.
        </p>
        <div className="mt-8">
          <Link
            href={`/atelie/encomenda/${done.id}`}
            className="inline-flex items-center justify-center bg-primary px-8 py-4 text-sm font-medium uppercase tracking-[0.18em] text-canvas hover:opacity-90"
          >
            Acompanhar minha encomenda
          </Link>
        </div>
        <p className="mt-4 text-xs text-ink/50">
          Guarde este link — ele é a chave de acesso da sua encomenda.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progresso */}
      <div className="mb-10 flex items-center justify-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                i < step
                  ? "border-primary bg-primary text-canvas"
                  : i === step
                    ? "border-primary text-primary"
                    : "border-ink/25 text-ink/40"
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                "hidden text-xs uppercase tracking-[0.15em] sm:block",
                i === step ? "text-ink" : "text-ink/40"
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 ? <div className="h-px w-6 bg-ink/20 sm:w-10" /> : null}
          </div>
        ))}
      </div>

      {/* Passo 1: caminho */}
      {step === 0 ? (
        <div>
          <div className="grid gap-4 md:grid-cols-3">
            {PATHS.map((path) => {
              const Icon = path.icon;
              const isSelected = type === path.type;
              return (
                <button
                  key={path.type}
                  type="button"
                  onClick={() => setType(path.type)}
                  className={cn(
                    "rounded-2xl border p-6 text-left transition-colors",
                    isSelected ? "border-primary bg-primary/5" : "border-ink/15 hover:border-ink/40"
                  )}
                >
                  <Icon className={cn("h-6 w-6", isSelected ? "text-primary" : "text-accent")} aria-hidden />
                  <p className="mt-3 font-display text-xl">{path.title}</p>
                  <p className="mt-2 text-sm text-ink/65">{path.text}</p>
                </button>
              );
            })}
          </div>

          {type === "modelo" ? (
            <div className="mt-8">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-ink/60">
                Escolha a peça base
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {baseModels.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setBaseProductId(model.id)}
                    className={cn(
                      "border text-left transition-colors",
                      baseProductId === model.id
                        ? "border-primary"
                        : "border-transparent hover:border-ink/30"
                    )}
                  >
                    <div className="aspect-[3/4] bg-ink/5">
                      {model.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={model.imageUrl}
                          alt={model.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="p-2">
                      <p className="text-sm">{model.name}</p>
                      <p className="text-xs text-ink/50">a partir de {formatBRL(model.priceCents)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {type === "referencia" ? (
            <div className="mt-8 rounded-2xl border border-dashed border-ink/30 p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                }}
              />
              {referenceImageUrl ? (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={referenceImageUrl}
                    alt="Referência enviada"
                    className="mx-auto max-h-72 object-contain"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Trocar imagem
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-8 w-8 text-ink/40" aria-hidden />
                  <p className="mt-3 text-sm text-ink/65">
                    Envie a foto do look que você quer recriar — fantasia, festa ou o personagem
                    favorito.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Enviando…
                      </>
                    ) : (
                      "Escolher imagem"
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : null}

          {type === "ia" ? (
            <div className="mt-8 rounded-2xl border border-ink/15 bg-white/50 p-6">
              <Field
                label="Descreva a roupa dos sonhos"
                hint="Ex.: vestido de festa lilás com saia de tule, laço nas costas, borboletas bordadas"
              >
                <TextArea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Quanto mais detalhes, melhor o croqui…"
                />
              </Field>
              {aiEnabled ? (
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Button type="button" variant="accent" disabled={generating || pending} onClick={handleGenerate}>
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Gerando croqui…
                      </>
                    ) : aiImageUrl ? (
                      "Gerar outra versão"
                    ) : (
                      "Gerar croqui com IA"
                    )}
                  </Button>
                  <span className="text-xs text-ink/50">Você pode gerar quantas versões quiser.</span>
                </div>
              ) : (
                <p className="mt-3 text-xs text-ink/55">
                  A geração de croqui está temporariamente indisponível — sua descrição já é
                  suficiente para a avaliação do ateliê.
                </p>
              )}
              {aiImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={aiImageUrl}
                  alt="Croqui gerado por IA"
                  className="mx-auto mt-6 max-h-96 border border-ink/10 object-contain"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Passo 2: detalhes */}
      {step === 1 ? (
        <div className="mx-auto max-w-2xl space-y-5">
          <Field label="Tecido preferido">
            <Select value={fabric} onChange={(e) => setFabric(e.target.value)}>
              <option value="">Quero sugestão do ateliê</option>
              <option value="linho">Linho</option>
              <option value="seda">Seda</option>
              <option value="algodao">Algodão</option>
            </Select>
          </Field>
          <Field label="Cores e estampas" hint="Ex.: tons terrosos; nada de estampa; botões forrados">
            <TextInput value={colorNotes} onChange={(e) => setColorNotes(e.target.value)} />
          </Field>
          <Field
            label="Detalhes e observações"
            hint="Ocasião de uso, ajustes que você gosta, prazos, referências extras…"
          >
            <TextArea value={details} onChange={(e) => setDetails(e.target.value)} />
          </Field>
        </div>
      ) : null}

      {/* Passo 3: medidas */}
      {step === 2 ? (
        <div className="mx-auto max-w-2xl">
          <p className="mb-6 text-sm text-ink/65">
            Meça a criança com fita métrica, sobre roupas leves. Na dúvida, deixe em branco —
            confirmamos tudo com você pelo WhatsApp antes de cortar o tecido.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {MEASUREMENT_FIELDS.map((field) => (
              <Field key={field.key} label={field.label} hint={field.hint}>
                <TextInput
                  inputMode="decimal"
                  value={measurements[field.key] ?? ""}
                  onChange={(e) =>
                    setMeasurements((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                />
              </Field>
            ))}
          </div>
        </div>
      ) : null}

      {/* Passo 4: contato */}
      {step === 3 ? (
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" className="sm:col-span-2">
              <TextInput name="customerName" required autoComplete="name" />
            </Field>
            <Field label="E-mail">
              <TextInput name="customerEmail" type="email" required autoComplete="email" />
            </Field>
            <Field label="WhatsApp">
              <TextInput name="customerPhone" required placeholder="(92) 99999-9999" />
            </Field>
            <Field label="Cidade/UF" className="sm:col-span-2">
              <TextInput name="customerCity" placeholder="Manaus/AM" />
            </Field>
          </div>
          {error ? (
            <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>
          ) : null}
          <div className="mt-8 flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar
            </Button>
            <Button size="lg" disabled={pending}>
              {pending ? "Enviando…" : "Enviar encomenda"}
            </Button>
          </div>
          <p className="mt-4 text-center text-xs text-ink/50">
            Enviar a encomenda não gera cobrança — você recebe o orçamento antes de decidir.
          </p>
        </form>
      ) : null}

      {/* Navegação */}
      {step < 3 ? (
        <div className="mt-10 flex items-center justify-between">
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar
            </Button>
          ) : (
            <span />
          )}
          <Button
            type="button"
            disabled={step === 0 && !canAdvanceFromStep0()}
            onClick={() => {
              setError(null);
              setStep(step + 1);
            }}
          >
            Continuar <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ) : null}

      {error && step !== 3 ? (
        <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>
      ) : null}
    </div>
  );
}
