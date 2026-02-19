-- Final consolidated schema for V-Lync

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email text,
    company_name text,
    rep_name text,
    reply_email text,
    domain_keyword text,
    is_admin boolean DEFAULT false,
    plan_type text DEFAULT 'free',
    company_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Settings table
CREATE TABLE IF NOT EXISTS public.settings (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
    daily_limit integer DEFAULT 100,
    stripe_pk text,
    stripe_sk text,
    sending_hours_start time DEFAULT '09:00',
    sending_hours_end time DEFAULT '19:00',
    skip_weekends boolean DEFAULT true,
    google_maps_key text,
    auto_cleanup_90_days boolean DEFAULT false,
    onboarding_step integer NOT NULL DEFAULT 1,
    onboarding_completed boolean NOT NULL DEFAULT false,
    pdf_asset_path text,
    video_asset_path text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    company_name text NOT NULL,
    address text,
    industry text,
    website text,
    status text DEFAULT 'new',
    extracted_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    storage_path text NOT NULL,
    type text NOT NULL,
    target_lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Unsubscribes table
CREATE TABLE IF NOT EXISTS public.unsubscribes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    email text NOT NULL,
    token text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, email)
);

ALTER TABLE public.unsubscribes ENABLE ROW LEVEL SECURITY;

-- Sending queue table
CREATE TABLE IF NOT EXISTS public.sending_queue (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
    status text DEFAULT 'queued',
    scheduled_at timestamp with time zone,
    sent_at timestamp with time zone,
    error_log text,
    campaign_id uuid,
    skip_reason text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.sending_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
    -- Profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- Settings
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own settings' AND tablename = 'settings') THEN
        CREATE POLICY "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own settings' AND tablename = 'settings') THEN
        CREATE POLICY "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own settings' AND tablename = 'settings') THEN
        CREATE POLICY "Users can insert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Leads
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own leads' AND tablename = 'leads') THEN
        CREATE POLICY "Users can view own leads" ON leads FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own leads' AND tablename = 'leads') THEN
        CREATE POLICY "Users can insert own leads" ON leads FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own leads' AND tablename = 'leads') THEN
        CREATE POLICY "Users can update own leads" ON leads FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Videos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own videos' AND tablename = 'videos') THEN
        CREATE POLICY "Users can view own videos" ON videos FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own videos' AND tablename = 'videos') THEN
        CREATE POLICY "Users can insert own videos" ON videos FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own videos' AND tablename = 'videos') THEN
        CREATE POLICY "Users can delete own videos" ON videos FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- Unsubscribes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own unsubscribes' AND tablename = 'unsubscribes') THEN
        CREATE POLICY "Users can view own unsubscribes" ON unsubscribes FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own unsubscribes' AND tablename = 'unsubscribes') THEN
        CREATE POLICY "Users can insert own unsubscribes" ON unsubscribes FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Sending Queue
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own sending queue' AND tablename = 'sending_queue') THEN
        CREATE POLICY "Users can view own sending queue" ON sending_queue FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own sending queue' AND tablename = 'sending_queue') THEN
        CREATE POLICY "Users can update own sending queue" ON sending_queue FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own sending queue' AND tablename = 'sending_queue') THEN
        CREATE POLICY "Users can insert own sending queue" ON sending_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_queue_campaign ON public.sending_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON public.sending_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_user_status ON public.sending_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_created_at ON public.sending_queue(created_at DESC);

-- Triggers (Auth-related)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin, plan_type)
  VALUES (
    new.id,
    new.email,
    CASE WHEN new.email = 'YOUR_ADMIN_EMAIL@example.com' THEN true ELSE false END,
    CASE WHEN new.email = 'YOUR_ADMIN_EMAIL@example.com' THEN 'unlimited_free' ELSE 'free' END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 【修正】トリガー作成をDO $$ブロック内に移動
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.settings (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 【修正】トリガー作成をDO $$ブロック内に移動
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_profile_created') THEN
        CREATE TRIGGER on_profile_created
          AFTER INSERT ON public.profiles
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_settings();
    END IF;
END $$;
