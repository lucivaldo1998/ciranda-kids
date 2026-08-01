import { getContent, defaultAbout } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sobre" };

export default async function SobrePage() {
  const content = await getContent("sobre", defaultAbout);

  return (
    <Container className="py-16">
      <div className="grid items-start gap-12 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-ink/5 md:sticky md:top-28">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">Nossa história</p>
          <h1 className="font-display text-4xl font-medium leading-tight">{content.title}</h1>
          <div className="mt-6 space-y-4 leading-relaxed text-ink/75">
            {content.text.split("\n").filter(Boolean).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/loja">Ver a coleção</ButtonLink>
            <ButtonLink href="/atelie" variant="outline">
              Conhecer o Ateliê
            </ButtonLink>
          </div>
        </div>
      </div>
    </Container>
  );
}
