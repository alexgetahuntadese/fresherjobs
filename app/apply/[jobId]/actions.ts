'use server';

import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

const allowedCvTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export async function submitApplicationAction(formData: FormData) {
  const jobId = String(formData.get('job_id') ?? '').trim();
  const fullName = String(formData.get('full_name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const phone = String(formData.get('phone') ?? '').trim();
  const cvUrl = String(formData.get('cv_url') ?? '').trim();
  const fileValue = formData.get('cv_file');
  const cvFile = typeof File !== 'undefined' && fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

  if (!jobId || !fullName || !email || !phone || (!cvUrl && !cvFile)) {
    redirect(`/apply/${jobId}?error=missing_fields`);
  }

  if (!/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(email)) {
    redirect(`/apply/${jobId}?error=invalid_email`);
  }

  if (cvUrl) {
    try {
      const parsedUrl = new URL(cvUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        redirect(`/apply/${jobId}?error=invalid_cv_url`);
      }
    } catch {
      redirect(`/apply/${jobId}?error=invalid_cv_url`);
    }
  }

  if (cvFile && (!allowedCvTypes.has(cvFile.type) || cvFile.size > 3 * 1024 * 1024)) {
    redirect(`/apply/${jobId}?error=invalid_cv_file`);
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect(`/apply/${jobId}?error=config_error`);
  }

  let cvPath: string | null = null;
  if (cvFile) {
    const extension = cvFile.name.split('.').pop()?.toLowerCase() || 'pdf';
    cvPath = `${jobId}/${randomUUID()}.${extension}`;
    let uploadError: { message: string } | null = null;

    try {
      const result = await supabase.storage
        .from('cv-uploads')
        .upload(cvPath, cvFile, { contentType: cvFile.type, upsert: false });
      uploadError = result.error;
    } catch {
      uploadError = { message: 'CV upload failed' };
    }

    if (uploadError) {
      redirect(`/apply/${jobId}?error=upload_failed`);
    }
  }

  let applicationError: { code?: string; message: string } | null = null;
  try {
    const result = await supabase.from('applications').insert({
      job_id: jobId,
      full_name: fullName,
      email,
      phone,
      cv_url: cvUrl || null,
      cv_path: cvPath,
    });
    applicationError = result.error;
  } catch {
    applicationError = { message: 'Application save failed' };
  }

  if (applicationError?.code === '23505') {
    redirect(`/apply/${jobId}?error=duplicate_application`);
  }

  if (applicationError) {
    redirect(`/apply/${jobId}?error=submission_failed`);
  }

  redirect(`/apply/${jobId}?success=1`);
}