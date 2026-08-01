"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/loja", label: "Lojinha" },
  { href: "/atelie", label: "Ateliê Sob Medida" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export function Header({
  brandName,
  logoUrl,
  announcement,
}: {
  brandName: string;
  logoUrl: string | null;
  announcement: string | null;
}) {
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-canvas/95 backdrop-blur">
      {announcement ? (
        <div className="bg-primary px-4 py-2 text-center text-xs uppercase tracking-[0.2em] text-canvas">
          {announcement}
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <button
          type="button"
          className="p-1 md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={brandName} className="h-9 w-auto" />
          ) : (
            <span className="font-display text-2xl font-bold tracking-wide text-primary">
              {brandName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-xs uppercase tracking-[0.2em] transition-colors",
                pathname?.startsWith(item.href)
                  ? "text-accent"
                  : "text-ink/70 hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/carrinho" className="relative p-1" aria-label="Carrinho">
          <ShoppingBag className="h-5 w-5" aria-hidden />
          {count > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-canvas">
              {count}
            </span>
          ) : null}
        </Link>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-canvas p-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="mb-8 self-end p-1"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            <nav className="flex flex-col gap-5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm uppercase tracking-[0.2em] text-ink/80"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
