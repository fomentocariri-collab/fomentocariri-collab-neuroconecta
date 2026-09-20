-- ====================================================================
-- NEUROCONECTA — NC-HOTFIX-04B.2: MIGRATION CANÔNICA + IDENTIDADE + RLS
-- ====================================================================
-- Project Ref: gbjanxdyllxpsydsubcx
-- Diretrizes:
--   - Execução transacional (BEGIN / COMMIT / ROLLBACK em caso de erro)
--   - Idempotente (CREATE ... IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
--   - Não destrutivo (SEM DROP TABLE, SEM TRUNCATE, SEM DELETE)
--   - Preserva usuários existentes e backfill seguro de public.profiles
--   - Separação estrita: Profissional (auth.users) vs Pessoa Assistida (assisted_people)
--   - RLS estrito: Nenhum acesso anônimo; isolamento por autor/vínculo profissional
-- ====================================================================

BEGIN;

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. PUBLIC.PROFILES (Vinculada estritamente a auth.users(id))
-- ====================================================================
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

-- Trigger de updated_at para profiles
CREATE OR REPLACE FUNCTION public.handle_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_profiles_updated_at();

-- Trigger seguro para novos usuários registrados em auth.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
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
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ====================================================================
-- 3. BACKFILL DE PROFILES PARA USUÁRIOS PRÉ-EXISTENTES EM auth.users
-- ====================================================================
INSERT INTO public.profiles (
  id,
  display_name,
  preferred_name,
  user_role,
  is_super_admin,
  created_at,
  updated_at
)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  COALESCE(u.raw_user_meta_data->>'preferred_name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'user_role', 'pcd'),
  COALESCE((u.raw_user_meta_data->>'is_super_admin')::boolean, (u.raw_user_meta_data->>'user_role' = 'superadmin'), false),
  COALESCE(u.created_at, timezone('utc'::text, now())),
  timezone('utc'::text, now())
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- RLS de Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles: Leitura pelo proprio usuario ou profissionais autorizados" ON public.profiles;
CREATE POLICY "Profiles: Leitura pelo proprio usuario ou profissionais autorizados"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
);

DROP POLICY IF EXISTS "Profiles: Atualizacao pelo proprio usuario" ON public.profiles;
CREATE POLICY "Profiles: Atualizacao pelo proprio usuario"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles: Insercao pelo proprio usuario" ON public.profiles;
CREATE POLICY "Profiles: Insercao pelo proprio usuario"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ====================================================================
-- 4. ENTIDADE CANÔNICA DE PESSOAS ASSISTIDAS (assisted_people)
-- (Pacientes / Aprendentes / Alunos sem necessidade de login próprio)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.assisted_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  birth_date DATE,
  institution_name TEXT,
  grade_level TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_assisted_people_creator ON public.assisted_people(created_by);
CREATE INDEX IF NOT EXISTS idx_assisted_people_status ON public.assisted_people(status);

-- ====================================================================
-- 5. VÍNCULOS PROFISSIONAL ↔ PESSOA ASSISTIDA (professional_assisted_links)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.professional_assisted_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assisted_person_id UUID NOT NULL REFERENCES public.assisted_people(id) ON DELETE CASCADE,
  context_type TEXT DEFAULT 'clinico',
  permission_scope TEXT NOT NULL DEFAULT 'full' CHECK (permission_scope IN ('full', 'pedagogico', 'psicologico', 'musicoterapia', 'visualizacao')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'REVOKED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_prof_assisted_active UNIQUE (professional_user_id, assisted_person_id)
);

CREATE INDEX IF NOT EXISTS idx_prof_links_prof ON public.professional_assisted_links(professional_user_id);
CREATE INDEX IF NOT EXISTS idx_prof_links_assisted ON public.professional_assisted_links(assisted_person_id);

-- RLS de Assisted People
ALTER TABLE public.assisted_people ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "AssistedPeople: Leitura por criador ou profissional vinculado" ON public.assisted_people;
CREATE POLICY "AssistedPeople: Leitura por criador ou profissional vinculado"
ON public.assisted_people
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.professional_assisted_links pal
    WHERE pal.assisted_person_id = public.assisted_people.id
      AND pal.professional_user_id = auth.uid()
      AND pal.status = 'ACTIVE'
  )
);

DROP POLICY IF EXISTS "AssistedPeople: Criacao por profissional autenticado" ON public.assisted_people;
CREATE POLICY "AssistedPeople: Criacao por profissional autenticado"
ON public.assisted_people
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "AssistedPeople: Atualizacao por criador ou profissional vinculado" ON public.assisted_people;
CREATE POLICY "AssistedPeople: Atualizacao por criador ou profissional vinculado"
ON public.assisted_people
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.professional_assisted_links pal
    WHERE pal.assisted_person_id = public.assisted_people.id
      AND pal.professional_user_id = auth.uid()
      AND pal.status = 'ACTIVE'
  )
)
WITH CHECK (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.professional_assisted_links pal
    WHERE pal.assisted_person_id = public.assisted_people.id
      AND pal.professional_user_id = auth.uid()
      AND pal.status = 'ACTIVE'
  )
);

-- RLS de Professional Assisted Links
ALTER TABLE public.professional_assisted_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ProfLinks: Leitura do proprio escopo" ON public.professional_assisted_links;
CREATE POLICY "ProfLinks: Leitura do proprio escopo"
ON public.professional_assisted_links
FOR SELECT
TO authenticated
USING (
  professional_user_id = auth.uid()
  OR created_by = auth.uid()
);

DROP POLICY IF EXISTS "ProfLinks: Insercao pelo proprio profissional" ON public.professional_assisted_links;
CREATE POLICY "ProfLinks: Insercao pelo proprio profissional"
ON public.professional_assisted_links
FOR INSERT
TO authenticated
WITH CHECK (
  professional_user_id = auth.uid()
  OR created_by = auth.uid()
);

DROP POLICY IF EXISTS "ProfLinks: Atualizacao pelo proprio profissional" ON public.professional_assisted_links;
CREATE POLICY "ProfLinks: Atualizacao pelo proprio profissional"
ON public.professional_assisted_links
FOR UPDATE
TO authenticated
USING (
  professional_user_id = auth.uid()
  OR created_by = auth.uid()
)
WITH CHECK (
  professional_user_id = auth.uid()
  OR created_by = auth.uid()
);

-- ====================================================================
-- 6. ADEQUAÇÃO DAS 4 TABELAS EXISTENTES (Adicionar owner_user_id + RLS)
-- (routine_tasks, test_history, mood_logs, caregiver_logs)
-- ====================================================================

-- 6.1 routine_tasks
ALTER TABLE public.routine_tasks
ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.routine_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "RoutineTasks: Isolamento estrito por proprietario" ON public.routine_tasks;
CREATE POLICY "RoutineTasks: Isolamento estrito por proprietario"
ON public.routine_tasks
FOR ALL
TO authenticated
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

-- 6.2 test_history
ALTER TABLE public.test_history
ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.test_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "TestHistory: Isolamento estrito por proprietario" ON public.test_history;
CREATE POLICY "TestHistory: Isolamento estrito por proprietario"
ON public.test_history
FOR ALL
TO authenticated
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

-- 6.3 mood_logs
ALTER TABLE public.mood_logs
ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "MoodLogs: Isolamento estrito por proprietario" ON public.mood_logs;
CREATE POLICY "MoodLogs: Isolamento estrito por proprietario"
ON public.mood_logs
FOR ALL
TO authenticated
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

-- 6.4 caregiver_logs
ALTER TABLE public.caregiver_logs
ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.caregiver_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CaregiverLogs: Isolamento estrito por proprietario" ON public.caregiver_logs;
CREATE POLICY "CaregiverLogs: Isolamento estrito por proprietario"
ON public.caregiver_logs
FOR ALL
TO authenticated
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

-- ====================================================================
-- 7. AGENDA E LEMBRETES (public.agenda_events)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.agenda_events (
  id TEXT PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  professional_or_place TEXT,
  notes TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  source TEXT DEFAULT 'direct_entry',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_agenda_events_owner ON public.agenda_events(owner_user_id);

ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "AgendaEvents: Isolamento estrito por proprietario" ON public.agenda_events;
CREATE POLICY "AgendaEvents: Isolamento estrito por proprietario"
ON public.agenda_events
FOR ALL
TO authenticated
USING (auth.uid() = owner_user_id)
WITH CHECK (auth.uid() = owner_user_id);

-- ====================================================================
-- 8. PLANEJADOR DE ATIVIDADES (public.planned_activities)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.planned_activities (
  id TEXT PRIMARY KEY,
  professional_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_name TEXT,
  assisted_person_id UUID REFERENCES public.assisted_people(id) ON DELETE SET NULL,
  assisted_user_name TEXT,
  specialty TEXT,
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  disciplines JSONB DEFAULT '[]'::jsonb,
  learning_processes JSONB DEFAULT '[]'::jsonb,
  education_stage TEXT,
  grade_level TEXT,
  duration TEXT,
  format TEXT,
  materials TEXT,
  instructions TEXT,
  step_by_step JSONB DEFAULT '[]'::jsonb,
  visual_support JSONB DEFAULT '[]'::jsonb,
  multiple_pathways JSONB DEFAULT '[]'::jsonb,
  challenge_level TEXT,
  adaptations JSONB DEFAULT '[]'::jsonb,
  environmental_adaptations JSONB DEFAULT '[]'::jsonb,
  student_interests_bridging TEXT,
  professional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'READY' CHECK (status IN ('READY', 'APPLIED', 'ARCHIVED')),
  version INTEGER NOT NULL DEFAULT 1,
  parent_activity_id TEXT REFERENCES public.planned_activities(id) ON DELETE SET NULL,
  copied_from_activity_id TEXT REFERENCES public.planned_activities(id) ON DELETE SET NULL,
  is_template BOOLEAN NOT NULL DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_planned_activities_prof ON public.planned_activities(professional_user_id);
CREATE INDEX IF NOT EXISTS idx_planned_activities_assisted ON public.planned_activities(assisted_person_id);
CREATE INDEX IF NOT EXISTS idx_planned_activities_status ON public.planned_activities(status);

ALTER TABLE public.planned_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PlannedActivities: Leitura por criador, modelos gerais ou vinculados" ON public.planned_activities;
CREATE POLICY "PlannedActivities: Leitura por criador, modelos gerais ou vinculados"
ON public.planned_activities
FOR SELECT
TO authenticated
USING (
  professional_user_id = auth.uid()
  OR is_template = true
  OR (
    assisted_person_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.professional_assisted_links pal
      WHERE pal.assisted_person_id = public.planned_activities.assisted_person_id
        AND pal.professional_user_id = auth.uid()
        AND pal.status = 'ACTIVE'
    )
  )
);

DROP POLICY IF EXISTS "PlannedActivities: Insercao pelo proprio profissional" ON public.planned_activities;
CREATE POLICY "PlannedActivities: Insercao pelo proprio profissional"
ON public.planned_activities
FOR INSERT
TO authenticated
WITH CHECK (professional_user_id = auth.uid());

DROP POLICY IF EXISTS "PlannedActivities: Atualizacao pelo proprio profissional" ON public.planned_activities;
CREATE POLICY "PlannedActivities: Atualizacao pelo proprio profissional"
ON public.planned_activities
FOR UPDATE
TO authenticated
USING (professional_user_id = auth.uid())
WITH CHECK (professional_user_id = auth.uid());

-- ====================================================================
-- 9. APLICAÇÃO DE ATIVIDADES (public.activity_applications)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.activity_applications (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES public.planned_activities(id) ON DELETE CASCADE,
  activity_version INTEGER NOT NULL DEFAULT 1,
  activity_title TEXT NOT NULL,
  professional_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_name TEXT,
  assisted_person_id UUID NOT NULL REFERENCES public.assisted_people(id) ON DELETE CASCADE,
  assisted_user_name TEXT,
  applied_date TEXT NOT NULL,
  was_completed BOOLEAN NOT NULL DEFAULT true,
  actual_duration_minutes INTEGER,
  support_level TEXT,
  engagement_score INTEGER,
  strategies_worked JSONB DEFAULT '[]'::jsonb,
  difficulties_observed JSONB DEFAULT '[]'::jsonb,
  adaptations_made JSONB DEFAULT '[]'::jsonb,
  learner_feedback TEXT,
  observations TEXT,
  next_steps TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_activity_apps_activity ON public.activity_applications(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_apps_prof ON public.activity_applications(professional_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_apps_assisted ON public.activity_applications(assisted_person_id);

ALTER TABLE public.activity_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ActivityApps: Leitura por autor ou profissional vinculado" ON public.activity_applications;
CREATE POLICY "ActivityApps: Leitura por autor ou profissional vinculado"
ON public.activity_applications
FOR SELECT
TO authenticated
USING (
  professional_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.professional_assisted_links pal
    WHERE pal.assisted_person_id = public.activity_applications.assisted_person_id
      AND pal.professional_user_id = auth.uid()
      AND pal.status = 'ACTIVE'
  )
);

DROP POLICY IF EXISTS "ActivityApps: Insercao pelo proprio profissional" ON public.activity_applications;
CREATE POLICY "ActivityApps: Insercao pelo proprio profissional"
ON public.activity_applications
FOR INSERT
TO authenticated
WITH CHECK (professional_user_id = auth.uid());

-- ====================================================================
-- 10. CICLOS PSICOPEDAGÓGICOS (public.psychopedagogy_plans)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.psychopedagogy_plans (
  id TEXT PRIMARY KEY,
  professional_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assisted_person_id UUID NOT NULL REFERENCES public.assisted_people(id) ON DELETE CASCADE,
  assisted_user_name TEXT,
  demand_description TEXT,
  development_context TEXT,
  strengths_observed JSONB DEFAULT '[]'::jsonb,
  difficulties_observed JSONB DEFAULT '[]'::jsonb,
  priority_goals JSONB DEFAULT '[]'::jsonb,
  environmental_adaptations JSONB DEFAULT '[]'::jsonb,
  indicators_of_progress JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'ativo',
  last_review_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_pp_plans_prof ON public.psychopedagogy_plans(professional_user_id);
CREATE INDEX IF NOT EXISTS idx_pp_plans_assisted ON public.psychopedagogy_plans(assisted_person_id);

ALTER TABLE public.psychopedagogy_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PPPlans: Leitura por profissional com vinculo ativo" ON public.psychopedagogy_plans;
CREATE POLICY "PPPlans: Leitura por profissional com vinculo ativo"
ON public.psychopedagogy_plans
FOR SELECT
TO authenticated
USING (
  professional_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.professional_assisted_links pal
    WHERE pal.assisted_person_id = public.psychopedagogy_plans.assisted_person_id
      AND pal.professional_user_id = auth.uid()
      AND pal.status = 'ACTIVE'
  )
);

DROP POLICY IF EXISTS "PPPlans: Insercao/Upsert pelo proprio profissional" ON public.psychopedagogy_plans;
CREATE POLICY "PPPlans: Insercao/Upsert pelo proprio profissional"
ON public.psychopedagogy_plans
FOR INSERT
TO authenticated
WITH CHECK (professional_user_id = auth.uid());

DROP POLICY IF EXISTS "PPPlans: Atualizacao pelo proprio profissional" ON public.psychopedagogy_plans;
CREATE POLICY "PPPlans: Atualizacao pelo proprio profissional"
ON public.psychopedagogy_plans
FOR UPDATE
TO authenticated
USING (professional_user_id = auth.uid())
WITH CHECK (professional_user_id = auth.uid());

-- ====================================================================
-- 11. PROCESSOS PSICOLÓGICOS (public.psychology_processes)
-- (Dados sensíveis — Acesso restrito ao profissional criador ou com escopo explicito)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.psychology_processes (
  id TEXT PRIMARY KEY,
  professional_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_user_id UUID NOT NULL REFERENCES public.assisted_people(id) ON DELETE CASCADE,
  patient_name TEXT,
  start_date TEXT,
  therapeutic_approach TEXT,
  collaborative_goals JSONB DEFAULT '[]'::jsonb,
  session_agendas JSONB DEFAULT '[]'::jsonb,
  inter_session_activities JSONB DEFAULT '[]'::jsonb,
  process_check_ins JSONB DEFAULT '[]'::jsonb,
  rupture_alerts JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'em_andamento',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_psy_processes_prof ON public.psychology_processes(professional_user_id);
CREATE INDEX IF NOT EXISTS idx_psy_processes_patient ON public.psychology_processes(patient_user_id);

ALTER TABLE public.psychology_processes ENABLE ROW LEVEL SECURITY;

-- Somente o profissional responsável ou profissional vinculado com escopo explícito 'psicologico' ou 'full'
DROP POLICY IF EXISTS "PsyProcesses: Acesso restrito e confidencial" ON public.psychology_processes;
CREATE POLICY "PsyProcesses: Acesso restrito e confidencial"
ON public.psychology_processes
FOR SELECT
TO authenticated
USING (
  professional_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.professional_assisted_links pal
    WHERE pal.assisted_person_id = public.psychology_processes.patient_user_id
      AND pal.professional_user_id = auth.uid()
      AND pal.permission_scope IN ('full', 'psicologico')
      AND pal.status = 'ACTIVE'
  )
);

DROP POLICY IF EXISTS "PsyProcesses: Insercao pelo proprio profissional" ON public.psychology_processes;
CREATE POLICY "PsyProcesses: Insercao pelo proprio profissional"
ON public.psychology_processes
FOR INSERT
TO authenticated
WITH CHECK (professional_user_id = auth.uid());

DROP POLICY IF EXISTS "PsyProcesses: Atualizacao pelo proprio profissional" ON public.psychology_processes;
CREATE POLICY "PsyProcesses: Atualizacao pelo proprio profissional"
ON public.psychology_processes
FOR UPDATE
TO authenticated
USING (professional_user_id = auth.uid())
WITH CHECK (professional_user_id = auth.uid());

-- ====================================================================
-- 12. TABELAS DO MÓDULO DE MUSICOTERAPIA
-- (Adaptadas: patient_id / assisted_person_id apontam para assisted_people)
-- ====================================================================

-- 12.1 Habilitação Profissional
CREATE TABLE IF NOT EXISTS public.musicotherapist_qualifications (
  professional_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_name TEXT NOT NULL,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  qualification_type TEXT NOT NULL DEFAULT 'pos_graduacao',
  completion_date TEXT NOT NULL,
  register_info TEXT NOT NULL,
  administrative_notes TEXT,
  supporting_document_name TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.musicotherapist_qualifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "MTQualifications: Leitura publica autenticada" ON public.musicotherapist_qualifications;
CREATE POLICY "MTQualifications: Leitura publica autenticada"
ON public.musicotherapist_qualifications
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "MTQualifications: Modificacao pelo proprio profissional" ON public.musicotherapist_qualifications;
CREATE POLICY "MTQualifications: Modificacao pelo proprio profissional"
ON public.musicotherapist_qualifications
FOR ALL
TO authenticated
USING (professional_id = auth.uid())
WITH CHECK (professional_id = auth.uid());

-- 12.2 Casos de Musicoterapia
CREATE TABLE IF NOT EXISTS public.musicotherapy_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.assisted_people(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_birth_date TEXT,
  patient_pronouns TEXT,
  patient_ciptea TEXT,
  patient_diagnosis_status TEXT,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  professional_name TEXT NOT NULL,
  professional_register TEXT,
  start_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  end_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by UUID REFERENCES auth.users(id),
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_mt_cases_patient ON public.musicotherapy_cases(patient_id);
CREATE INDEX IF NOT EXISTS idx_mt_cases_prof ON public.musicotherapy_cases(professional_id);

ALTER TABLE public.musicotherapy_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "MTCases: Leitura por responsavel ou vinculado" ON public.musicotherapy_cases;
CREATE POLICY "MTCases: Leitura por responsavel ou vinculado"
ON public.musicotherapy_cases
FOR SELECT
TO authenticated
USING (
  professional_id = auth.uid()
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.professional_assisted_links pal
    WHERE pal.assisted_person_id = public.musicotherapy_cases.patient_id
      AND pal.professional_user_id = auth.uid()
      AND pal.status = 'ACTIVE'
  )
);

DROP POLICY IF EXISTS "MTCases: Insercao pelo proprio profissional" ON public.musicotherapy_cases;
CREATE POLICY "MTCases: Insercao pelo proprio profissional"
ON public.musicotherapy_cases
FOR INSERT
TO authenticated
WITH CHECK (professional_id = auth.uid());

DROP POLICY IF EXISTS "MTCases: Atualizacao pelo proprio profissional" ON public.musicotherapy_cases;
CREATE POLICY "MTCases: Atualizacao pelo proprio profissional"
ON public.musicotherapy_cases
FOR UPDATE
TO authenticated
USING (professional_id = auth.uid() OR created_by = auth.uid())
WITH CHECK (professional_id = auth.uid() OR created_by = auth.uid());

-- 12.3 Indicações de Musicoterapia
CREATE TABLE IF NOT EXISTS public.musicotherapy_indications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.musicotherapy_cases(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.assisted_people(id) ON DELETE CASCADE,
  indication_date TEXT NOT NULL,
  prescriber_name TEXT NOT NULL,
  prescriber_specialty TEXT NOT NULL,
  prescriber_register TEXT NOT NULL,
  origin TEXT NOT NULL DEFAULT 'equipe_multidisciplinar',
  recommended_frequency TEXT NOT NULL DEFAULT '1x a 2x por semana',
  recommended_duration TEXT NOT NULL DEFAULT '45 minutos',
  mentioned_goals TEXT NOT NULL,
  notes TEXT,
  validity_date TEXT,
  attached_document_id TEXT,
  attached_document_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.musicotherapy_indications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "MTIndications: Leitura vinculada" ON public.musicotherapy_indications;
CREATE POLICY "MTIndications: Leitura vinculada"
ON public.musicotherapy_indications
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.musicotherapy_cases c
    WHERE c.id = public.musicotherapy_indications.case_id
      AND (c.professional_id = auth.uid() OR c.created_by = auth.uid())
  )
);

DROP POLICY IF EXISTS "MTIndications: Insercao autorizada" ON public.musicotherapy_indications;
CREATE POLICY "MTIndications: Insercao autorizada"
ON public.musicotherapy_indications
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- 12.4 Planos Musicoterapêuticos
CREATE TABLE IF NOT EXISTS public.musicotherapy_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.musicotherapy_cases(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.assisted_people(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id),
  start_date TEXT NOT NULL,
  review_date TEXT NOT NULL,
  general_goals TEXT NOT NULL,
  strategies TEXT NOT NULL,
  frequency TEXT NOT NULL,
  tracking_criteria TEXT NOT NULL,
  observations TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'revised', 'archived')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.musicotherapy_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "MTPlans: Leitura vinculada" ON public.musicotherapy_plans;
CREATE POLICY "MTPlans: Leitura vinculada"
ON public.musicotherapy_plans
FOR SELECT
TO authenticated
USING (
  professional_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.musicotherapy_cases c
    WHERE c.id = public.musicotherapy_plans.case_id
      AND (c.professional_id = auth.uid() OR c.created_by = auth.uid())
  )
);

DROP POLICY IF EXISTS "MTPlans: Modificacao pelo proprio profissional" ON public.musicotherapy_plans;
CREATE POLICY "MTPlans: Modificacao pelo proprio profissional"
ON public.musicotherapy_plans
FOR ALL
TO authenticated
USING (professional_id = auth.uid())
WITH CHECK (professional_id = auth.uid());

-- 12.5 Objetivos Musicoterapêuticos
CREATE TABLE IF NOT EXISTS public.musicotherapy_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.musicotherapy_plans(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.musicotherapy_cases(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.assisted_people(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  description TEXT NOT NULL,
  baseline TEXT NOT NULL,
  target TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'partially_achieved', 'modified', 'discontinued')),
  start_date TEXT NOT NULL,
  review_date TEXT,
  professional_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.musicotherapy_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "MTGoals: Isolamento vinculado" ON public.musicotherapy_goals;
CREATE POLICY "MTGoals: Isolamento vinculado"
ON public.musicotherapy_goals
FOR ALL
TO authenticated
USING (professional_id = auth.uid())
WITH CHECK (professional_id = auth.uid());

-- 12.6 Sessões Clínicas de Musicoterapia
CREATE TABLE IF NOT EXISTS public.musicotherapy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.musicotherapy_cases(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.musicotherapy_plans(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES public.assisted_people(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  professional_id UUID NOT NULL REFERENCES auth.users(id),
  professional_name TEXT NOT NULL,
  professional_register TEXT,
  session_number INTEGER NOT NULL DEFAULT 1,
  date TEXT NOT NULL,
  time TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  modality TEXT NOT NULL DEFAULT 'individual',
  location TEXT NOT NULL DEFAULT 'consultorio',
  participants TEXT DEFAULT 'Paciente e Terapeuta',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'corrected_by_addendum', 'cancelled')),
  attendance_status TEXT NOT NULL DEFAULT 'realizada' CHECK (attendance_status IN ('realizada', 'falta', 'falta_justificada', 'cancelada', 'remarcada')),
  selected_goal_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  interventions JSONB NOT NULL DEFAULT '[]'::jsonb,
  objective_observation TEXT NOT NULL DEFAULT '',
  clinical_interpretation TEXT NOT NULL DEFAULT '',
  sensory_response TEXT,
  communication_interaction TEXT,
  regulation_response TEXT,
  intercurrences TEXT,
  next_steps TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  signed_at TIMESTAMPTZ,
  signed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.musicotherapy_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "MTSessions: Leitura vinculada" ON public.musicotherapy_sessions;
CREATE POLICY "MTSessions: Leitura vinculada"
ON public.musicotherapy_sessions
FOR SELECT
TO authenticated
USING (
  professional_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.musicotherapy_cases c
    WHERE c.id = public.musicotherapy_sessions.case_id
      AND (c.professional_id = auth.uid() OR c.created_by = auth.uid())
  )
);

DROP POLICY IF EXISTS "MTSessions: Insercao pelo proprio profissional" ON public.musicotherapy_sessions;
CREATE POLICY "MTSessions: Insercao pelo proprio profissional"
ON public.musicotherapy_sessions
FOR INSERT
TO authenticated
WITH CHECK (professional_id = auth.uid());

DROP POLICY IF EXISTS "MTSessions: Atualizacao pelo proprio profissional" ON public.musicotherapy_sessions;
CREATE POLICY "MTSessions: Atualizacao pelo proprio profissional"
ON public.musicotherapy_sessions
FOR UPDATE
TO authenticated
USING (professional_id = auth.uid())
WITH CHECK (professional_id = auth.uid());

-- ====================================================================
-- 13. AUDITORIA IMUTÁVEL (public.audit_events)
-- ====================================================================
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

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "AuditEvents: Insercao pelo autor autenticado" ON public.audit_events;
CREATE POLICY "AuditEvents: Insercao pelo autor autenticado"
ON public.audit_events
FOR INSERT
TO authenticated
WITH CHECK (actor_user_id = auth.uid() OR actor_user_id IS NULL);

DROP POLICY IF EXISTS "AuditEvents: Leitura pelo proprio autor ou superadmin" ON public.audit_events;
CREATE POLICY "AuditEvents: Leitura pelo proprio autor ou superadmin"
ON public.audit_events
FOR SELECT
TO authenticated
USING (
  actor_user_id = auth.uid()
  OR (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- ====================================================================
-- FINALIZAÇÃO DA TRANSAÇÃO
-- ====================================================================
COMMIT;
