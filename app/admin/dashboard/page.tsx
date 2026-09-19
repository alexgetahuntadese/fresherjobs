import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { SubmitButton } from '@/app/components/submit-button';
import { ConfirmSubmitButton } from '@/app/components/confirm-submit-button';
import { JOB_SECTORS } from '@/lib/job-sectors';

import { createJobAction, deleteJobAction, releaseJobAction, updateJobAction } from './actions';
import { signOutAction } from '../login/actions';

type DashboardPageProps = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function AdminDashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/admin/login');
  }

  const resolvedSearchParams = await searchParams;

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Unable to fetch admin job list.', error);
  }

  const { data: employers } = await supabase
    .from('employers')
    .select('user_id, username, company_name')
    .eq('active', true)
    .order('company_name');

  const errorMessage =
    resolvedSearchParams?.error === 'missing_fields'
      ? 'Please complete every required field before publishing a job.'
      : resolvedSearchParams?.error === 'invalid_url'
        ? 'Please provide a valid HTTP or HTTPS application URL.'
        : resolvedSearchParams?.error === 'missing_id'
          ? 'A job ID was not provided and the record could not be deleted.'
          : resolvedSearchParams?.error === 'invalid_sector'
            ? 'Please select a valid job sector.'
            : resolvedSearchParams?.error === 'duplicate_job'
            ? 'A matching job already exists for this company and location.'
            : null;
  const successMessage =
    resolvedSearchParams?.success === 'updated'
      ? 'Job details saved.'
      : resolvedSearchParams?.success === 'released'
        ? 'Job released to the public board.'
        : null;

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex min-w-0 flex-col gap-5 rounded-3xl border border-white/10 glass-panel p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Image src="/fresherjobs-logo.jpg" alt="FresherJobs" width={352} height={192} priority className="mb-4 h-16 w-auto max-w-[250px] rounded-2xl bg-white p-1.5 shadow-[0_10px_32px_rgba(167,139,250,0.18)] object-contain" />
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">
              dashboard
            </p>
            <h1 className="mt-2 font-serif text-3xl font-medium text-white">Manage job listings</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-[#0d0b16] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600"
          >
            View public board
          </Link>
          <form action={signOutAction} className="inline-flex">
            <button type="submit" className="inline-flex items-center justify-center rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-2 text-sm font-medium text-fuchsia-100 transition hover:bg-fuchsia-400/20">Sign out</button>
          </form>
          </div>
        </header>

        {errorMessage ? (
          <div className="rounded-2xl border border-fuchsia-400/40 bg-fuchsia-400/10 px-4 py-3 text-sm text-fuchsia-200">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200" aria-live="polite">
            {successMessage}
          </div>
        ) : null}

        <section className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
          <div className="min-w-0 overflow-hidden rounded-3xl border border-white/10 glass-panel p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-white">Create a job</h2>

            <form action={createJobAction} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-slate-200">
                  Job title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none transition focus:border-violet-300"
                  placeholder="Frontend Engineer"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="company_name" className="text-sm font-medium text-slate-200">
                  Company name
                </label>
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none transition focus:border-violet-300"
                  placeholder="Northstar Labs"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium text-slate-200">
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none transition focus:border-violet-300"
                    placeholder="Remote • US"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="job_type" className="text-sm font-medium text-slate-200">
                    Job type
                  </label>
                  <select
                    id="job_type"
                    name="job_type"
                    required
                    defaultValue="Full-time"
                    className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none transition focus:border-violet-300"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="sector" className="text-sm font-medium text-slate-200">
                  Job sector
                </label>
                <select
                  id="sector"
                  name="sector"
                  required
                  defaultValue="Other"
                  className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none transition focus:border-violet-300"
                >
                  {JOB_SECTORS.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="employer_id" className="text-sm font-medium text-slate-200">
                  Assign employer
                </label>
                <select
                  id="employer_id"
                  name="employer_id"
                  defaultValue=""
                  className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none transition focus:border-violet-300"
                >
                  <option value="">Unassigned (admin managed)</option>
                  {employers?.map((employer) => (
                    <option key={employer.user_id} value={employer.user_id}>
                      {employer.company_name} · {employer.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="apply_url" className="text-sm font-medium text-slate-200">
                  Apply URL
                </label>
                <input
                  id="apply_url"
                  name="apply_url"
                  type="url"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none transition focus:border-violet-300"
                  placeholder="https://example.com/careers/frontend"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-slate-200">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={6}
                  className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none transition focus:border-violet-300"
                  placeholder="Describe the role, responsibilities, and candidate profile."
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input type="checkbox" name="is_featured" className="h-4 w-4 rounded border-white/10 bg-[#0d0b16]" />
                Mark as featured listing
              </label>

              <SubmitButton pendingLabel="Publishing…">Publish job</SubmitButton>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 glass-panel p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Current listings</h2>
              <span className="rounded-full border border-white/10 bg-[#0d0b16] px-2.5 py-1 text-xs text-slate-300">
                {jobs?.length ?? 0} jobs
              </span>
            </div>

            <div className="space-y-4">
              {jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <article
                    key={job.id}
                    className="min-w-0 rounded-2xl border border-white/10 bg-[#0d0b16]/60 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-all text-lg font-semibold text-white">{job.title}</h3>
                        <p className="mt-1 break-all text-sm text-slate-400">
                          {job.company_name} • {job.location}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400/10 px-2.5 py-1 text-xs font-medium text-violet-100">
                          {job.job_type}
                        </span>
                        {job.published_at ? (
                          <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-200">Published</span>
                        ) : (
                          <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-200">Pending review</span>
                        )}
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 break-all text-sm leading-6 text-slate-300">{job.description}</p>

                    <details className="mt-4 rounded-2xl border border-violet-300/15 bg-violet-400/[0.04]">
                      <summary className="cursor-pointer select-none break-words list-none px-4 py-3 text-sm font-medium text-violet-200 transition hover:bg-violet-400/10 hover:text-white"><span className="mr-2 text-violet-300">▾</span> Review and edit full job details</summary>
                      <form action={updateJobAction} className="space-y-4 border-t border-white/10 p-4">
                        <input type="hidden" name="id" value={job.id} />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="space-y-2 text-sm text-slate-200"><span>Job title</span><input name="title" required defaultValue={job.title} className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none focus:border-violet-300" /></label>
                          <label className="space-y-2 text-sm text-slate-200"><span>Company name</span><input name="company_name" required defaultValue={job.company_name} className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none focus:border-violet-300" /></label>
                          <label className="space-y-2 text-sm text-slate-200"><span>Location</span><input name="location" required defaultValue={job.location} className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none focus:border-violet-300" /></label>
                          <label className="space-y-2 text-sm text-slate-200"><span>Job type</span><select name="job_type" required defaultValue={job.job_type} className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none focus:border-violet-300"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></label>
                          <label className="space-y-2 text-sm text-slate-200"><span>Sector</span><select name="sector" required defaultValue={job.sector} className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none focus:border-violet-300">{JOB_SECTORS.map((sector) => <option key={sector}>{sector}</option>)}</select></label>
                          <label className="space-y-2 text-sm text-slate-200"><span>Assign employer</span><select name="employer_id" defaultValue={job.employer_id ?? ''} className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none focus:border-violet-300"><option value="">Unassigned (admin managed)</option>{employers?.map((employer) => <option key={employer.user_id} value={employer.user_id}>{employer.company_name} · {employer.username}</option>)}</select></label>
                        </div>
                        <label className="block space-y-2 text-sm text-slate-200"><span>Apply URL</span><input name="apply_url" type="url" required defaultValue={job.apply_url} className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none focus:border-violet-300" /></label>
                        <label className="block space-y-2 text-sm text-slate-200"><span>Full description</span><textarea name="description" required rows={10} defaultValue={job.description} className="w-full rounded-xl border border-white/10 bg-[#0d0b16] px-3 py-2.5 text-slate-100 outline-none focus:border-violet-300" /></label>
                        <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" name="is_featured" defaultChecked={job.is_featured} className="h-4 w-4 rounded border-white/10 bg-[#0d0b16]" /> Mark as featured listing</label>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                          <button type="submit" className="rounded-full bg-violet-300 px-4 py-2 text-sm font-semibold text-violet-950 transition hover:bg-violet-200">Save changes</button>
                          {job.published_at ? <span className="text-sm text-emerald-200">Already live on the public board</span> : <button type="submit" formAction={releaseJobAction} className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-200">Release to public board</button>}
                        </div>
                      </form>
                    </details>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-violet-300 transition hover:text-violet-100"
                      >
                        View listing
                      </a>

                      <form action={deleteJobAction} className="inline-flex">
                        <input type="hidden" name="id" value={job.id} />
                        <ConfirmSubmitButton
                          message="Delete this job listing? This action cannot be undone."
                          className="rounded-full border border-fuchsia-400/40 bg-fuchsia-400/10 px-3 py-1.5 text-sm font-medium text-fuchsia-200 transition hover:bg-fuchsia-400/20"
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d0b16]/30 p-6 text-center text-slate-400">
                  No jobs have been published yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

