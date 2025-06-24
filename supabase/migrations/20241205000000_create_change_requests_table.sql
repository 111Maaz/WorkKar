-- Migration: Create change_requests table for user profile change requests
create table if not exists change_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  field text not null,
  current_value text,
  requested_value text not null,
  reason text,
  status text not null default 'pending',
  admin_response text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_change_requests_user_id on change_requests(user_id);
create index if not exists idx_change_requests_status on change_requests(status); 