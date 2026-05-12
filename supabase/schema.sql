-- ============================================================
-- ARK Wellness Booking System — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ──────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text not null default '',
  phone       text not null default '',
  role        text not null default 'client' check (role in ('client', 'admin')),
  created_at  timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_own"
  on profiles for select using (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update using (auth.uid() = id);

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

create policy "locations_read_all"
  on locations for select using (true);

insert into locations (id, name, address) values
  (uuid_generate_v4(), 'Ashton-under-Lyne', 'Greater Manchester'),
  (uuid_generate_v4(), 'Manchester City Centre', 'Greater Manchester'),
  (uuid_generate_v4(), 'Alderley Edge', 'Cheshire'),
  (uuid_generate_v4(), 'County Kerry', 'Ireland')
on conflict do nothing;

-- ──────────────────────────────────────────
-- AVAILABILITY
-- ──────────────────────────────────────────
create table if not exists availability (
  id            uuid primary key default uuid_generate_v4(),
  location_id   uuid not null references locations(id) on delete cascade,
  day_of_week   int not null check (day_of_week between 0 and 6),
  start_hour    int not null check (start_hour between 0 and 23),
  end_hour      int not null check (end_hour between 0 and 23),
  unique (location_id, day_of_week)
);

alter table availability enable row level security;

create policy "availability_read_all"
  on availability for select using (true);

create policy "availability_admin_all"
  on availability for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Default: Mon-Fri 9-5 for all locations
do $$
declare
  loc record;
begin
  for loc in select id from locations loop
    for day in 1..5 loop -- Mon-Fri
      insert into availability (location_id, day_of_week, start_hour, end_hour)
      values (loc.id, day, 9, 17)
      on conflict (location_id, day_of_week) do nothing;
    end loop;
  end loop;
end;
$$;

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

-- Clients see only their own bookings
create policy "bookings_select_own"
  on bookings for select using (auth.uid() = user_id);

-- Clients can create bookings
create policy "bookings_insert_own"
  on bookings for insert with check (auth.uid() = user_id);

-- Clients can cancel their own bookings
create policy "bookings_update_own_cancel"
  on bookings for update using (auth.uid() = user_id)
  with check (status = 'cancelled');

-- Admin sees all
create policy "bookings_admin_all"
  on bookings for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ──────────────────────────────────────────
-- Seed admin user (change email before running!)
-- ──────────────────────────────────────────
-- Run this AFTER signing up the admin user via the app,
-- then update their role:
-- update profiles set role = 'admin' where email = 'hello@ark-wellness.life';
