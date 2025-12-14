-- Ensure property-images bucket exists and allow authenticated uploads/reads

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

alter table storage.objects enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'Property images are publicly readable'
    ) then
        create policy "Property images are publicly readable"
            on storage.objects for select
            using (bucket_id = 'property-images');
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'Authenticated can manage property images'
    ) then
        create policy "Authenticated can manage property images"
            on storage.objects for all
            using (
                bucket_id = 'property-images'
                and (auth.role() = 'authenticated')
            )
            with check (
                bucket_id = 'property-images'
                and (auth.role() = 'authenticated')
            );
    end if;
end;
$$;
