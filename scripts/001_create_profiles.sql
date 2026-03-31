-- Create profiles table for patient/doctor user data
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  user_type text check (user_type in ('patient', 'doctor')),
  specialization text,
  bio text,
  credentials text,
  rating numeric(3,2) default 5.0,
  total_consultations integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_select_public_doctors" on public.profiles for select using (user_type = 'doctor');
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Create consultations table
create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid references auth.users(id) on delete set null,
  status text check (status in ('pending', 'in_progress', 'completed', 'cancelled')) default 'pending',
  consultation_type text check (consultation_type in ('ai', 'doctor', 'video')) default 'ai',
  symptoms text,
  initial_assessment text,
  final_diagnosis text,
  ai_response text,
  severity_level text,
  total_cost numeric(10,2) default 0,
  payment_status text default 'pending',
  created_at timestamp with time zone default now(),
  started_at timestamp with time zone,
  ended_at timestamp with time zone
);

alter table public.consultations enable row level security;

create policy "consultations_select_own" on public.consultations for select using (
  auth.uid() = patient_id or auth.uid() = doctor_id
);
create policy "consultations_insert_patient" on public.consultations for insert with check (
  auth.uid() = patient_id
);
create policy "consultations_update_patient_doctor" on public.consultations for update using (
  auth.uid() = patient_id or auth.uid() = doctor_id
);

-- Create messages table for consultation chat
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_type text check (sender_type in ('patient', 'doctor', 'ai')) default 'patient',
  message_text text not null,
  message_type text check (message_type in ('text', 'audio', 'video')) default 'text',
  file_url text,
  created_at timestamp with time zone default now(),
  read_at timestamp with time zone
);

alter table public.messages enable row level security;

create policy "messages_select_participants" on public.messages for select using (
  exists (
    select 1 from public.consultations c
    where c.id = messages.consultation_id
    and (c.patient_id = auth.uid() or c.doctor_id = auth.uid())
  )
);
create policy "messages_insert_participant" on public.messages for insert with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.consultations c
    where c.id = messages.consultation_id
    and (c.patient_id = auth.uid() or c.doctor_id = auth.uid())
  )
);

-- Create ai_consultation_history table
create table if not exists public.ai_consultation_history (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  symptoms text not null,
  ai_response text not null,
  severity_level text,
  created_at timestamp with time zone default now()
);

alter table public.ai_consultation_history enable row level security;

create policy "ai_history_select_own" on public.ai_consultation_history for select using (
  auth.uid() = patient_id
);
create policy "ai_history_insert_own" on public.ai_consultation_history for insert with check (
  auth.uid() = patient_id
);

-- Create medical_records table
create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid references auth.users(id) on delete set null,
  file_url text not null,
  file_name text not null,
  file_type text check (file_type in ('prescription', 'report', 'scan', 'other')) default 'other',
  description text,
  is_shared_with_doctor boolean default false,
  upload_date timestamp with time zone default now()
);

alter table public.medical_records enable row level security;

create policy "medical_records_select_patient" on public.medical_records for select using (
  auth.uid() = patient_id or 
  (is_shared_with_doctor and auth.uid() = doctor_id)
);
create policy "medical_records_insert_patient" on public.medical_records for insert with check (
  auth.uid() = patient_id
);
create policy "medical_records_update_patient" on public.medical_records for update using (
  auth.uid() = patient_id
);
create policy "medical_records_delete_patient" on public.medical_records for delete using (
  auth.uid() = patient_id
);

-- Create prescriptions table
create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  doctor_id uuid not null references auth.users(id) on delete cascade,
  medications jsonb not null default '[]'::jsonb,
  instructions text,
  created_at timestamp with time zone default now()
);

alter table public.prescriptions enable row level security;

create policy "prescriptions_select" on public.prescriptions for select using (
  exists (
    select 1 from public.consultations c
    where c.id = prescriptions.consultation_id
    and (c.patient_id = auth.uid() or c.doctor_id = auth.uid())
  )
);

-- Create payments table (mock)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(10,2) not null,
  status text check (status in ('pending', 'completed', 'failed')) default 'pending',
  payment_method text default 'mock_razorpay',
  mock_order_id text,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

alter table public.payments enable row level security;

create policy "payments_select_own" on public.payments for select using (
  auth.uid() = patient_id
);
create policy "payments_insert_own" on public.payments for insert with check (
  auth.uid() = patient_id
);
create policy "payments_update_own" on public.payments for update using (
  auth.uid() = patient_id
);

-- Create appointments table
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid not null references auth.users(id) on delete cascade,
  appointment_time timestamp with time zone not null,
  duration_minutes integer default 30,
  status text check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')) default 'scheduled',
  video_room_id text,
  created_at timestamp with time zone default now()
);

alter table public.appointments enable row level security;

create policy "appointments_select_own" on public.appointments for select using (
  auth.uid() = patient_id or auth.uid() = doctor_id
);
create policy "appointments_insert_patient" on public.appointments for insert with check (
  auth.uid() = patient_id
);
create policy "appointments_update_participant" on public.appointments for update using (
  auth.uid() = patient_id or auth.uid() = doctor_id
);

-- Create doctor_availability table
create table if not exists public.doctor_availability (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references auth.users(id) on delete cascade,
  day_of_week integer check (day_of_week >= 0 and day_of_week <= 6),
  start_time time without time zone,
  end_time time without time zone,
  is_available boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.doctor_availability enable row level security;

create policy "doctor_availability_select" on public.doctor_availability for select using (true);
create policy "doctor_availability_insert_own" on public.doctor_availability for insert with check (
  auth.uid() = doctor_id
);
create policy "doctor_availability_update_own" on public.doctor_availability for update using (
  auth.uid() = doctor_id
);
create policy "doctor_availability_delete_own" on public.doctor_availability for delete using (
  auth.uid() = doctor_id
);

-- Create ratings table
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  patient_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid not null references auth.users(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  review_text text,
  created_at timestamp with time zone default now()
);

alter table public.ratings enable row level security;

create policy "ratings_select" on public.ratings for select using (true);
create policy "ratings_insert_patient" on public.ratings for insert with check (
  auth.uid() = patient_id
);

-- Create user_sessions table for session tracking
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_token text,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);

alter table public.user_sessions enable row level security;

create policy "user_sessions_select_own" on public.user_sessions for select using (
  auth.uid() = user_id
);
