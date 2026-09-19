import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { SubmitButton } from '@/app/components/submit-button';

import { submitApplicationAction } from './actions';

type ApplyPageProps = {
  params: Promise<{ jobId: string }>;
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function ApplyPage({ params, searchParams }: ApplyPageProps) {
  const { jobId } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .not('published_at', 'is', null)
    .maybeSingle();

  if (!job) {
    notFound();
  }

  const errorMessage =
    query?.error === 'missing_fields'
      ? 'Please complete your name, email, phone number, and add a CV link or file.'
      : query?.error === 'invalid_email'
        ? 'Please enter a valid email address.'
        : query?.error === 'invalid_cv_url'
          ? 'Please provide a valid HTTP or HTTPS CV link.'
          : query?.error === 'invalid_cv_file'
            ? 'Please upload a PDF, DOC, or DOCX file up to 3 MB.'
            : query?.error === 'duplicate_application'
              ? 'An application from this email already exists for this job.'
                            : query?.error === 'upload_failed'
                ? 'We could not upload that CV. Please try again or submit a public CV link instead.'
                : query?.error === 'submission_failed'
                  ? 'We could not save your application right now. Please try again in a moment.'
                  : query?.error === 'config_error'
                    ? 'Applications are temporarily unavailable. Please try again later.'
                    : null;

  return (
    <main className="min-h-screen px-6 py-12 text-slate-100 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-violet-200/70 transition hover:text-violet-100">
          ← Back to opportunities
        </Link>

        <section className="glass-panel gradient-border mt-8 rounded-[2rem] p-6 sm:p-10">
          <div className="border-b border-white/10 pb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">application</p>
            <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-white">Apply for {job.title}</h1>
            <p className="mt-3 text-slate-300">{job.company_name} · {job.location}</p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm font-medium text-white">About this role</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-300">{job.description}</p>
            </div>
          </div>

          {query?.success ? (
            <div className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-100">
              <p className="font-medium">Application received.</p>
              <p className="mt-1 text-sm text-emerald-100/75">Your details were saved. Continue to the employer’s application page to complete the process.</p>
              <a href={job.apply_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-200">
                Continue to employer →
              </a>
            </div>
          ) : (
            <form action={submitApplicationAction} encType="multipart/form-data" className="mt-8 space-y-6">
              <input type="hidden" name="job_id" value={job.id} />

              {errorMessage ? (
                <div className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-3 text-sm text-fuchsia-100">
                  {errorMessage}
                </div>
              ) : null}

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200">
                  <span>Full name</span>
                  <input name="full_name" required autoComplete="name" className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-4 py-3 text-slate-100 outline-none transition focus:border-violet-300" placeholder="Alex Morgan" />
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  <span>Email address</span>
                  <input name="email" type="email" required autoComplete="email" className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-4 py-3 text-slate-100 outline-none transition focus:border-violet-300" placeholder="alex@example.com" />
                </label>
              </div>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Phone number</span>
                <input name="phone" type="tel" required autoComplete="tel" className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-4 py-3 text-slate-100 outline-none transition focus:border-violet-300" placeholder="+254 700 000 000" />
              </label>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm font-medium text-white">CV or resume</p>
                <p className="mt-1 text-xs text-slate-400">Upload a PDF/DOC/DOCX up to 3 MB, or provide a public link.</p>
                <label className="mt-4 block space-y-2 text-sm text-slate-200">
                  <span>Upload CV</span>
                  <input name="cv_file" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="block w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-3 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-violet-400/15 file:px-3 file:py-2 file:text-sm file:font-medium file:text-violet-100" />
                </label>
                <label className="mt-4 block space-y-2 text-sm text-slate-200">
                  <span>Or CV link</span>
                  <input name="cv_url" type="url" className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-4 py-3 text-slate-100 outline-none transition focus:border-violet-300" placeholder="https://drive.google.com/..." />
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-6">
                <p className="max-w-sm text-xs leading-5 text-slate-400">Your application is submitted once. Double-clicks are disabled while it is processing.</p>
                <SubmitButton pendingLabel="Submitting…">Submit application</SubmitButton>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}