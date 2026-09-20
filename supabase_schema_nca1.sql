-- ====================================================================
-- NEUROCONECTA — NC-A1: SCHEMA CANÔNICO, PROFILES, AUDITORIA E RLS
-- ====================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA CANÔNICA DE PERFIS (Vinculada estritamente a auth.users.id)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_name TEXT NOT NULL DEFAULT 'Usuário',
  pronouns TEXT DEFAULT 'não informado',
  birth_date TEXT,
  user_role TEXT NOT NULL DEFAULT 'pcd',
  professional_role_type TEXT,
  professional_register_number TEXT,
  diagnosis_status TEXT NOT NULL DEFAULT 'nao_informado',
  support_level TEXT NOT NULL DEFAULT 'nao_especificado',
  current_focus TEXT NOT NULL DEFAULT 'geral',
  emergency_contacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  low_stimulation_mode BOOLEAN NOT NULL DEFAULT false,
  caregiver_mode BOOLEAN NOT NULL DEFAULT false,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  onboarding_completed BOOLEAN NOT NULL DEFAULT true,
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  hidden_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ciptea_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para criar perfil automaticamente no SignUp (idempotente)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    display_name,
    preferred_name,
    user_role,
    is_super_admin
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'preferred_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'user_role', 'pcd'),
    COALESCE((NEW.raw_user_meta_data->>'is_super_admin')::boolean, (NEW.raw_user_meta_data->>'user_role' = 'superadmin'), false)
  )
  ON CONFLICT (id) DO UPDATE SET
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. TABELA DE AUDITORIA IMUTÁVEL
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_data JSONB,
  after_data JSONB,
  source TEXT NOT NULL DEFAULT 'web_client',
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON public.audit_events(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON public.audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON public.audit_events(entity_type, entity_id);

-- 4. TABELAS DE DADOS PERSISTENTES DO USUÁRIO (com owner_user_id obrigatório)

-- 4.1 Histórico de Testes
CREATE TABLE IF NOT EXISTS public.test_history (
  id TEXT PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  test_title TEXT NOT NULL,
  date TEXT NOT NULL,
  score NUMERIC NOT NULL,
  max_score NUMERIC NOT NULL,
  interpretation_level TEXT NOT NULL,
  percentage NUMERIC NOT NULL,
  source TEXT DEFAULT 'direct_entry',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_test_history_owner ON public.test_history(owner_user_id);

-- 4.2 Tarefas de Rotina
CREATE TABLE IF NOT EXISTS public.routine_tasks (
  id TEXT PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  target_time TEXT,
  duration_minutes INTEGER,
  icon TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  urgency TEXT,
  energy_level TEXT,
  source TEXT DEFAULT 'direct_entry',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_routine_tasks_owner ON public.routine_tasks(owner_user_id);

-- 4.3 Registros de Humor / Diário
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id TEXT PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  mood_score INTEGER NOT NULL,
  energy_score INTEGER NOT NULL,
  sensory_overload BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  source TEXT DEFAULT 'direct_entry',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_mood_logs_owner ON public.mood_logs(owner_user_id);

-- 4.4 Notas de Cuidadores
CREATE TABLE IF NOT EXISTS public.caregiver_logs (
  id TEXT PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  note TEXT NOT NULL,
  tag TEXT NOT NULL,
  source TEXT DEFAULT 'direct_entry',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_caregiver_logs_owner ON public.caregiver_logs(owner_user_id);

-- 4.5 Agenda e Medicamentos
CREATE TABLE IF NOT EXISTS public.agenda_events (
  id TEXT PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  source TEXT DEFAULT 'direct_entry',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_agenda_events_owner ON public.agenda_events(owner_user_id);

-- 4.6 Avaliações do Momento
CREATE TABLE IF NOT EXISTS public.moment_assessments (
  id TEXT PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  energy_level INTEGER NOT NULL,
  sensory_load INTEGER NOT NULL,
  communication_preference TEXT NOT NULL,
  suggested_supports JSONB DEFAULT '[]'::jsonb,
  source TEXT DEFAULT 'direct_entry',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_moment_assessments_owner ON public.moment_assessments(owner_user_id);

-- 5. ROW LEVEL SECURITY (RLS) — NEGAR POR PADRÃO

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_assessments ENABLE ROW LEVEL SECURITY;

-- Limpar policies anteriores para evitar conflitos
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "audit_events_insert_own" ON public.audit_events;
DROP POLICY IF EXISTS "audit_events_select_own" ON public.audit_events;

-- Policies: Profiles (somente o próprio usuário ou trigger pode acessar/editar)
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policies: Audit Events (Imutável: somente INSERT com ator real, SELECT do próprio ator, sem UPDATE ou DELETE)
CREATE POLICY "audit_events_insert_own" ON public.audit_events
  FOR INSERT WITH CHECK (auth.uid() = actor_user_id);

CREATE POLICY "audit_events_select_own" ON public.audit_events
  FOR SELECT USING (auth.uid() = actor_user_id);

-- Policies: Test History
DROP POLICY IF EXISTS "test_history_owner" ON public.test_history;
CREATE POLICY "test_history_owner" ON public.test_history
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- Policies: Routine Tasks
DROP POLICY IF EXISTS "routine_tasks_owner" ON public.routine_tasks;
CREATE POLICY "routine_tasks_owner" ON public.routine_tasks
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- Policies: Mood Logs
DROP POLICY IF EXISTS "mood_logs_owner" ON public.mood_logs;
CREATE POLICY "mood_logs_owner" ON public.mood_logs
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- Policies: Caregiver Logs
DROP POLICY IF EXISTS "caregiver_logs_owner" ON public.caregiver_logs;
CREATE POLICY "caregiver_logs_owner" ON public.caregiver_logs
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- Policies: Agenda Events
DROP POLICY IF EXISTS "agenda_events_owner" ON public.agenda_events;
CREATE POLICY "agenda_events_owner" ON public.agenda_events
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- Policies: Moment Assessments
DROP POLICY IF EXISTS "moment_assessments_owner" ON public.moment_assessments;
CREATE POLICY "moment_assessments_owner" ON public.moment_assessments
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);
