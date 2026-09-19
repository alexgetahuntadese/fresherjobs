import { redirect } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';

import { createJobAction, deleteJobAction } from './actions';

type DashboardPageProps = {
  searchParams?: Promise<{ error?: string }>;
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

  const errorMessage =
    resolvedSearchParams?.error === 'missing_fields'
      ? 'Please complete every required field before publishing a job.'
      : resolvedSearchParams?.error === 'invalid_url'
        ? 'Please provide a valid HTTP or HTTPS application URL.'
        : resolvedSearchParams?.error === 'missing_id'
          ? 'A job ID was not provided and the record could not be deleted.'
          : null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
              dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">Manage job listings</h1>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600"
          >
            View public board
          </Link>
        </header>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : null}

        <section className="grid gap-8 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft">
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition focus:border-sky-500"
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition focus:border-sky-500"
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
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition focus:border-sky-500"
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
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition focus:border-sky-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition focus:border-sky-500"
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition focus:border-sky-500"
                  placeholder="Describe the role, responsibilities, and candidate profile."
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input type="checkbox" name="is_featured" className="h-4 w-4 rounded border-slate-700 bg-slate-950" />
                Mark as featured listing
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                Publish job
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Current listings</h2>
              <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
                {jobs?.length ?? 0} jobs
              </span>
            </div>

            <div className="space-y-4">
              {jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <article
                    key={job.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {job.company_name} • {job.location}
                        </p>
                      </div>

                      <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-200">
                        {job.job_type}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm text-slate-300">{job.description}</p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-sky-300 transition hover:text-sky-200"
                      >
                        View listing
                      </a>

                      <form action={deleteJobAction} className="inline-flex">
                        <input type="hidden" name="id" value={job.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 p-6 text-center text-slate-400">
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
