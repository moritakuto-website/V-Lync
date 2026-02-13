-- Add company_url to profiles if not exists (using alter table safely)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company_url') THEN
        ALTER TABLE profiles ADD COLUMN company_url text;
    END IF;
END $$;

-- Unsubscribes Table
CREATE TABLE IF NOT EXISTS unsubscribes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    email text NOT NULL,
    token text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, email)
);

ALTER TABLE unsubscribes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unsubscribes" ON unsubscribes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own unsubscribes" ON unsubscribes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sending Queue Table
CREATE TABLE IF NOT EXISTS sending_queue (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
    status text DEFAULT 'queued', -- queued, sending, sent, skipped, failed
    scheduled_at timestamp with time zone,
    sent_at timestamp with time zone,
    error_log text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE sending_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sending queue" ON sending_queue
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sending queue" ON sending_queue
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sending queue" ON sending_queue
    FOR INSERT WITH CHECK (auth.uid() = user_id);
