-- Courskills production schema: Career Tracks → Programmes → Courses → Modules → Lessons
create extension if not exists "pgcrypto";

do $$ begin create type public.user_role as enum ('student','instructor','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.enrollment_status as enum ('active','completed','paused'); exception when duplicate_object then null; end $$;
do $$ begin create type public.content_type as enum ('lesson','resource','video','quiz','assignment'); exception when duplicate_object then null; end $$;
do $$ begin create type public.programme_relation_type as enum ('complementary','prerequisite','recommended_next','related'); exception when duplicate_object then null; end $$;

create table public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'student',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tracks(
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text unique not null,
  description text not null,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programmes(
  id uuid primary key default gen_random_uuid(),
  track_id uuid references public.tracks(id) on delete set null,
  slug text unique not null,
  title text not null,
  description text not null,
  duration_weeks int,
  credential_title text,
  credential_description text,
  portfolio_required boolean not null default false,
  source_provider text not null default 'Courskills',
  source_programme_name text,
  source_url text,
  published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses(
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  sort_order int not null default 0,
  required boolean not null default true,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(programme_id, slug)
);

create table public.modules(
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  sort_order int not null default 0,
  published boolean not null default false
);

create table public.lessons(
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  slug text not null,
  content jsonb not null default '{}'::jsonb,
  estimated_minutes int,
  sort_order int not null default 0,
  published boolean not null default false,
  unique(module_id, slug)
);

create table public.programme_relations(
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes(id) on delete cascade,
  related_programme_id uuid not null references public.programmes(id) on delete cascade,
  relation_type public.programme_relation_type not null,
  sort_order int not null default 0,
  note text,
  unique(programme_id, related_programme_id, relation_type),
  check(programme_id <> related_programme_id)
);

create table public.programme_prerequisites(
  programme_id uuid not null references public.programmes(id) on delete cascade,
  prerequisite_programme_id uuid not null references public.programmes(id) on delete cascade,
  required boolean not null default true,
  note text,
  primary key(programme_id, prerequisite_programme_id),
  check(programme_id <> prerequisite_programme_id)
);

create type public.payment_purpose as enum ('course_enrollment','certificate');
create type public.payment_method as enum ('stripe','mpesa');

create table public.pricing_rules(
  purpose public.payment_purpose not null,
  payment_method public.payment_method not null,
  amount_minor_units int not null check(amount_minor_units > 0),
  currency text not null check(currency in ('USD','KES')),
  active boolean not null default true,
  primary key(purpose, payment_method)
);

insert into public.pricing_rules(purpose, payment_method, amount_minor_units, currency) values
  ('course_enrollment', 'stripe', 1000, 'USD'),
  ('certificate', 'stripe', 1000, 'USD'),
  ('course_enrollment', 'mpesa', 1200, 'KES'),
  ('certificate', 'mpesa', 1200, 'KES')
on conflict (purpose, payment_method) do update set
  amount_minor_units=excluded.amount_minor_units,
  currency=excluded.currency,
  active=true;

create table public.payments(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  purpose public.payment_purpose not null,
  payment_method public.payment_method not null,
  course_id uuid references public.courses(id) on delete set null,
  programme_id uuid references public.programmes(id) on delete set null,
  certificate_id uuid,
  amount_minor_units int not null check(amount_minor_units > 0),
  currency text not null check(currency in ('USD','KES')),
  status text not null default 'pending' check(status in ('pending','paid','failed','refunded','cancelled')),
  provider text not null,
  provider_reference text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create unique index if not exists uq_paid_course_enrollment_payment
  on public.payments(user_id, course_id)
  where purpose='course_enrollment' and status='paid' and course_id is not null;

create table public.course_enrollments(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  payment_id uuid not null references public.payments(id),
  enrolled_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create or replace function public.validate_payment_amount() returns trigger
language plpgsql security definer set search_path=public as $$
declare expected_amount int; expected_currency text;
begin
  select amount_minor_units, currency into expected_amount, expected_currency
  from public.pricing_rules
  where purpose=new.purpose and payment_method=new.payment_method and active=true;
  if expected_amount is null or new.amount_minor_units <> expected_amount or new.currency <> expected_currency then
    raise exception 'Invalid Courskills payment amount or currency';
  end if;
  if new.payment_method='mpesa' and new.provider <> 'mpesa' then
    raise exception 'M-Pesa payments must use the M-Pesa provider';
  end if;
  if new.payment_method='stripe' and new.provider <> 'stripe' then
    raise exception 'Stripe payments must use the Stripe provider';
  end if;
  return new;
end;
$$;
drop trigger if exists trg_validate_payment_amount on public.payments;
create trigger trg_validate_payment_amount before insert or update on public.payments
for each row execute procedure public.validate_payment_amount();

create index if not exists idx_course_enrollments_user on public.course_enrollments(user_id);
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);

create table public.enrollments(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  programme_id uuid not null references public.programmes(id) on delete cascade,
  status public.enrollment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id,programme_id)
);

create table public.course_progress(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  percent_complete int not null default 0 check(percent_complete between 0 and 100),
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id,course_id)
);

create table public.lesson_progress(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id,lesson_id)
);

create table public.portfolio_projects(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  programme_id uuid references public.programmes(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  description text,
  evidence_url text,
  repository_url text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assessments(
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text not null,
  pass_percent int not null default 80,
  published boolean not null default false,
  check(course_id is not null or lesson_id is not null)
);

create table public.assessment_questions(
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  prompt text not null,
  options jsonb not null,
  correct_option int not null,
  points int not null default 1
);

create table public.assessment_attempts(
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null,
  score_percent int not null,
  passed boolean not null,
  submitted_at timestamptz not null default now()
);

create table public.assignments(
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text not null,
  instructions text not null,
  published boolean not null default false,
  check(course_id is not null or lesson_id is not null)
);

create table public.assignment_submissions(
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  response jsonb not null,
  grade numeric,
  feedback text,
  status text not null default 'submitted',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.certificates(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  programme_id uuid not null references public.programmes(id) on delete cascade,
  certificate_number text unique not null,
  credential_title text not null,
  issued_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  revoked_at timestamptz
);
alter table public.payments add constraint payments_certificate_id_fkey foreign key (certificate_id) references public.certificates(id) on delete set null;

create table public.forex_journal_entries(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pair text not null,
  setup text not null,
  risk_amount numeric not null,
  outcome text,
  reasoning text not null,
  created_at timestamptz not null default now()
);

create table public.sim_accounts(
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  starting_balance numeric not null default 10000,
  balance numeric not null default 10000,
  equity numeric not null default 10000,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sim_orders(
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.sim_accounts(id) on delete cascade,
  symbol text not null,
  side text not null,
  quantity numeric not null,
  entry_price numeric not null,
  stop_price numeric,
  take_profit numeric,
  risk_amount numeric not null,
  status text not null default 'open',
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  exit_price numeric,
  pnl numeric
);

-- RLS
alter table public.profiles enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.payments enable row level security;
alter table public.course_enrollments enable row level security;

alter table public.tracks enable row level security;
alter table public.programmes enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.programme_relations enable row level security;
alter table public.programme_prerequisites enable row level security;
alter table public.enrollments enable row level security;
alter table public.course_progress enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.certificates enable row level security;
alter table public.forex_journal_entries enable row level security;
alter table public.sim_accounts enable row level security;
alter table public.sim_orders enable row level security;

create policy "active pricing readable" on public.pricing_rules for select using (active=true);
create policy "own payments" on public.payments for select using (auth.uid()=user_id);
create policy "own course enrollments" on public.course_enrollments for select using (auth.uid()=user_id);

create policy "profiles own" on public.profiles for select using (auth.uid()=id);
create policy "published tracks readable" on public.tracks for select using (published=true or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','instructor')));
create policy "published programmes readable" on public.programmes for select using (published=true or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','instructor')));
create policy "published courses readable" on public.courses for select using (published=true or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','instructor')));
create policy "published modules readable" on public.modules for select using (published=true or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','instructor')));
create policy "published lessons readable" on public.lessons for select using (published=true or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','instructor')));
create policy "published programme relations readable" on public.programme_relations for select using (exists(select 1 from public.programmes p where p.id=programme_id and p.published=true));
create policy "published prerequisites readable" on public.programme_prerequisites for select using (exists(select 1 from public.programmes p where p.id=programme_id and p.published=true));
create policy "own enrollments" on public.enrollments for select using (auth.uid()=user_id);
create policy "own course progress" on public.course_progress for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "own progress" on public.lesson_progress for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "own portfolio" on public.portfolio_projects for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "published assessments readable" on public.assessments for select using (published=true or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','instructor')));
create policy "instructors manage assessments" on public.assessments for all using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','instructor'))) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','instructor')));
create policy "instructors manage questions" on public.assessment_questions for all using (exists(select 1 from public.profiles p join public.assessments a on a.id=assessment_id where p.id=auth.uid() and p.role in ('admin','instructor'))) with check (exists(select 1 from public.profiles p join public.assessments a on a.id=assessment_id where p.id=auth.uid() and p.role in ('admin','instructor')));
create policy "own attempts" on public.assessment_attempts for select using (auth.uid()=user_id);
create policy "published assignments readable" on public.assignments for select using (published=true or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','instructor')));
create policy "instructors manage assignments" on public.assignments for all using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','instructor'))) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','instructor')));
create policy "own submissions" on public.assignment_submissions for select using (auth.uid()=user_id);
create policy "own certificates" on public.certificates for select using (auth.uid()=user_id);
create policy "own journal" on public.forex_journal_entries for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "own sim account" on public.sim_accounts for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "own sim orders" on public.sim_orders for all using (exists(select 1 from public.sim_accounts a where a.id=account_id and a.user_id=auth.uid())) with check (exists(select 1 from public.sim_accounts a where a.id=account_id and a.user_id=auth.uid()));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''));
  insert into public.sim_accounts(user_id) values(new.id);
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Useful indexes
create index if not exists idx_programmes_track on public.programmes(track_id);
create index if not exists idx_courses_programme on public.courses(programme_id);
create index if not exists idx_modules_course on public.modules(course_id);
create index if not exists idx_lessons_module on public.lessons(module_id);
create index if not exists idx_enrollments_user on public.enrollments(user_id);
create index if not exists idx_course_enrollments_user on public.course_enrollments(user_id);
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_certificates_user on public.certificates(user_id);
