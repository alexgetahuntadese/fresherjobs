import { signInAction } from './actions';

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;

  const authError =
    resolvedSearchParams?.error === 'invalid_credentials'
      ? 'The email or password is incorrect. Please try again.'
      : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0b16] px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-white/10 glass-panel p-8 shadow-soft">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">
            admin access
          </p>
          <h1 className="mt-3 font-serif text-3xl font-medium text-white">Sign in</h1>
        </div>

        <form action={signInAction} className="space-y-5">
          {authError ? (
            <div className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-400/10 px-3 py-2 text-sm text-fuchsia-200">
              {authError}
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none ring-0 transition placeholder:text-slate-500 focus:border-violet-300"
              placeholder="admin@company.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-300"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-violet-400 to-fuchsia-400 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110"
          >
            Continue to dashboard
          </button>
        </form>
      </div>
    </main>
  );
}
