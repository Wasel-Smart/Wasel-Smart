-- Create Ratings Table
create table if not exists public.ratings (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) not null,
  rater_id uuid references auth.users(id) not null,
  rated_user_id uuid references auth.users(id) not null,
  role user_role not null, -- 'driver' (being rated as driver) or 'passenger' (being rated as passenger)
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.ratings enable row level security;

-- Policies
create policy "Users can read ratings regarding them"
  on public.ratings for select
  using (auth.uid() = rated_user_id or auth.uid() = rater_id);

create policy "Users can insert ratings"
  on public.ratings for insert
  with check (auth.uid() = rater_id);

-- Function to update profile rating
create or replace function public.update_profile_rating()
returns trigger as $$
declare
  _avg_rating decimal;
  _count integer;
begin
  -- Calculate new average and count
  select 
    coalesce(avg(rating), 0),
    count(*)
  into 
    _avg_rating,
    _count
  from public.ratings
  where rated_user_id = new.rated_user_id
  and role = new.role;

  -- Update profile based on role
  if new.role = 'driver' then
    update public.profiles
    set 
      rating_as_driver = _avg_rating,
      total_ratings_received = total_ratings_received + 1
    where id = new.rated_user_id;
  else
    update public.profiles
    set 
      rating_as_passenger = _avg_rating,
      total_ratings_received = total_ratings_received + 1
    where id = new.rated_user_id;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger
create trigger on_rating_insert
  after insert on public.ratings
  for each row execute procedure public.update_profile_rating();

-- Add payment_intent_id to bookings if missing
alter table public.bookings 
add column if not exists payment_intent_id text;

-- Add cancelled_at and cancellation_reason to trips/bookings if missing
alter table public.trips
add column if not exists cancelled_at timestamp with time zone,
add column if not exists cancellation_reason text;

alter table public.bookings
add column if not exists cancelled_at timestamp with time zone,
add column if not exists cancellation_reason text;

-- Helper RPC to safely increment seats
create or replace function public.increment_seats(row_id uuid, count int)
returns void as $$
begin
  update public.trips 
  set available_seats = available_seats + count
  where id = row_id;
end;
$$ language plpgsql security definer;
