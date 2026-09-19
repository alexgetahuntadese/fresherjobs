import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

// Public job board. Rebuilds every 60 seconds to keep the board fresh without full static rebuilds.
export const revalidate = 60;
export const dynamic = 'force-dynamic';

type JobRecord = Database['public']['Tables']['jobs']['Row'];

export default async function HomePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
        <section className="w-full max-w-xl rounded-3xl border border-amber-500/40 bg-slate-900/90 p-8 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">setup required</p>
          <h1 className="mt-3 text-3xl font-bold text-white">FresherJobs is almost ready</h1>
          <p className="mt-4 text-slate-300">
            Connect the Supabase project in Vercel by adding the required environment variables.
          </p>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Unable to fetch published jobs.', error);
  }

  const publishedJobs: JobRecord[] = jobs ?? [];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
        <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
              curated opportunities
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Fresh roles for ambitious talent
            </h1>
          </div>

          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center rounded-full border border-sky-500/70 bg-sky-500/10 px-5 py-2.5 text-sm font-medium text-sky-200 transition hover:border-sky-400 hover:bg-sky-500/20"
          >
            Admin Login
          </Link>
        </header>

        {publishedJobs.length === 0 ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-soft">
            <p className="text-lg text-slate-200">No jobs are live right now.</p>
            <p className="mt-2 text-sm text-slate-400">
              Check back soon for new opportunities from our hiring partners.
            </p>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {publishedJobs.map((job) => (
              <article
                key={job.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft transition hover:-translate-y-1 hover:border-sky-500/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      {job.company_name}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">{job.title}</h2>
                  </div>

                  {job.is_featured ? (
                    <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                      Featured
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-200">
                  <span className="rounded-full bg-slate-800 px-2.5 py-1">{job.location}</span>
                  <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-sky-200">
                    {job.job_type}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-300">
                  {job.description.length > 180
                    ? `${job.description.slice(0, 180).trimEnd()}…`
                    : job.description}
                </p>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-800 pt-5">
                  <span className="text-xs text-slate-400">
                    {job.published_at
                      ? new Date(job.published_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recently posted'}
                  </span>

                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                  >
                    Apply
                  </a>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
