-- Auto-create profile when user signs up
-- This trigger runs in the database, bypassing RLS

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    id,
    name,
    age,
    weight,
    height,
    health_issues,
    account_created
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce((new.raw_user_meta_data ->> 'age')::integer, null),
    coalesce((new.raw_user_meta_data ->> 'weight')::numeric, null),
    coalesce((new.raw_user_meta_data ->> 'height')::numeric, null),
    coalesce(
      case 
        when new.raw_user_meta_data ->> 'health_issues' is not null 
        then ARRAY[new.raw_user_meta_data ->> 'health_issues']
        else ARRAY[]::text[]
      end,
      ARRAY[]::text[]
    ),
    now()
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger that fires after user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
