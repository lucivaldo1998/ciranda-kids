import { cn } from "@/lib/cn";

const inputBase =
  "w-full rounded-xl border border-ink/20 bg-white/70 px-4 py-3 text-sm text-ink placeholder:text-ink/35 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-ink/70">
        {label}
      </span>
      {children}
      {hint && !error ? <span className="mt-1 block text-xs text-ink/45">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}

export function TextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputBase, className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputBase, "min-h-28", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(inputBase, "appearance-none", className)} {...props} />;
}
