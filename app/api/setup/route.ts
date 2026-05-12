import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const sb = getServiceSupabase()

    // Create profiles table
    await sb.query(`
      create extension if not exists "uuid-ossp";
      create table if not exists profiles (
        id uuid primary key references auth.users(id) on delete cascade,
        email text not null,
        name text not null default '',
        phone text not null default '',
        role text not null default 'client' check (role in ('client', 'admin')),
        created_at timestamptz not null default now()
      );
    `)

    // Create locations table
    await sb.query(`
      create table if not exists locations (
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        address text not null
      );
    `)

    // Create availability table
    await sb.query(`
      create table if not exists availability (
        id uuid primary key default uuid_generate_v4(),
        location_id uuid not null references locations(id) on delete cascade,
        day_of_week int not null check (day_of_week between 0 and 6),
        start_hour int not null check (start_hour between 0 and 23),
        end_hour int not null check (end_hour between 0 and 23),
        unique (location_id, day_of_week)
      );
    `)

    // Create bookings table
    await sb.query(`
      create table if not exists bookings (
        id uuid primary key default uuid_generate_v4(),
        user_id uuid not null references profiles(id) on delete cascade,
        location_id uuid not null references locations(id),
        date date not null,
        start_time time not null,
        end_time time not null,
        status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
        created_at timestamptz not null default now(),
        unique (location_id, date, start_time)
      );
    `)

    // Insert locations
    const loc1 = await sb.query(`INSERT INTO locations (id, name, address) VALUES (uuid_generate_v4(), 'Ashton-under-Lyne', 'Greater Manchester') ON CONFLICT DO NOTHING RETURNING id`)
    const loc2 = await sb.query(`INSERT INTO locations (id, name, address) VALUES (uuid_generate_v4(), 'Manchester City Centre', 'Greater Manchester') ON CONFLICT DO NOTHING RETURNING id`)
    const loc3 = await sb.query(`INSERT INTO locations (id, name, address) VALUES (uuid_generate_v4(), 'Alderley Edge', 'Cheshire') ON CONFLICT DO NOTHING RETURNING id`)
    const loc4 = await sb.query(`INSERT INTO locations (id, name, address) VALUES (uuid_generate_v4(), 'County Kerry', 'Ireland') ON CONFLICT DO NOTHING RETURNING id`)

    // Insert default availability Mon-Fri 9-5 for all locations
    const locs = await sb.from('locations').select('id')
    for (const loc of locs.data ?? []) {
      for (let day = 1; day <= 5; day++) {
        await sb.query(`INSERT INTO availability (location_id, day_of_week, start_hour, end_hour) VALUES ('${loc.id}', ${day}, 9, 17) ON CONFLICT (location_id, day_of_week) DO NOTHING`)
      }
    }

    // Enable RLS
    await sb.query(`alter table profiles enable row level security`)
    await sb.query(`alter table locations enable row level security`)
    await sb.query(`alter table availability enable row level security`)
    await sb.query(`alter table bookings enable row level security`)

    // Create RLS policies
    await sb.query(`create policy "profiles_select_own" on profiles for select using (auth.uid() = id)`)
    await sb.query(`create policy "profiles_update_own" on profiles for update using (auth.uid() = id)`)
    await sb.query(`create policy "locations_read_all" on locations for select using (true)`)
    await sb.query(`create policy "availability_read_all" on availability for select using (true)`)
    await sb.query(`create policy "availability_admin_all" on availability for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))`)
    await sb.query(`create policy "bookings_select_own" on bookings for select using (auth.uid() = user_id)`)
    await sb.query(`create policy "bookings_insert_own" on bookings for insert with check (auth.uid() = user_id)`)
    await sb.query(`create policy "bookings_update_own_cancel" on bookings for update using (auth.uid() = user_id) with check (status = 'cancelled')`)
    await sb.query(`create policy "bookings_admin_all" on bookings for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))`)

    return NextResponse.json({ ok: true, message: 'Schema applied successfully' })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
