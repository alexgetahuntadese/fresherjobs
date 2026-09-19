import Image from 'next/image';

import { employerSignInAction } from './actions';

type EmployerLoginProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function EmployerLoginPage({ searchParams }: EmployerLoginProps) {
  const query = await searchParams;
  const message = query?.error === 'not_employer'
    ? 'This account is not registered as an active employer.'
    : query?.error === 'invalid_credentials'
      ? 'The email or password is incorrect.'
      : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16 text-slate-100">
      <section className="glass-panel gradient-border w-full max-w-md rounded-[2rem] p-8 shadow-soft">
        <Image src="/fresherjobs-logo.jpg" alt="FresherJobs" width={352} height={192} priority className="mx-auto mb-8 h-24 w-auto max-w-[300px] rounded-2xl bg-white p-2 object-contain" />
        <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">employer portal</p>
        <h1 className="mt-3 text-center font-serif text-3xl font-medium text-white">Track your applicants</h1>
        <p className="mt-3 text-center text-sm leading-6 text-slate-400">Sign in with the employer email and password created in Supabase Auth.</p>

        <form action={employerSignInAction} className="mt-8 space-y-5">
          {message ? <div className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-2 text-sm text-fuchsia-100">{message}</div> : null}
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Username / email</span>
            <input name="email" type="email" required autoComplete="username" className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-3 text-slate-100 outline-none transition focus:border-violet-300" placeholder="employer@company.com" />
          </label>
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Password</span>
            <input name="password" type="password" required autoComplete="current-password" className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-3 text-slate-100 outline-none transition focus:border-violet-300" />
          </label>
          <button type="submit" className="w-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 px-4 py-3 font-semibold text-[#160d24] transition hover:brightness-110">Sign in to employer portal</button>
        </form>
      </section>
    </main>
  );
}