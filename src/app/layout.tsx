import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import "./globals.css";

// Fontes carregadas via Google Fonts no cliente (link abaixo) — os nomes das famílias
// são mapeados em globals.css (--font-display-src / --font-body-src).
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.seoTitle ?? `${settings.brandName} — ${settings.tagline}`;
  const description =
    settings.seoDescription ??
    "Moda infantil com costura artesanal — conforto para brincar, capricho para durar. Peças prontas e sob medida.";
  return { title, description };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <style>{`:root{--brand-primary:${settings.primaryColor};--brand-accent:${settings.accentColor};--brand-canvas:${settings.backgroundColor};}`}</style>
        {children}
      </body>
    </html>
  );
}
