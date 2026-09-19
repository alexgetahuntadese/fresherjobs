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

  const { data: employerProfile } = await supabase
    .from('employers')
    .select('user_id, active')
    .eq('user_id', user.id)
    .maybeSingle();

  const title = String(formData.get('title') ?? '').trim();
  const companyName = String(formData.get('company_name') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const jobType = String(formData.get('job_type') ?? '').trim();
  const sector = String(formData.get('sector') ?? '').trim();
  const requestedEmployerId = String(formData.get('employer_id') ?? '').trim();
  const employerId = employerProfile?.active ? user.id : requestedEmployerId;
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



function getJobFields(formData: FormData) {
  return {
    title: String(formData.get('title') ?? '').trim(),
    company_name: String(formData.get('company_name') ?? '').trim(),
    location: String(formData.get('location') ?? '').trim(),
    job_type: String(formData.get('job_type') ?? '').trim(),
    sector: String(formData.get('sector') ?? '').trim(),
    employer_id: String(formData.get('employer_id') ?? '').trim() || null,
    apply_url: String(formData.get('apply_url') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    is_featured: formData.get('is_featured') === 'on',
  };
}

async function requireAuthenticatedAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  return supabase;
}

export async function updateJobAction(formData: FormData) {
  const supabase = await requireAuthenticatedAdmin();
  const jobId = String(formData.get('id') ?? '').trim();
  const fields = getJobFields(formData);
  if (!jobId) redirect('/admin/dashboard?error=missing_id');
  if (!fields.title || !fields.company_name || !fields.location || !fields.job_type || !fields.sector || !fields.apply_url || !fields.description) redirect('/admin/dashboard?error=missing_fields');
  try {
    const parsedUrl = new URL(fields.apply_url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) redirect('/admin/dashboard?error=invalid_url');
  } catch {
    redirect('/admin/dashboard?error=invalid_url');
  }
  const { error } = await supabase.from('jobs').update(fields).eq('id', jobId);
  if (error?.code === '23505') redirect('/admin/dashboard?error=duplicate_job');
  if (error) throw new Error('Unable to update job: ' + error.message);
  revalidatePath('/');
  revalidatePath('/admin/dashboard');
  redirect('/admin/dashboard?success=updated');
}

export async function releaseJobAction(formData: FormData) {
  const supabase = await requireAuthenticatedAdmin();
  const jobId = String(formData.get('id') ?? '').trim();
  if (!jobId) redirect('/admin/dashboard?error=missing_id');
  const { error } = await supabase.from('jobs').update({ published_at: new Date().toISOString() }).eq('id', jobId).is('published_at', null);
  if (error) throw new Error('Unable to release job: ' + error.message);
  revalidatePath('/');
  revalidatePath('/admin/dashboard');
  redirect('/admin/dashboard?success=released');
}
