'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export async function submitPublicJobAction(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const companyName = String(formData.get('company_name') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const jobType = String(formData.get('job_type') ?? '').trim();
  const sector = String(formData.get('sector') ?? '').trim();
  const applyUrl = String(formData.get('apply_url') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!title || !companyName || !location || !jobType || !sector || !applyUrl || !description) {
    redirect('/post-job?error=missing_fields' as never);
  }

  try {
    const parsedUrl = new URL(applyUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      redirect('/post-job?error=invalid_url' as never);
    }
  } catch {
    redirect('/post-job?error=invalid_url' as never);
  }

  const supabase = await createClient();
  const { error } = await supabase.from('jobs').insert({
    title,
    company_name: companyName,
    location,
    job_type: jobType,
    sector,
    apply_url: applyUrl,
    description,
    is_featured: false,
    published_at: null,
    employer_id: null,
  });

  if (error?.code === '23505') {
    redirect('/post-job?error=duplicate_job' as never);
  }

  if (error) {
    redirect('/post-job?error=submission_failed' as never);
  }

  redirect('/post-job?success=1' as never);
}
