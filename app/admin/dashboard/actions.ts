'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { JOB_SECTORS } from '@/lib/job-sectors';

// Creates a new public job posting and refreshes the route cache for the board.
export async function createJobAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const title = String(formData.get('title') ?? '').trim();
  const companyName = String(formData.get('company_name') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const jobType = String(formData.get('job_type') ?? '').trim();
  const sector = String(formData.get('sector') ?? '').trim();
  const employerId = String(formData.get('employer_id') ?? '').trim();
  const applyUrl = String(formData.get('apply_url') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const isFeatured = formData.get('is_featured') === 'on';

  if (!title || !companyName || !location || !jobType || !sector || !applyUrl || !description) {
    redirect('/admin/dashboard?error=missing_fields');
  }

  try {
    const parsedUrl = new URL(applyUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      redirect('/admin/dashboard?error=invalid_url');
    }
  } catch {
    redirect('/admin/dashboard?error=invalid_url');
  }

  const { data: duplicateJob } = await supabase
    .from('jobs')
    .select('id')
    .ilike('title', title)
    .ilike('company_name', companyName)
    .ilike('location', location)
    .maybeSingle();

  if (duplicateJob) {
    redirect('/admin/dashboard?error=duplicate_job');
  }
  const { error } = await supabase.from('jobs').insert({
    title,
    company_name: companyName,
    location,
    job_type: jobType,
    sector,
    employer_id: employerId || null,
    apply_url: applyUrl,
    description,
    is_featured: isFeatured,
    published_at: new Date().toISOString(),
  });

  if (error?.code === '23505') {
    redirect('/admin/dashboard?error=duplicate_job');
  }

  if (error) {
    throw new Error(`Unable to create new job: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/dashboard');
  redirect('/admin/dashboard');
}

export async function deleteJobAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const jobId = String(formData.get('id') ?? '').trim();

  if (!jobId) {
    redirect('/admin/dashboard?error=missing_id');
  }

  const { error } = await supabase.from('jobs').delete().eq('id', jobId);

  if (error) {
    throw new Error(`Unable to delete job: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin/dashboard');
  redirect('/admin/dashboard');
}
