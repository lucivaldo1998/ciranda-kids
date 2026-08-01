import { loginAction } from "./actions";

export const metadata = { title: "Entrar — Painel CIRANDA" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; from?: string }>;
}) {
  const { erro, from } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <form action={loginAction} className="w-full max-w-sm border border-white/10 bg-slate-900 p-8">
        <p className="font-display text-center text-3xl font-semibold tracking-[0.3em] text-white">
          CIRANDA
        </p>
        <p className="mt-1 text-center text-xs uppercase tracking-[0.2em] text-slate-400">
          Painel administrativo
        </p>

        <input type="hidden" name="from" value={from ?? "/admin"} />
        <label className="mt-8 block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            Senha
          </span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            className="w-full border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
          />
        </label>
        {erro ? <p className="mt-3 text-sm text-red-400">Senha incorreta.</p> : null}
        <button
          type="submit"
          className="mt-6 w-full bg-white px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-slate-950 hover:bg-slate-200"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
