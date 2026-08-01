import { MessageCircle, Mail, AtSign, MapPin } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { Container } from "@/components/ui/Container";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contato" };

export default async function ContatoPage() {
  const settings = await getSettings();
  const message = encodeURIComponent(`Olá! Vim pelo site da ${settings.brandName}.`);

  const channels = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "Atendimento direto com o ateliê",
      href: `https://wa.me/${settings.whatsapp}?text=${message}`,
    },
    settings.email
      ? { icon: Mail, label: "E-mail", value: settings.email, href: `mailto:${settings.email}` }
      : null,
    settings.instagram
      ? {
          icon: AtSign,
          label: "Instagram",
          value: settings.instagram,
          href: `https://instagram.com/${settings.instagram.replace("@", "")}`,
        }
      : null,
    settings.address
      ? { icon: MapPin, label: "Ateliê", value: settings.address, href: null }
      : null,
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string | null }[];

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">Fale com a gente</p>
        <h1 className="font-display text-4xl font-medium">Contato</h1>
        <p className="mt-4 text-ink/70">
          Dúvidas sobre peças, medidas, prazos ou encomendas sob medida? O caminho mais rápido é o
          WhatsApp — quem responde é o próprio ateliê.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const content = (
            <div className="flex h-full items-start gap-4 rounded-2xl border border-ink/15 bg-white/50 p-5 transition-colors hover:border-accent">
              <Icon className="mt-0.5 h-5 w-5 text-accent" aria-hidden />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/50">{channel.label}</p>
                <p className="mt-1 text-sm text-ink/85">{channel.value}</p>
              </div>
            </div>
          );
          return channel.href ? (
            <a
              key={channel.label}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {content}
            </a>
          ) : (
            <div key={channel.label}>{content}</div>
          );
        })}
      </div>
    </Container>
  );
}
