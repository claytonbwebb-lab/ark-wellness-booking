-- ============================================================
-- ARK Wellness Booking System — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ──────────────────────────────────────────
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text not null default '',
  phone      text not null default '',
  role       text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    'client'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ──────────────────────────────────────────
-- LOCATIONS
-- ──────────────────────────────────────────
create table if not exists locations (
  id      uuid primary key default uuid_generate_v4(),
  name    text not null,
  address text not null
);

alter table locations enable row level security;

create policy "locations_read_all" on locations for select using (true);

-- ──────────────────────────────────────────
-- AVAILABILITY
-- ──────────────────────────────────────────
create table if not exists availability (
  id          uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_hour  int not null check (start_hour between 0 and 23),
  end_hour    int not null check (end_hour between 0 and 23),
  unique (location_id, day_of_week)
);

alter table availability enable row level security;

create policy "availability_read_all" on availability for select using (true);
create policy "availability_admin_all" on availability for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ──────────────────────────────────────────
-- BOOKINGS
-- ──────────────────────────────────────────
create table if not exists bookings (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  location_id uuid not null references locations(id),
  date        date not null,
  start_time  time not null,
  end_time    time not null,
  status      text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at  timestamptz not null default now(),
  unique (location_id, date, start_time)
);

alter table bookings enable row level security;

create policy "bookings_select_own" on bookings for select using (auth.uid() = user_id);
create policy "bookings_insert_own" on bookings for insert with check (auth.uid() = user_id);
create policy "bookings_update_own_cancel" on bookings for update using (auth.uid() = user_id) with check (status = 'cancelled');
create policy "bookings_admin_all" on bookings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ──────────────────────────────────────────
-- SEED: locations + default availability
-- ──────────────────────────────────────────
do $$
declare
  loc1 uuid := gen_random_uuid();
  loc2 uuid := gen_random_uuid();
  loc3 uuid := gen_random_uuid();
  loc4 uuid := gen_random_uuid();
begin
  -- Insert locations with known UUIDs
  insert into locations (id, name, address) values
    (loc1, 'Ashton-under-Lyne', 'Greater Manchester'),
    (loc2, 'Manchester City Centre', 'Greater Manchester'),
    (loc3, 'Alderley Edge', 'Cheshire'),
    (loc4, 'County Kerry', 'Ireland')
  on conflict do nothing;

  -- Mon-Fri 9-5 for each location
  for day in 1..5 loop
    insert into availability (location_id, day_of_week, start_hour, end_hour) values (loc1, day, 9, 17) on conflict do nothing;
    insert into availability (location_id, day_of_week, start_hour, end_hour) values (loc2, day, 9, 17) on conflict do nothing;
    insert into availability (location_id, day_of_week, start_hour, end_hour) values (loc3, day, 9, 17) on conflict do nothing;
    insert into availability (location_id, day_of_week, start_hour, end_hour) values (loc4, day, 9, 17) on conflict do nothing;
  end loop;
end;
$$;
