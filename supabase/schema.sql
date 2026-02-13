-- Create a table for public profiles using Supabase Auth
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  company_name text,
  rep_name text,
  reply_email text,
  domain_keyword text,
  is_admin boolean default false,
  plan_type text default 'free', -- 'free', 'pro', 'unlimited_free'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, is_admin, plan_type)
  values (
    new.id,
    new.email,
    -- Check if the email matches the admin email (replace with actual admin email if known, or handle in app logic)
    -- For now, we defaults to false. The prompt mentioned "your admin email", which implies a specific logic.
    -- We'll implement a simple check: if email is the specific one, make admin/unlimited.
    case when new.email = 'YOUR_ADMIN_EMAIL@example.com' then true else false end,
    case when new.email = 'YOUR_ADMIN_EMAIL@example.com' then 'unlimited_free' else 'free' end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Leads table
create table leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  company_name text not null,
  address text,
  industry text,
  website text,
  status text default 'new', -- 'new', 'sent', 'opened', 'replied'
  extracted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table leads enable row level security;

create policy "Users can view own leads" on leads
  for select using (auth.uid() = user_id);

create policy "Users can insert own leads" on leads
  for insert with check (auth.uid() = user_id);

create policy "Users can update own leads" on leads
  for update using (auth.uid() = user_id);

-- Videos table
create table videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  storage_path text not null,
  type text not null, -- 'master', 'personalized'
  target_lead_id uuid references leads(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table videos enable row level security;

create policy "Users can view own videos" on videos
  for select using (auth.uid() = user_id);

create policy "Users can insert own videos" on videos
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own videos" on videos
  for delete using (auth.uid() = user_id);


-- Settings table
create table settings (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  daily_limit integer default 100,
  stripe_pk text,
  stripe_sk text, -- minimal security note: storing SK in DB is risky, usually better in env vars or encrypted
  sending_hours_start time default '09:00',
  sending_hours_end time default '19:00',
  skip_weekends boolean default true,
  google_maps_key text,
  auto_cleanup_90_days boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table settings enable row level security;

create policy "Users can view own settings" on settings
  for select using (auth.uid() = user_id);

create policy "Users can update own settings" on settings
  for update using (auth.uid() = user_id);

create policy "Users can insert own settings" on settings
  for insert with check (auth.uid() = user_id);

-- Function to automatically create settings row? Or handle in app.
-- Let's add it to the handle_new_user trigger for convenience.
create or replace function public.handle_new_user_settings()
returns trigger as $$
begin
  insert into public.settings (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for settings
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_user_settings();
-- Wait, trigger on profiles insert is cleaner than modifying the auth trigger.
-- Revised handle_new_user to just insert profile.
