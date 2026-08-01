import { getSettings } from "@/lib/settings";
import { CartProvider } from "@/components/cart/CartProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Header
          brandName={settings.brandName}
          logoUrl={settings.logoUrl}
          announcement={settings.announcement}
        />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        <WhatsAppButton whatsapp={settings.whatsapp} brandName={settings.brandName} />
      </div>
    </CartProvider>
  );
}
