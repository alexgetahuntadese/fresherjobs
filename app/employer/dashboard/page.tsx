import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

type EmployerDashboardProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function EmployerDashboardPage({ searchParams }: EmployerDashboardProps) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/employer/login');
  }

  const { data: employer } = await supabase
    .from('employers')
    .select('company_name, username')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle();

  if (!employer) {
    redirect('/employer/login?error=not_employer');
  }

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, location, job_type, sector, published_at')
    .eq('employer_id', user.id)
    .order('created_at', { ascending: false });

  const jobIds = (jobs ?? []).map((job) => job.id);
  const { data: applications } = jobIds.length
    ? await supabase.from('applications').select('*').in('job_id', jobIds).order('created_at', { ascending: false })
    : { data: [] };

  const jobNames = new Map((jobs ?? []).map((job) => [job.id, job.title]));
  const applicantRows = await Promise.all((applications ?? []).map(async (application) => {
    let cvLink = application.cv_url;
    if (!cvLink && application.cv_path) {
      const { data } = await supabase.storage.from('cv-uploads').createSignedUrl(application.cv_path, 3600);
      cvLink = data?.signedUrl ?? null;
    }
    return { ...application, cvLink };
  }));

  return (
    <main className="min-h-screen px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="glass-panel flex flex-col gap-5 rounded-[2rem] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">employer portal</p>
            <h1 className="mt-2 font-serif text-3xl font-medium text-white">Applicant tracking</h1>
            <p className="mt-2 text-sm text-slate-400">{employer.company_name} · {employer.username}</p>
          </div>
          <Link href="/" className="inline-flex rounded-full border border-white/10 bg-[#0d0b16] px-4 py-2 text-sm text-slate-200 transition hover:border-violet-300/50">View public board</Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="glass-panel rounded-2xl p-5"><p className="text-xs uppercase tracking-widest text-slate-400">Assigned jobs</p><p className="mt-2 font-serif text-3xl text-white">{jobs?.length ?? 0}</p></div>
          <div className="glass-panel rounded-2xl p-5"><p className="text-xs uppercase tracking-widest text-slate-400">Applications</p><p className="mt-2 font-serif text-3xl text-white">{applicantRows.length}</p></div>
          <div className="glass-panel rounded-2xl p-5"><p className="text-xs uppercase tracking-widest text-slate-400">Latest activity</p><p className="mt-2 text-sm text-violet-200">{applicantRows[0] ? new Date(applicantRows[0].created_at).toLocaleDateString() : 'No applications yet'}</p></div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">candidate pipeline</p><h2 className="mt-2 font-serif text-2xl text-white">Recent applicants</h2></div>
            <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-100">{applicantRows.length} total</span>
          </div>

          <div className="space-y-3">
            {applicantRows.length ? applicantRows.map((application) => (
              <article key={application.id} className="rounded-2xl border border-white/10 bg-[#0d0b16]/60 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{application.full_name}</h3>
                    <p className="mt-1 text-sm text-violet-200">{jobNames.get(application.job_id) ?? 'Assigned role'}</p>
                    <p className="mt-2 text-sm text-slate-400">{application.email} · {application.phone}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                    <span className="rounded-full border border-white/10 px-3 py-1">{new Date(application.created_at).toLocaleDateString()}</span>
                    {application.cvLink ? <a href={application.cvLink} target="_blank" rel="noreferrer" className="rounded-full bg-violet-400/15 px-3 py-1 text-violet-100 hover:bg-violet-400/25">View CV</a> : null}
                  </div>
                </div>
              </article>
            )) : <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">Applications for your assigned jobs will appear here.</div>}
          </div>
        </section>
      </div>
    </main>
  );
}