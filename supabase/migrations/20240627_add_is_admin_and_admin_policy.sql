-- Migration: Add is_admin to profiles and admin RLS policy for workers
-- Date: 2024-06-27

-- 1. Add is_admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Set admin user
UPDATE public.profiles SET is_admin = TRUE WHERE email = '101maazpro@gmail.com';

-- 3. Add RLS policy to allow admins to update any worker
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Admin can update any worker' AND tablename = 'workers'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admin can update any worker"
      ON public.workers
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
        )
      );
    $$;
  END IF;
END $$; 