import Image from 'next/image';
import Link from 'next/link';

import { SubmitButton } from '@/app/components/submit-button';
import { signInAction } from './actions';

type LoginPageProps = {
  searchParams?: Promise<{ error?: string; registered?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;

  const authError =
    resolvedSearchParams?.error === 'invalid_credentials'
      ? 'The email or password is incorrect. Please try again.'
      : null;
  const isRegistrationComplete = resolvedSearchParams?.registered === '1';
  const registrationNotice = isRegistrationComplete ? 'Account created. Check your email if confirmation is required, then sign in.' : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0b16] px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-white/10 glass-panel p-8 shadow-soft">
        <div className="mb-8 text-center">
          <Image src="/fresherjobs-logo.jpg" alt="FresherJobs" width={352} height={192} priority className="mx-auto mb-6 h-24 w-auto max-w-[300px] rounded-2xl bg-white p-2 shadow-[0_12px_40px_rgba(167,139,250,0.22)] object-contain" />
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">
            {isRegistrationComplete ? 'account created' : 'admin access'}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-medium text-white">{isRegistrationComplete ? 'Check your email' : 'Sign in'}</h1>
        </div>

        {registrationNotice ? <div aria-live="polite" className="mb-5 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">{registrationNotice}</div> : null}

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
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            />
          </div>

          <SubmitButton pendingLabel="Signing in…">Continue to dashboard</SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">New job poster? <Link href="/admin/register" className="font-medium text-violet-200 transition hover:text-white">Create an account</Link></p>
      </div>
    </main>
  );
}






