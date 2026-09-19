-- Create the jobs table used by the public job board and admin dashboard.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL,
  sector TEXT NOT NULL DEFAULT 'Other',
  description TEXT NOT NULL,
  apply_url TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employers are Supabase Auth users who can track applicants for assigned jobs.
CREATE TABLE IF NOT EXISTS public.employers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS employer_id UUID;

DO $$
BEGIN
  ALTER TABLE public.jobs
    ADD CONSTRAINT jobs_employer_id_fkey
    FOREIGN KEY (employer_id) REFERENCES public.employers(user_id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employers can view their own profile" ON public.employers;
DROP POLICY IF EXISTS "Employers can create their own profile" ON public.employers;
CREATE POLICY "Employers can create their own profile"
  ON public.employers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Employers can view their own profile"
  ON public.employers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
-- Backfill the sector column for databases created before sector filtering was introduced.
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS sector TEXT NOT NULL DEFAULT 'Other';

-- Ensure all rows are readable by everyone on the public job board.
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Make this script safe to re-run during local setup or deployment.
DROP POLICY IF EXISTS "Allow public read access" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated write access" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated update access" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON public.jobs;

CREATE POLICY "Allow public read access"
  ON public.jobs
  FOR SELECT
  USING (published_at IS NOT NULL OR (auth.role() = 'authenticated' AND (NOT EXISTS (SELECT 1 FROM public.employers WHERE user_id = auth.uid() AND active = true) OR employer_id = auth.uid())));

CREATE POLICY "Allow authenticated write access"
  ON public.jobs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND (NOT EXISTS (SELECT 1 FROM public.employers WHERE user_id = auth.uid() AND active = true) OR employer_id = auth.uid()));

CREATE POLICY "Allow authenticated update access"
  ON public.jobs
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND (NOT EXISTS (SELECT 1 FROM public.employers WHERE user_id = auth.uid() AND active = true) OR employer_id = auth.uid()))
  WITH CHECK (auth.role() = 'authenticated' AND (NOT EXISTS (SELECT 1 FROM public.employers WHERE user_id = auth.uid() AND active = true) OR employer_id = auth.uid()));

CREATE POLICY "Allow authenticated delete access"
  ON public.jobs
  FOR DELETE
  USING (auth.role() = 'authenticated' AND (NOT EXISTS (SELECT 1 FROM public.employers WHERE user_id = auth.uid() AND active = true) OR employer_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_jobs_published_at
  ON public.jobs (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_created_at
  ON public.jobs (created_at DESC);

-- Prevent accidental duplicate job listings for the same company and location.
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_unique_listing
  ON public.jobs (lower(title), lower(company_name), lower(location));

-- Candidate applications submitted from the public application form.
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cv_url TEXT,
  cv_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT applications_cv_source_check CHECK (cv_url IS NOT NULL OR cv_path IS NOT NULL)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public application submissions" ON public.applications;
DROP POLICY IF EXISTS "Allow authenticated application access" ON public.applications;

CREATE POLICY "Allow public application submissions"
  ON public.applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated application access"
  ON public.applications
  FOR SELECT
  TO authenticated
  USING (
    NOT EXISTS (SELECT 1 FROM public.employers WHERE user_id = auth.uid() AND active = true)
    OR EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
        AND jobs.employer_id = auth.uid()
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_job_email
  ON public.applications (job_id, lower(email));

-- Private CV storage. Applications store a path, not public file access.
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-uploads', 'cv-uploads', false)
ON CONFLICT (id) DO NOTHING;

UPDATE storage.buckets
SET
  public = false,
  file_size_limit = 3145728,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
WHERE id = 'cv-uploads';

DROP POLICY IF EXISTS "Allow public CV uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated CV access" ON storage.objects;

CREATE POLICY "Allow public CV uploads"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'cv-uploads');

CREATE POLICY "Allow authenticated CV access"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'cv-uploads'
    AND (
      NOT EXISTS (SELECT 1 FROM public.employers WHERE user_id = auth.uid() AND active = true)
      OR EXISTS (
        SELECT 1 FROM public.applications
        JOIN public.jobs ON jobs.id = applications.job_id
        WHERE applications.cv_path = storage.objects.name
          AND jobs.employer_id = auth.uid()
      )
    )
  );



