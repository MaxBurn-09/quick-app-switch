ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS action text,
  ADD COLUMN IF NOT EXISTS admin_note text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;