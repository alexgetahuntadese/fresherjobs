-- Create the jobs table used by the public job board and admin dashboard.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL,
  description TEXT NOT NULL,
  apply_url TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  USING (true);

CREATE POLICY "Allow authenticated write access"
  ON public.jobs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update access"
  ON public.jobs
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete access"
  ON public.jobs
  FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_jobs_published_at
  ON public.jobs (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_created_at
  ON public.jobs (created_at DESC);
