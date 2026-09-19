'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export async function employerSignInAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/employer/login?error=invalid_credentials');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect('/employer/login?error=invalid_credentials');
  }

  const { data: employer } = await supabase
    .from('employers')
    .select('user_id')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
    .eq('active', true)
    .maybeSingle();

  if (!employer) {
    await supabase.auth.signOut();
    redirect('/employer/login?error=not_employer');
  }

  redirect('/employer/dashboard');
}