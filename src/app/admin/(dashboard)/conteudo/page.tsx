import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import {
  getContent,
  saveContent,
  defaultHome,
  defaultAbout,
  defaultAtelier,
} from "@/lib/content";
import { PageHeader, Card, AdminField, adminInput, SubmitButton } from "@/components/admin/ui";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export const dynamic = "force-dynamic";

function collect(formData: FormData, keys: string[]) {
  const result: Record<string, string> = {};
  for (const key of keys) {
    result[key] = String(formData.get(key) ?? "");
  }
  return result;
}

async function saveHomeAction(formData: FormData) {
  "use server";
  await requireAdminSession();
  await saveContent("home", collect(formData, Object.keys(defaultHome)));
  revalidatePath("/", "layout");
}

async function saveAboutAction(formData: FormData) {
  "use server";
  await requireAdminSession();
  await saveContent("sobre", collect(formData, Object.keys(defaultAbout)));
  revalidatePath("/sobre");
}

async function saveAtelierAction(formData: FormData) {
  "use server";
  await requireAdminSession();
  await saveContent("atelie", collect(formData, Object.keys(defaultAtelier)));
  revalidatePath("/atelie");
}

export default async function ConteudoPage() {
  const [home, about, atelier] = await Promise.all([
    getContent("home", defaultHome),
    getContent("sobre", defaultAbout),
    getContent("atelie", defaultAtelier),
  ]);

  return (
    <>
      <PageHeader
        title="Conteúdo do site"
        subtitle="Textos e imagens das páginas principais. Salvou, está no ar."
      />

      <div className="space-y-6">
        <Card>
          <h2 className="mb-4 font-semibold">Página inicial</h2>
          <form action={saveHomeAction} className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Frase pequena acima do título">
              <input name="heroKicker" defaultValue={home.heroKicker} className={adminInput} />
            </AdminField>
            <AdminField label="Texto do botão principal">
              <input name="heroCtaLabel" defaultValue={home.heroCtaLabel} className={adminInput} />
            </AdminField>
            <AdminField label="Título principal (hero)" className="sm:col-span-2">
              <input name="heroTitle" defaultValue={home.heroTitle} className={adminInput} />
            </AdminField>
            <AdminField label="Subtítulo do hero" className="sm:col-span-2">
              <textarea name="heroSubtitle" defaultValue={home.heroSubtitle} className={`${adminInput} min-h-16`} />
            </AdminField>
            <div className="sm:col-span-2">
              <ImageUploadField name="heroImageUrl" label="Imagem de fundo do hero" defaultUrl={home.heroImageUrl} />
            </div>
            <AdminField label="Título da seção de tecidos">
              <input name="fabricsTitle" defaultValue={home.fabricsTitle} className={adminInput} />
            </AdminField>
            <AdminField label="Introdução da seção de tecidos">
              <input name="fabricsIntro" defaultValue={home.fabricsIntro} className={adminInput} />
            </AdminField>
            <AdminField label="Texto sobre linho">
              <textarea name="fabricLinen" defaultValue={home.fabricLinen} className={`${adminInput} min-h-16`} />
            </AdminField>
            <AdminField label="Texto sobre seda">
              <textarea name="fabricSilk" defaultValue={home.fabricSilk} className={`${adminInput} min-h-16`} />
            </AdminField>
            <AdminField label="Texto sobre algodão">
              <textarea name="fabricCotton" defaultValue={home.fabricCotton} className={`${adminInput} min-h-16`} />
            </AdminField>
            <AdminField label="Título da seção do Ateliê">
              <input name="atelierTitle" defaultValue={home.atelierTitle} className={adminInput} />
            </AdminField>
            <AdminField label="Texto da seção do Ateliê" className="sm:col-span-2">
              <textarea name="atelierText" defaultValue={home.atelierText} className={`${adminInput} min-h-16`} />
            </AdminField>
            <div className="sm:col-span-2">
              <ImageUploadField name="atelierImageUrl" label="Imagem da seção do Ateliê" defaultUrl={home.atelierImageUrl} />
            </div>
            <div className="text-right sm:col-span-2">
              <SubmitButton>Salvar página inicial</SubmitButton>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">Página “Sobre”</h2>
          <form action={saveAboutAction} className="grid gap-4">
            <AdminField label="Título">
              <input name="title" defaultValue={about.title} className={adminInput} />
            </AdminField>
            <AdminField label="Texto (linhas em branco separam parágrafos)">
              <textarea name="text" defaultValue={about.text} className={`${adminInput} min-h-40`} />
            </AdminField>
            <ImageUploadField name="imageUrl" label="Imagem" defaultUrl={about.imageUrl} />
            <div className="text-right">
              <SubmitButton>Salvar “Sobre”</SubmitButton>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">Página do Ateliê</h2>
          <form action={saveAtelierAction} className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Título" className="sm:col-span-2">
              <input name="title" defaultValue={atelier.title} className={adminInput} />
            </AdminField>
            <AdminField label="Introdução" className="sm:col-span-2">
              <textarea name="intro" defaultValue={atelier.intro} className={`${adminInput} min-h-16`} />
            </AdminField>
            <AdminField label="Passo 1 — título">
              <input name="step1Title" defaultValue={atelier.step1Title} className={adminInput} />
            </AdminField>
            <AdminField label="Passo 1 — texto">
              <textarea name="step1Text" defaultValue={atelier.step1Text} className={`${adminInput} min-h-16`} />
            </AdminField>
            <AdminField label="Passo 2 — título">
              <input name="step2Title" defaultValue={atelier.step2Title} className={adminInput} />
            </AdminField>
            <AdminField label="Passo 2 — texto">
              <textarea name="step2Text" defaultValue={atelier.step2Text} className={`${adminInput} min-h-16`} />
            </AdminField>
            <AdminField label="Passo 3 — título">
              <input name="step3Title" defaultValue={atelier.step3Title} className={adminInput} />
            </AdminField>
            <AdminField label="Passo 3 — texto">
              <textarea name="step3Text" defaultValue={atelier.step3Text} className={`${adminInput} min-h-16`} />
            </AdminField>
            <div className="text-right sm:col-span-2">
              <SubmitButton>Salvar página do Ateliê</SubmitButton>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
