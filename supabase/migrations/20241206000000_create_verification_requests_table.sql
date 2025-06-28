-- Migration: Create verification_requests table for worker verification
-- Date: 2024-12-06

create table if not exists verification_requests (
  id uuid primary key default gen_random_uuid(),
  worker_id bigint references workers(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  document_type text not null check (document_type in ('aadhar', 'pan')),
  
  -- Aadhar specific fields
  aadhar_name text,
  aadhar_dob date,
  aadhar_gender text check (aadhar_gender in ('male', 'female', 'other')),
  aadhar_number text,
  aadhar_vid text,
  aadhar_image_url text,
  
  -- PAN specific fields
  pan_name text,
  pan_dob date,
  pan_parent_name text,
  pan_number text,
  pan_image_url text,
  
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index if not exists idx_verification_requests_worker_id on verification_requests(worker_id);
create index if not exists idx_verification_requests_user_id on verification_requests(user_id);
create index if not exists idx_verification_requests_status on verification_requests(status);
create index if not exists idx_verification_requests_created_at on verification_requests(created_at);

-- Enable RLS
alter table verification_requests enable row level security;

-- RLS Policies
create policy "Users can view their own verification requests"
on verification_requests for select
using (auth.uid() = user_id);

create policy "Users can insert their own verification requests"
on verification_requests for insert
with check (auth.uid() = user_id);

create policy "Admins can view all verification requests"
on verification_requests for select
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  )
);

create policy "Admins can update verification requests"
on verification_requests for update
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  )
);

-- Add verification_status column to workers table if it doesn't exist
alter table workers add column if not exists verification_status text default 'pending' check (verification_status in ('pending', 'approved', 'rejected'));

-- Create a function to update worker verification status when request is approved/rejected
create or replace function update_worker_verification_status()
returns trigger as $$
begin
  if new.status = 'approved' then
    update workers 
    set verification_status = 'approved'
    where id = new.worker_id;
  elsif new.status = 'rejected' then
    update workers 
    set verification_status = 'rejected'
    where id = new.worker_id;
  end if;
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update worker verification status
drop trigger if exists on_verification_request_status_change on verification_requests;
create trigger on_verification_request_status_change
  after update of status on verification_requests
  for each row
  execute function update_worker_verification_status(); 