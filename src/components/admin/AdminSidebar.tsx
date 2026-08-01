"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Scissors,
  PenSquare,
  CreditCard,
  Settings,
  Menu,
  X,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/atelie", label: "Ateliê sob medida", icon: Scissors },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/conteudo", label: "Conteúdo do site", icon: PenSquare },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminSidebar({
  brandName,
  logoutAction,
}: {
  brandName: string;
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const content = (
    <>
      <div className="flex items-center gap-3 px-5 py-6">
        <span className="flex h-9 w-9 items-center justify-center bg-white text-sm font-black text-slate-950">
          {brandName.slice(0, 1)}
        </span>
        <div>
          <p className="text-sm font-bold tracking-[0.2em] text-white">{brandName}</p>
          <p className="text-xs text-slate-400">Painel administrativo</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-white/10 px-3 py-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          Ver o site
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Sair
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-slate-950 px-4 py-3 lg:hidden">
        <span className="text-sm font-bold tracking-[0.15em] text-white">{brandName} · Admin</span>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          className="rounded-md p-2 text-white hover:bg-white/10"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </header>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-slate-950 lg:flex">
        {content}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} aria-hidden />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-slate-950">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar menu"
              className="absolute right-3 top-3 rounded-md p-2 text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            {content}
          </div>
        </div>
      ) : null}
    </>
  );
}
