'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function registerEmployerAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const username = String(formData.get('username') ?? '').trim();
  const companyName = String(formData.get('company_name') ?? '').trim();

  if (!email || password.length < 6 || !username || !companyName) {
    redirect('/admin/register?error=missing_fields' as never);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, company_name: companyName } },
  });

  if (error) redirect('/admin/register?error=registration_failed' as never);

  if (data.user && data.session) {
    const { error: employerError } = await supabase.from('employers').insert({ user_id: data.user.id, username, company_name: companyName });
    if (employerError) redirect('/admin/register?error=profile_failed' as never);
    redirect('/admin/dashboard');
  }

  redirect('/admin/login?registered=1');
}

