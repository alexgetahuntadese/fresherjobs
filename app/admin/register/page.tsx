import Image from 'next/image';
import Link from 'next/link';
import { registerEmployerAction } from './actions';

type RegisterPageProps = { searchParams?: Promise<{ error?: string }> };

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0b16] px-6 py-16 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-white/10 glass-panel p-8 shadow-soft">
        <div className="mb-8 text-center">
          <Image src="/fresherjobs-logo.jpg" alt="FresherJobs" width={352} height={192} priority className="mx-auto mb-6 h-24 w-auto max-w-[300px] rounded-2xl bg-white p-2 object-contain" />
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">employer access</p>
          <h1 className="mt-3 font-serif text-3xl font-medium text-white">Create an account</h1>
        </div>
        {params?.error ? <p className="mb-5 rounded-xl border border-fuchsia-400/40 bg-fuchsia-400/10 px-3 py-2 text-sm text-fuchsia-200">{params.error === 'missing_fields' ? 'Complete all fields. Passwords must be at least 6 characters.' : 'Unable to create the account. Please check your details.'}</p> : null}
        <form action={registerEmployerAction} className="space-y-5">
          <input name="username" required placeholder="Username" className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none focus:border-violet-300" />
          <input name="company_name" required placeholder="Company name" className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none focus:border-violet-300" />
          <input name="email" type="email" required placeholder="Work email" className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none focus:border-violet-300" />
          <input name="password" type="password" minLength={6} required placeholder="Password (6+ characters)" className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none focus:border-violet-300" />
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-violet-400 to-fuchsia-400 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110">Create account</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">Already registered? <Link href="/admin/login" className="text-violet-200 hover:text-white">Sign in</Link></p>
      </div>
    </main>
  );
}
