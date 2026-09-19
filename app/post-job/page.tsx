import Image from 'next/image';
import Link from 'next/link';

import { SubmitButton } from '@/app/components/submit-button';
import { JOB_SECTORS } from '@/lib/job-sectors';

import { submitPublicJobAction } from './actions';

type PostJobPageProps = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function PostJobPage({ searchParams }: PostJobPageProps) {
  const params = await searchParams;
  const success = params?.success === '1';
  const error = params?.error;

  return (
    <main className="min-h-screen px-6 py-12 text-slate-100 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" aria-label="FresherJobs home">
            <Image src="/freshers-job-board-logo.png" alt="FresherJobs" width={1674} height={779} priority className="h-14 w-auto rounded-2xl bg-white p-2 object-contain" />
          </Link>
          <Link href="/" className="text-sm text-violet-200 transition hover:text-white">Back to jobs</Link>
        </div>

        <section className="glass-panel gradient-border rounded-[2rem] p-6 shadow-soft sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">for employers</p>
          <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-white">Post a job for review</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">Submit your opportunity below. Our team will review it before publishing it to the public job board.</p>

          {success ? (
            <div className="mt-8 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-5 text-emerald-100" aria-live="polite">
              <p className="font-semibold">Submission received.</p>
              <p className="mt-1 text-sm text-emerald-100/80">Your job is pending review. It will appear publicly after approval.</p>
              <Link href="/" className="mt-4 inline-flex rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-950">Browse jobs</Link>
            </div>
          ) : (
            <form action={submitPublicJobAction} className="mt-8 space-y-5">
              {error ? <div aria-live="polite" className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-400/10 px-4 py-3 text-sm text-fuchsia-100">{error === 'missing_fields' ? 'Please complete every field.' : error === 'invalid_url' ? 'Please provide a valid HTTP or HTTPS application URL.' : error === 'duplicate_job' ? 'A matching job already exists for this company and location.' : 'We could not submit this job. Please try again.'}</div> : null}

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200"><span>Job title</span><input name="title" required className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-4 py-3 text-slate-100 outline-none focus:border-violet-300" placeholder="Frontend Engineer" /></label>
                <label className="space-y-2 text-sm text-slate-200"><span>Company name</span><input name="company_name" required className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-4 py-3 text-slate-100 outline-none focus:border-violet-300" placeholder="Northstar Labs" /></label>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200"><span>Location</span><input name="location" required className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-4 py-3 text-slate-100 outline-none focus:border-violet-300" placeholder="Remote or Addis Ababa" /></label>
                <label className="space-y-2 text-sm text-slate-200"><span>Job type</span><select name="job_type" required defaultValue="Full-time" className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-4 py-3 text-slate-100 outline-none focus:border-violet-300"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></label>
              </div>
              <label className="block space-y-2 text-sm text-slate-200"><span>Sector</span><select name="sector" required defaultValue="Other" className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-4 py-3 text-slate-100 outline-none focus:border-violet-300">{JOB_SECTORS.map((sector) => <option key={sector}>{sector}</option>)}</select></label>
              <label className="block space-y-2 text-sm text-slate-200"><span>Application URL</span><input name="apply_url" type="url" required className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-4 py-3 text-slate-100 outline-none focus:border-violet-300" placeholder="https://example.com/careers" /></label>
              <label className="block space-y-2 text-sm text-slate-200"><span>Job description</span><textarea name="description" required rows={7} className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-4 py-3 text-slate-100 outline-none focus:border-violet-300" placeholder="Describe the role, responsibilities, and candidate profile." /></label>
              <div className="flex justify-end border-t border-white/10 pt-5"><SubmitButton pendingLabel="Sending for review...">Submit for review</SubmitButton></div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
