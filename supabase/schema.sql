-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('agent', 'admin', 'user')) default 'user',
  full_name text,
  agency_name text,
  phone_number text,
  is_verified boolean default false,
  subscription_tier text check (subscription_tier in ('free', 'premium')) default 'free',
  subscription_expiry timestamptz,
  avatar_url text,
  area_specialty text[],
  created_at timestamptz default now()
);

-- Create properties table
create table properties (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric not null,
  size_sqm numeric not null,
  district text not null,
  address text,
  title_type text check (title_type in ('C_of_O', 'R_of_O', 'Allocation', 'Other')),
  images text[],
  video_url text,
  status text check (status in ('active', 'sold', 'pending')) default 'active',
  is_featured boolean default false,
  created_at timestamptz default now(),
  last_bumped_at timestamptz default now(),
  slug text unique not null
);

-- Create districts table
create table districts (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  avg_price_per_sqm numeric,
  image_url text,
  created_at timestamptz default now()
);

-- Create blog_posts table
create table blog_posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  content text,
  author_id uuid references profiles(id) on delete set null,
  published boolean default false,
  created_at timestamptz default now()
);

-- RLS Policies
alter table profiles enable row level security;
alter table properties enable row level security;
alter table districts enable row level security;
alter table blog_posts enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Properties policies
create policy "Properties are viewable by everyone"
  on properties for select using (true);

create policy "Agents can insert their own properties"
  on properties for insert with check (auth.uid() = agent_id);

create policy "Agents can update own properties"
  on properties for update using (auth.uid() = agent_id);

create policy "Agents can delete own properties"
  on properties for delete using (auth.uid() = agent_id);

-- Storage Buckets (You need to create these in Supabase Dashboard)
-- insert into storage.buckets (id, name) values ('property-images', 'property-images');
-- insert into storage.buckets (id, name) values ('avatars', 'avatars');
-- insert into storage.buckets (id, name) values ('blog-assets', 'blog-assets');
