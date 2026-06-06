-- Stabilize ConnectBloom activity_posts status updates for owner withdrawal and admin archive.
-- Focus: activity_posts archived / moderation_locked state transitions only.

alter table public.activity_posts
  add column if not exists closed_at timestamptz,
  add column if not exists archived_by uuid references public.profiles(id) on delete set null,
  add column if not exists archived_at timestamptz,
  add column if not exists moderation_locked boolean default false,
  add column if not exists updated_at timestamptz default now();

update public.activity_posts
set moderation_locked = false
where moderation_locked is null;

alter table public.activity_posts
  alter column moderation_locked set default false,
  alter column moderation_locked set not null;

alter table public.activity_posts
  drop constraint if exists activity_posts_status_valid;

alter table public.activity_posts
  add constraint activity_posts_status_valid
  check (status in ('open', 'closed', 'archived'));

create index if not exists activity_posts_archived_by_idx
  on public.activity_posts(archived_by)
  where archived_by is not null;

create index if not exists activity_posts_moderation_locked_idx
  on public.activity_posts(moderation_locked)
  where moderation_locked = true;

drop function if exists public.owner_withdraw_activity_post(uuid);

create function public.owner_withdraw_activity_post(p_post_id uuid)
returns table(success boolean, post_id uuid, status text)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  target_post public.activity_posts%rowtype;
begin
  if current_user_id is null then
    raise exception 'ログイン情報を確認できませんでした。'
      using errcode = '28000';
  end if;

  if p_post_id is null then
    raise exception '募集IDを確認できませんでした。'
      using errcode = '22004';
  end if;

  select *
    into target_post
  from public.activity_posts
  where id = p_post_id
  for update;

  if target_post.id is null then
    raise exception '対象の募集を確認できませんでした。'
      using errcode = 'P0002';
  end if;

  if target_post.created_by is distinct from current_user_id then
    raise exception '自分の募集のみ取り下げできます。'
      using errcode = '42501';
  end if;

  if coalesce(target_post.moderation_locked, false) then
    raise exception 'この募集は管理者により非表示になっています。'
      using errcode = '42501';
  end if;

  if target_post.status <> 'open' then
    raise exception '募集中の募集のみ取り下げできます。'
      using errcode = '22023';
  end if;

  update public.activity_posts as ap
  set status = 'archived',
      moderation_locked = false,
      archived_by = current_user_id,
      archived_at = now(),
      closed_at = coalesce(ap.closed_at, now()),
      updated_at = now()
  where ap.id = p_post_id
    and ap.created_by = current_user_id
    and ap.status = 'open'
    and coalesce(ap.moderation_locked, false) = false;

  if not found then
    raise exception '募集の取り下げに失敗しました。'
      using errcode = 'P0002';
  end if;

  return query select true, p_post_id, 'archived'::text;
end;
$$;

drop function if exists public.admin_archive_activity_post(uuid);

create function public.admin_archive_activity_post(p_post_id uuid)
returns table(success boolean, post_id uuid, status text, moderation_locked boolean)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  target_post public.activity_posts%rowtype;
begin
  if current_user_id is null then
    raise exception 'ログイン情報を確認できませんでした。'
      using errcode = '28000';
  end if;

  if not public.is_admin(current_user_id) then
    raise exception '管理者のみ募集を非表示にできます。'
      using errcode = '42501';
  end if;

  if p_post_id is null then
    raise exception '募集IDを確認できませんでした。'
      using errcode = '22004';
  end if;

  select *
    into target_post
  from public.activity_posts
  where id = p_post_id
  for update;

  if target_post.id is null then
    raise exception '対象の募集を確認できませんでした。'
      using errcode = 'P0002';
  end if;

  if target_post.status not in ('open', 'closed') then
    raise exception '公開中または締切済みの募集のみ非表示にできます。'
      using errcode = '22023';
  end if;

  update public.activity_posts as ap
  set status = 'archived',
      moderation_locked = true,
      archived_by = current_user_id,
      archived_at = now(),
      closed_at = coalesce(ap.closed_at, now()),
      updated_at = now()
  where ap.id = p_post_id
    and ap.status in ('open', 'closed');

  if not found then
    raise exception '募集の非表示に失敗しました。'
      using errcode = 'P0002';
  end if;

  return query select true, p_post_id, 'archived'::text, true;
end;
$$;

-- Keep the existing restore route stable, but make it explicit that only admins
-- can unlock and restore moderation-locked archived posts.
drop function if exists public.admin_restore_activity_post(uuid);

create function public.admin_restore_activity_post(p_post_id uuid)
returns setof public.activity_posts
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  target_status text;
begin
  if current_user_id is null then
    raise exception 'ログイン情報を確認できませんでした。'
      using errcode = '28000';
  end if;

  if not public.is_admin(current_user_id) then
    raise exception '管理者のみ募集を再表示できます。'
      using errcode = '42501';
  end if;

  if p_post_id is null then
    raise exception '募集IDを確認できませんでした。'
      using errcode = '22004';
  end if;

  select status
    into target_status
  from public.activity_posts
  where id = p_post_id
  for update;

  if target_status is null then
    raise exception '対象の募集を確認できませんでした。'
      using errcode = 'P0002';
  end if;

  if target_status <> 'archived' then
    raise exception '非表示の募集のみ再表示できます。'
      using errcode = '22023';
  end if;

  return query
  update public.activity_posts as ap
  set status = 'open',
      moderation_locked = false,
      archived_by = null,
      archived_at = null,
      closed_at = null,
      updated_at = now()
  where ap.id = p_post_id
    and ap.status = 'archived'
  returning ap.*;

  if not found then
    raise exception '募集の再表示に失敗しました。'
      using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.owner_withdraw_activity_post(uuid) from public;
revoke all on function public.admin_archive_activity_post(uuid) from public;
revoke all on function public.admin_restore_activity_post(uuid) from public;
grant execute on function public.owner_withdraw_activity_post(uuid) to authenticated;
grant execute on function public.admin_archive_activity_post(uuid) to authenticated;
grant execute on function public.admin_restore_activity_post(uuid) to authenticated;

notify pgrst, 'reload schema';
