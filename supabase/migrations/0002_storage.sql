-- ============================================================================
-- Storage bucket : deliverables
-- À exécuter après 0001_init.sql.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('deliverables', 'deliverables', false)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Convention de path : <project_id>/<uuid>-<filename>
-- (storage.foldername(name))[1] = project_id
-- ----------------------------------------------------------------------------

drop policy if exists "deliverables storage read members" on storage.objects;
create policy "deliverables storage read members"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'deliverables'
    and (
      public.is_project_member(((storage.foldername(name))[1])::uuid)
      or public.is_project_supervisor(((storage.foldername(name))[1])::uuid)
    )
  );

drop policy if exists "deliverables storage insert members" on storage.objects;
create policy "deliverables storage insert members"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'deliverables'
    and (
      public.is_project_member(((storage.foldername(name))[1])::uuid)
      or public.is_project_supervisor(((storage.foldername(name))[1])::uuid)
    )
  );

drop policy if exists "deliverables storage delete owner or supervisor" on storage.objects;
create policy "deliverables storage delete owner or supervisor"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'deliverables'
    and (
      owner = auth.uid()
      or public.is_project_supervisor(((storage.foldername(name))[1])::uuid)
    )
  );
