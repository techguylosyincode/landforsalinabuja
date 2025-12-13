-- Track signup funnel events (abandonment analysis)
create table if not exists signup_events (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz not null default now(),
    event_type text not null, -- register_page_view, register_start, register_submit_attempt, register_success
    email text,
    role_selected text,
    user_id uuid,
    source_path text
);

create index if not exists idx_signup_events_email_created_at on signup_events(email, created_at desc);
create index if not exists idx_signup_events_event_created_at on signup_events(event_type, created_at desc);

-- Allow public insert/select for analysis (could be tightened to RLS later)
alter table signup_events enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'signup_events'
          and policyname = 'Allow insert signup events'
    ) then
        create policy "Allow insert signup events"
            on signup_events for insert
            with check (true);
    end if;
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public'
          and tablename = 'signup_events'
          and policyname = 'Allow read signup events'
    ) then
        create policy "Allow read signup events"
            on signup_events for select
            using (true);
    end if;
end;
$$;
