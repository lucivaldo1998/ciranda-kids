import Link from "next/link";
import type { Settings } from "@/lib/settings";

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink/10 bg-primary text-canvas">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold tracking-wide">
            {settings.brandName}
          </p>
          <p className="mt-3 max-w-xs text-sm text-canvas/70">{settings.tagline}</p>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-canvas/50">
            Feito para brincar · Feito para durar
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-canvas/50">Navegue</p>
          <div className="flex flex-col gap-2.5">
            <Link href="/loja" className="hover:text-canvas/70">A lojinha</Link>
            <Link href="/atelie" className="hover:text-canvas/70">Ateliê sob medida</Link>
            <Link href="/sobre" className="hover:text-canvas/70">Nossa história</Link>
            <Link href="/contato" className="hover:text-canvas/70">Contato</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-canvas/50">Atendimento</p>
          <div className="flex flex-col gap-2.5 text-canvas/80">
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-canvas"
            >
              WhatsApp
            </a>
            {settings.email ? (
              <a href={`mailto:${settings.email}`} className="hover:text-canvas">
                {settings.email}
              </a>
            ) : null}
            {settings.instagram ? (
              <a
                href={`https://instagram.com/${settings.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-canvas"
              >
                Instagram
              </a>
            ) : null}
            {settings.address ? <p className="text-canvas/60">{settings.address}</p> : null}
          </div>
        </div>
      </div>
      <div className="border-t border-canvas/10 px-5 py-5 text-center text-xs text-canvas/50">
        © {year} {settings.brandName}. Peças feitas à mão pelo ateliê de Cleide Lopes.
        {settings.cnpj ? ` · CNPJ ${settings.cnpj}` : ""}
      </div>
    </footer>
  );
}
