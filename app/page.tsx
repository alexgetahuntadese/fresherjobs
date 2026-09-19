import Image from 'next/image';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { JOB_SECTORS } from '@/lib/job-sectors';
import type { Database } from '@/types/database';

// Public job board. Rebuilds every 60 seconds to keep the board fresh without full static rebuilds.
export const revalidate = 60;
export const dynamic = 'force-dynamic';

type JobRecord = Database['public']['Tables']['jobs']['Row'];

type HomePageProps = {
  searchParams?: Promise<{ q?: string; category?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
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

  const filters = await searchParams;
  const search = filters?.q?.trim() ?? '';
  const category = JOB_SECTORS.includes(filters?.category as (typeof JOB_SECTORS)[number])
    ? filters?.category
    : '';
  const safeSearch = search.replace(/[,%()]/g, ' ');

  const supabase = await createClient();
  let jobsQuery = supabase
    .from('jobs')
    .select('*')
    .not('published_at', 'is', null);

  if (category) {
    jobsQuery = jobsQuery.eq('sector', category);
  }

  if (safeSearch) {
    jobsQuery = jobsQuery.or(`title.ilike.%${safeSearch}%,company_name.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%`);
  }

  const { data: jobs, error } = await jobsQuery.order('published_at', { ascending: false });

  if (error) {
    console.error('Unable to fetch published jobs.', error);
  }

  const publishedJobs: JobRecord[] = jobs ?? [];

  return (
    <main className="relative min-h-screen overflow-hidden text-slate-100">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-[28rem] h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
        <header className="glass-panel mb-12 flex flex-col gap-6 rounded-[2rem] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div className="w-full">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="inline-flex items-center gap-3" aria-label="FresherJobs home">
                <Image src="/fresherjobs-logo.jpg" alt="FresherJobs" width={352} height={192} priority className="h-16 w-auto max-w-[230px] rounded-2xl bg-white p-2 shadow-[0_12px_40px_rgba(167,139,250,0.22)] object-contain" />
              </Link>
              <nav aria-label="Main navigation" className="flex w-full flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#0d0b16]/80 p-2 text-base font-semibold text-slate-200 shadow-[0_12px_36px_rgba(0,0,0,0.25)] sm:w-auto">
                <Link href="/" className="rounded-xl bg-white/[0.08] px-4 py-2.5 text-white transition hover:bg-white/[0.14] hover:text-violet-200">Home</Link>
                <Link href="/#jobs" className="rounded-xl px-4 py-2.5 transition hover:bg-white/[0.08] hover:text-white">New jobs</Link>
                <Link href="/post-job" className="rounded-xl px-4 py-2.5 transition hover:bg-white/[0.08] hover:text-white">Post a job</Link>
              </nav>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">
              curated opportunities
            </p>
            <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-white sm:text-6xl">
              Fresh roles for <span className="text-gradient">ambitious talent</span>
            </h1>            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Discover thoughtful opportunities across Ethiopia, built for people ready to make their next move.
            </p>
          </div>
        </header>

        <form method="get" className="glass-panel mb-8 grid gap-3 rounded-[2rem] p-4 sm:grid-cols-[1fr_220px_auto] sm:p-5">
          <label className="sr-only" htmlFor="job-search">Search jobs</label>
          <input
            id="job-search"
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Search title, company, or location"
            className="rounded-xl border border-white/10 bg-[#0d0b16] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-300"
          />
          <label className="sr-only" htmlFor="job-category">Filter by sector</label>
          <select
            id="job-category"
            name="category"
            defaultValue={category}
            className="rounded-xl border border-white/10 bg-[#0d0b16] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-violet-300"
          >
            <option value="">All sectors</option>
            {JOB_SECTORS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-violet-400 to-fuchsia-400 px-5 py-3 text-sm font-semibold text-[#160d24] transition hover:brightness-110"
          >
            Search jobs
          </button>
        </form>

        {(search || category) ? (
          <div className="mb-6 flex items-center justify-between gap-4 text-sm text-slate-400">
            <p>Showing {publishedJobs.length} matching {publishedJobs.length === 1 ? 'role' : 'roles'}.</p>
            <Link href="/" className="text-violet-200 transition hover:text-white">Clear filters</Link>
          </div>
        ) : null}
        {publishedJobs.length === 0 ? (
          <section className="glass-panel gradient-border rounded-[2rem] p-10 text-center shadow-soft">
            <p className="text-lg text-slate-200">No jobs are live right now.</p>
            <p className="mt-2 text-sm text-slate-400">
              Check back soon for new opportunities from our hiring partners.
            </p>
          </section>
        ) : (
          <section id="jobs" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {publishedJobs.map((job) => (
              <article
                key={job.id}
                className="glass-panel gradient-border group relative overflow-hidden rounded-[2rem] p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-violet-300/40 hover:shadow-[0_24px_70px_rgba(124,58,237,0.2)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-200/70">
                      {job.company_name}
                    </p>
                    <h2 className="mt-3 font-serif text-2xl font-medium text-white">{job.title}</h2>
                  </div>

                  {job.is_featured ? (
                    <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200">
                      Featured
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-200">
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1">{job.location}</span>
                  <span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-violet-200">
                    {job.job_type}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-300 transition-colors group-hover:text-slate-200">
                  {job.description.length > 180
                    ? `${job.description.slice(0, 180).trimEnd()}…`
                    : job.description}
                </p>

                {<details className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04]">
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-violet-200 transition hover:text-white">
                      Read full job description <span className="ml-1 text-violet-300">⌄</span>
                    </summary>
                    <div className="border-t border-white/10 px-4 py-4 text-sm leading-7 whitespace-pre-line text-slate-300">
                      {job.description}
                    </div>
                  </details>}

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

                  <Link href={`/apply/${job.id}`} className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 px-4 py-2 text-sm font-semibold text-[#160d24] shadow-[0_8px_30px_rgba(167,139,250,0.25)] transition hover:brightness-110"
                  >
                    Apply
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}



