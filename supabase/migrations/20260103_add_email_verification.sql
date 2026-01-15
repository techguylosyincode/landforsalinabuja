-- Add email verification fields to profiles table
alter table profiles add column if not exists email_verified boolean default false;
alter table profiles add column if not exists verification_token text;
alter table profiles add column if not exists verification_token_created_at timestamptz;
