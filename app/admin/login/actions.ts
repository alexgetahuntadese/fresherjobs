'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export async function signInAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/admin/login?error=invalid_credentials');
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect('/admin/login?error=invalid_credentials');
  }

  const metadata = data.user.user_metadata ?? {};
  if (metadata.username && metadata.company_name) {
    const { error: employerError } = await supabase.from('employers').upsert({
      user_id: data.user.id,
      username: String(metadata.username).trim(),
      company_name: String(metadata.company_name).trim(),
    }, { onConflict: 'user_id', ignoreDuplicates: true });

    if (employerError) console.error('Unable to create employer profile after sign in.', employerError);
  }

  revalidatePath('/admin');
  redirect('/admin/dashboard');
}


export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/');
  redirect('/admin/login');
}


