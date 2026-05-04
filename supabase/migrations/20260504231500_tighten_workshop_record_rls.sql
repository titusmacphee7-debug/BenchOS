delete from public.workshop_records wr
where not exists (
  select 1
  from public.workshops w
  where w.id = wr.workshop_id
    and w.owner_user_id = wr.owner_user_id
);

drop policy if exists "Users can insert own workshop records" on public.workshop_records;
drop policy if exists "Users can select own workshop records" on public.workshop_records;
create policy "Users can select own workshop records"
on public.workshop_records for select
to authenticated
using (
  (select auth.uid()) = owner_user_id
  and exists (
    select 1
    from public.workshops w
    where w.id = workshop_id
      and w.owner_user_id = (select auth.uid())
  )
);

create policy "Users can insert own workshop records"
on public.workshop_records for insert
to authenticated
with check (
  (select auth.uid()) = owner_user_id
  and exists (
    select 1
    from public.workshops w
    where w.id = workshop_id
      and w.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "Users can update own workshop records" on public.workshop_records;
create policy "Users can update own workshop records"
on public.workshop_records for update
to authenticated
using ((select auth.uid()) = owner_user_id)
with check (
  (select auth.uid()) = owner_user_id
  and exists (
    select 1
    from public.workshops w
    where w.id = workshop_id
      and w.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "Users can delete own workshop records" on public.workshop_records;
create policy "Users can delete own workshop records"
on public.workshop_records for delete
to authenticated
using (
  (select auth.uid()) = owner_user_id
  and exists (
    select 1
    from public.workshops w
    where w.id = workshop_id
      and w.owner_user_id = (select auth.uid())
  )
);
