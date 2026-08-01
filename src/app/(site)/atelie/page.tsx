import { Camera, Shirt, Sparkles } from "lucide-react";
import { getContent, defaultAtelier, defaultHome } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ateliê sob medida" };

export default async function AteliePage() {
  const [content, home] = await Promise.all([
    getContent("atelie", defaultAtelier),
    getContent("home", defaultHome),
  ]);

  const steps = [
    { title: content.step1Title, text: content.step1Text },
    { title: content.step2Title, text: content.step2Text },
    { title: content.step3Title, text: content.step3Text },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={home.atelierImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <Container className="relative py-24 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-accent">
            Serviço especial · Por Cleide Lopes
          </p>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-medium leading-tight sm:text-5xl">
            {content.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-ink/70">{content.intro}</p>
          <div className="mt-9">
            <ButtonLink href="/atelie/encomendar" size="lg">
              Começar minha peça
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = [Shirt, Camera, Sparkles][i] ?? Shirt;
              return (
                <div key={step.title} className="rounded-2xl border border-ink/10 bg-white/40 p-8">
                  <Icon className="h-6 w-6 text-accent" aria-hidden />
                  <h2 className="mt-4 font-display text-2xl">{step.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{step.text}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 rounded-3xl border border-accent/30 bg-accent/5 p-8 text-center sm:p-12">
            <p className="font-display text-2xl sm:text-3xl">
              Da fantasia de super-herói ao vestido de princesa —
              <br className="hidden sm:block" /> se dá para imaginar, dá para costurar.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm text-ink/65">
              Produção artesanal e limitada: cada encomenda entra na fila do ateliê e recebe a
              atenção que uma peça única merece. O orçamento é sempre gratuito.
            </p>
            <div className="mt-8">
              <ButtonLink href="/atelie/encomendar" variant="accent" size="lg">
                Enviar minha encomenda
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
