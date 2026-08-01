import { prisma } from "@/lib/prisma";
import { decrypt, maskSecret } from "@/lib/crypto";
import { getSiteUrl } from "@/lib/payments/config";
import { PageHeader, Card, AdminField, adminInput, SubmitButton } from "@/components/admin/ui";
import { saveGatewayAction, clearGatewaySecretsAction } from "./actions";

export const dynamic = "force-dynamic";

type GatewayMeta = {
  id: "mercadopago" | "stripe" | "cielo";
  name: string;
  description: string;
  publicKeyLabel: string;
  publicKeyHint: string;
  secretLabel: string;
  secretHint: string;
  webhookSecretLabel?: string;
  webhookPath: string;
  docsUrl: string;
};

const GATEWAYS: GatewayMeta[] = [
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "PIX direto no site + cartão via Checkout Pro. O mais usado no Brasil.",
    publicKeyLabel: "Public Key",
    publicKeyHint: "APP_USR-… (Suas integrações → Credenciais)",
    secretLabel: "Access Token",
    secretHint: "APP_USR-… — fica criptografado no banco",
    webhookPath: "/api/webhooks/mercadopago",
    docsUrl: "https://www.mercadopago.com.br/developers/pt/docs/your-integrations/credentials",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Cartões internacionais via Stripe Checkout.",
    publicKeyLabel: "Publishable key",
    publicKeyHint: "pk_live_… ou pk_test_…",
    secretLabel: "Secret key",
    secretHint: "sk_live_… ou sk_test_… — fica criptografada no banco",
    webhookSecretLabel: "Webhook signing secret (whsec_…)",
    webhookPath: "/api/webhooks/stripe",
    docsUrl: "https://dashboard.stripe.com/apikeys",
  },
  {
    id: "cielo",
    name: "Cielo",
    description: "Cartão de crédito transparente (o cliente não sai do site). API E-commerce 3.0.",
    publicKeyLabel: "MerchantId",
    publicKeyHint: "GUID fornecido pela Cielo",
    secretLabel: "MerchantKey",
    secretHint: "Chave da API — fica criptografada no banco",
    webhookPath: "/api/webhooks/cielo",
    docsUrl: "https://desenvolvedores.cielo.com.br/api-portal/",
  },
];

function safeMask(ciphertext: string | null, iv: string | null, tag: string | null) {
  if (!ciphertext || !iv || !tag) return null;
  try {
    return maskSecret(decrypt({ ciphertext, iv, authTag: tag }));
  } catch {
    return "•••• (chave salva com outra SETTINGS_ENCRYPTION_KEY)";
  }
}

export default async function PagamentosPage() {
  const rows = await prisma.paymentGateway.findMany();
  const byId = new Map(rows.map((r) => [r.id, r]));
  const siteUrl = getSiteUrl();

  return (
    <>
      <PageHeader
        title="Pagamentos"
        subtitle="Conecte seus provedores. O checkout mostra automaticamente as formas de pagamento dos gateways ativos."
      />

      <div className="space-y-6">
        {GATEWAYS.map((meta) => {
          const row = byId.get(meta.id);
          const secretMask = safeMask(
            row?.secretCiphertext ?? null,
            row?.secretIv ?? null,
            row?.secretTag ?? null
          );
          const webhookMask = safeMask(
            row?.webhookSecretCiphertext ?? null,
            row?.webhookSecretIv ?? null,
            row?.webhookSecretTag ?? null
          );
          return (
            <Card key={meta.id}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{meta.name}</h2>
                  <p className="text-sm text-slate-500">{meta.description}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    row?.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {row?.active ? "Ativo no checkout" : "Inativo"}
                </span>
              </div>

              <form action={saveGatewayAction} className="grid gap-4 sm:grid-cols-2">
                <input type="hidden" name="id" value={meta.id} />

                <AdminField label={meta.publicKeyLabel} hint={meta.publicKeyHint}>
                  <input
                    name="publicKey"
                    defaultValue={row?.publicKey ?? ""}
                    className={adminInput}
                    autoComplete="off"
                  />
                </AdminField>

                <AdminField
                  label={meta.secretLabel}
                  hint={secretMask ? `Chave atual: ${secretMask} — preencha para substituir` : meta.secretHint}
                >
                  <input
                    name="secret"
                    type="password"
                    placeholder={secretMask ? "••••••••" : ""}
                    className={adminInput}
                    autoComplete="new-password"
                  />
                </AdminField>

                {meta.webhookSecretLabel ? (
                  <AdminField
                    label={meta.webhookSecretLabel}
                    hint={
                      webhookMask
                        ? `Atual: ${webhookMask} — preencha para substituir`
                        : "Necessário para confirmar pagamentos automaticamente"
                    }
                  >
                    <input
                      name="webhookSecret"
                      type="password"
                      placeholder={webhookMask ? "••••••••" : ""}
                      className={adminInput}
                      autoComplete="new-password"
                    />
                  </AdminField>
                ) : null}

                <div className="flex items-end gap-6 pb-1">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" name="active" defaultChecked={row?.active ?? false} />
                    Ativo no checkout
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" name="testMode" defaultChecked={row?.testMode ?? true} />
                    Modo de teste (sandbox)
                  </label>
                </div>

                <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400">
                    Webhook:{" "}
                    <code className="rounded bg-slate-100 px-1.5 py-0.5">
                      {siteUrl}
                      {meta.webhookPath}
                    </code>
                    {" · "}
                    <a
                      href={meta.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-slate-600"
                    >
                      onde encontro as chaves?
                    </a>
                  </p>
                  <SubmitButton>Salvar {meta.name}</SubmitButton>
                </div>
              </form>

              {row?.secretCiphertext ? (
                <form action={clearGatewaySecretsAction} className="mt-3 text-right">
                  <input type="hidden" name="id" value={meta.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-500 underline hover:text-red-700"
                  >
                    Remover chaves salvas
                  </button>
                </form>
              ) : null}
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 bg-slate-50">
        <h3 className="font-semibold">Como funciona</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>As chaves secretas são criptografadas (AES-256-GCM) antes de ir para o banco e nunca são reexibidas.</li>
          <li>Com o <strong>Mercado Pago</strong> ativo, o cliente vê PIX (QR Code na tela) e cartão em até 12x.</li>
          <li>Com a <strong>Cielo</strong> ativa, o cartão é digitado direto no seu site, sem redirecionar.</li>
          <li>Use o <strong>modo de teste</strong> com credenciais de sandbox antes de ativar as chaves de produção.</li>
          <li>Cadastre a URL de webhook no painel de cada provedor para o pedido ser confirmado sozinho.</li>
        </ul>
      </Card>
    </>
  );
}
