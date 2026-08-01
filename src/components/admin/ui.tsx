import { cn } from "@/lib/cn";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white p-5 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </Card>
  );
}

const STATUS_COLORS: Record<string, string> = {
  aguardando_pagamento: "bg-amber-100 text-amber-800",
  pago: "bg-emerald-100 text-emerald-800",
  em_preparo: "bg-blue-100 text-blue-800",
  enviado: "bg-indigo-100 text-indigo-800",
  entregue: "bg-emerald-100 text-emerald-800",
  cancelado: "bg-red-100 text-red-700",
  nova: "bg-amber-100 text-amber-800",
  em_analise: "bg-blue-100 text-blue-800",
  orcamento_enviado: "bg-purple-100 text-purple-800",
  aprovada: "bg-emerald-100 text-emerald-800",
  em_producao: "bg-blue-100 text-blue-800",
  finalizada: "bg-emerald-100 text-emerald-800",
  entregue_atl: "bg-emerald-100 text-emerald-800",
  cancelada: "bg-red-100 text-red-700",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {label}
    </span>
  );
}

export const adminInput =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400";

export function AdminField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={cn(
        "rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700",
        className
      )}
    >
      {children}
    </button>
  );
}
