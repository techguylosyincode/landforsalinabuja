-- Ensure blog-assets bucket exists and add policies

-- Create bucket (public read by default) if missing
insert into storage.buckets (id, name, public)
values ('blog-assets', 'blog-assets', true)
on conflict (id) do nothing;

-- Public read policy
do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'Blog assets are publicly readable'
    ) then
        create policy "Blog assets are publicly readable"
            on storage.objects for select
            using (bucket_id = 'blog-assets');
    end if;
end;
$$;

-- Admin manage policy (insert/update/delete) based on profiles.role = 'admin'
do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'Admins can manage blog assets'
    ) then
        create policy "Admins can manage blog assets"
            on storage.objects for all
            using (
                bucket_id = 'blog-assets'
                and exists (
                    select 1 from public.profiles p
                    where p.id = auth.uid() and p.role = 'admin'
                )
            )
            with check (
                bucket_id = 'blog-assets'
                and exists (
                    select 1 from public.profiles p
                    where p.id = auth.uid() and p.role = 'admin'
                )
            );
    end if;
end;
$$;
