-- Ensure all onboarding related columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rep_name text;

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 1;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pdf_asset_path text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS video_asset_path text;

-- Ensure RLS policies are permissive for self-updates
DO $$
BEGIN
    -- profiles policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    -- settings policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own settings' AND tablename = 'settings') THEN
        CREATE POLICY "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own settings' AND tablename = 'settings') THEN
        CREATE POLICY "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own settings' AND tablename = 'settings') THEN
        CREATE POLICY "Users can insert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
