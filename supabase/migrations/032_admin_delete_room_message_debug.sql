-- Temporary production diagnostics for ConnectBloom room-message admin delete.
-- Replaces the admin helper so Founder email is accepted even when profiles is
-- missing, and replaces the delete RPC with a table return that is easier for
-- the frontend to verify.

create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select case
    when user_id is null then false
    when exists (
      select 1
      from auth.users u
      where u.id = user_id
        and lower(trim(coalesce(u.email, ''))) = 'mypaceotoko@gmail.com'
    ) then true
    when exists (
      select 1
      from public.profiles p
      where p.id = user_id
        and p.role = 'admin'
    ) then true
    else false
  end;
$$;

-- A function return type cannot be changed in place, so drop the previous uuid
-- returning version before creating the table-returning diagnostic version.
drop function if exists public.admin_delete_chat_room_message(uuid);

create function public.admin_delete_chat_room_message(
  p_message_id uuid
)
returns table (
  success boolean,
  deleted_message_id uuid
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'auth uid missing'
      using errcode = '28000';
  end if;

  if p_message_id is null then
    raise exception 'message id missing'
      using errcode = '22004';
  end if;

  if not public.is_admin(auth.uid()) then
    raise exception 'not admin'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.chat_room_messages
    where id = p_message_id
  ) then
    raise exception 'message not found'
      using errcode = 'P0002';
  end if;

  delete from public.chat_room_messages
  where id = p_message_id
  returning id into deleted_message_id;

  if deleted_message_id is null then
    raise exception 'delete returned no rows'
      using errcode = 'P0002';
  end if;

  success := true;
  return next;
end;
$$;

revoke all on function public.admin_delete_chat_room_message(uuid) from public;
grant execute on function public.admin_delete_chat_room_message(uuid) to authenticated;

notify pgrst, 'reload schema';
