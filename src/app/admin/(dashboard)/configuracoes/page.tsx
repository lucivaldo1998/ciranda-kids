import { getSettings } from "@/lib/settings";
import { decrypt, maskSecret } from "@/lib/crypto";
import { formatBRL } from "@/lib/money";
import { PageHeader, Card, AdminField, adminInput, SubmitButton } from "@/components/admin/ui";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { saveSettingsAction, saveOpenAiKeyAction, removeOpenAiKeyAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const settings = await getSettings();

  let aiKeyMask: string | null = null;
  if (settings.openaiKeyCiphertext && settings.openaiKeyIv && settings.openaiKeyTag) {
    try {
      aiKeyMask = maskSecret(
        decrypt({
          ciphertext: settings.openaiKeyCiphertext,
          iv: settings.openaiKeyIv,
          authTag: settings.openaiKeyTag,
        })
      );
    } catch {
      aiKeyMask = "•••• (salva com outra chave de criptografia)";
    }
  }

  return (
    <>
      <PageHeader
        title="Configurações"
        subtitle="Marca, contato, identidade visual, frete e IA."
      />

      <form action={saveSettingsAction} className="space-y-6">
        <Card>
          <h2 className="mb-4 font-semibold">Marca & contato</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Nome da marca">
              <input name="brandName" defaultValue={settings.brandName} className={adminInput} />
            </AdminField>
            <AdminField label="Slogan">
              <input name="tagline" defaultValue={settings.tagline} className={adminInput} />
            </AdminField>
            <AdminField label="WhatsApp (com DDI)" hint="Ex.: 5592999999999">
              <input name="whatsapp" defaultValue={settings.whatsapp} className={adminInput} />
            </AdminField>
            <AdminField label="E-mail">
              <input name="email" defaultValue={settings.email ?? ""} className={adminInput} />
            </AdminField>
            <AdminField label="Telefone">
              <input name="phone" defaultValue={settings.phone ?? ""} className={adminInput} />
            </AdminField>
            <AdminField label="Instagram" hint="Ex.: @alva.atelie">
              <input name="instagram" defaultValue={settings.instagram ?? ""} className={adminInput} />
            </AdminField>
            <AdminField label="Endereço do ateliê">
              <input name="address" defaultValue={settings.address ?? ""} className={adminInput} />
            </AdminField>
            <AdminField label="CNPJ">
              <input name="cnpj" defaultValue={settings.cnpj ?? ""} className={adminInput} />
            </AdminField>
            <AdminField
              label="Barra de anúncio no topo do site"
              hint="Deixe vazio para esconder. Ex.: Frete grátis acima de R$ 400"
              className="sm:col-span-2"
            >
              <input name="announcement" defaultValue={settings.announcement ?? ""} className={adminInput} />
            </AdminField>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">Identidade visual</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminField label="Cor primária" hint="Botões, rodapé, títulos">
              <input type="color" name="primaryColor" defaultValue={settings.primaryColor} className="h-10 w-full cursor-pointer rounded-md border border-slate-300" />
            </AdminField>
            <AdminField label="Cor de destaque" hint="CTAs, detalhes, selos">
              <input type="color" name="accentColor" defaultValue={settings.accentColor} className="h-10 w-full cursor-pointer rounded-md border border-slate-300" />
            </AdminField>
            <AdminField label="Cor de fundo" hint="Fundo geral do site">
              <input type="color" name="backgroundColor" defaultValue={settings.backgroundColor} className="h-10 w-full cursor-pointer rounded-md border border-slate-300" />
            </AdminField>
          </div>
          <div className="mt-4">
            <ImageUploadField
              name="logoUrl"
              label="Logotipo (opcional)"
              defaultUrl={settings.logoUrl}
              hint="Sem logo, o site usa o nome da marca em tipografia elegante."
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">SEO</h2>
          <div className="grid gap-4">
            <AdminField label="Título do site (aba do navegador / Google)">
              <input name="seoTitle" defaultValue={settings.seoTitle ?? ""} className={adminInput} />
            </AdminField>
            <AdminField label="Descrição para buscadores">
              <textarea name="seoDescription" defaultValue={settings.seoDescription ?? ""} className={`${adminInput} min-h-20`} />
            </AdminField>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">Frete</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Valor fixo do frete" hint={`Hoje: ${formatBRL(settings.shippingFlatCents)}`}>
              <input name="shippingFlat" defaultValue={(settings.shippingFlatCents / 100).toFixed(2).replace(".", ",")} className={adminInput} />
            </AdminField>
            <AdminField
              label="Frete grátis a partir de"
              hint={settings.freeShippingAboveCents > 0 ? `Hoje: ${formatBRL(settings.freeShippingAboveCents)} · use 0 para desativar` : "Use 0 para desativar"}
            >
              <input name="freeShippingAbove" defaultValue={(settings.freeShippingAboveCents / 100).toFixed(2).replace(".", ",")} className={adminInput} />
            </AdminField>
            <AdminField label="Observação de frete mostrada no checkout" className="sm:col-span-2">
              <input name="shippingNote" defaultValue={settings.shippingNote ?? ""} className={adminInput} />
            </AdminField>
          </div>
        </Card>

        <div className="text-right">
          <SubmitButton>Salvar configurações</SubmitButton>
        </div>
      </form>

      <Card className="mt-6">
        <h2 className="font-semibold">Inteligência artificial (croquis do Ateliê)</h2>
        <p className="mt-1 text-sm text-slate-500">
          Com uma chave da OpenAI cadastrada, o cliente pode gerar croquis da peça dos sonhos no
          fluxo sob medida. A chave fica criptografada no banco.
        </p>
        <form action={saveOpenAiKeyAction} className="mt-4 flex flex-wrap items-end gap-3">
          <AdminField
            label="Chave da API OpenAI"
            hint={aiKeyMask ? `Chave atual: ${aiKeyMask} — preencha para substituir` : "sk-…"}
            className="min-w-64 flex-1"
          >
            <input name="openaiKey" type="password" autoComplete="new-password" className={adminInput} placeholder={aiKeyMask ? "••••••••" : "sk-…"} />
          </AdminField>
          <SubmitButton>Salvar chave</SubmitButton>
        </form>
        {aiKeyMask ? (
          <form action={removeOpenAiKeyAction} className="mt-2 text-right">
            <button type="submit" className="text-xs text-red-500 underline hover:text-red-700">
              Remover chave de IA
            </button>
          </form>
        ) : null}
      </Card>
    </>
  );
}
