-- ====================================================================
-- NEUROCONECTA — NC-MT1: SCHEMA DO MÓDULO CLÍNICO DE MUSICOTERAPIA
-- ====================================================================

-- 1. ACOMPANHAMENTO MUSICOTERAPÊUTICO (CASES)
CREATE TABLE IF NOT EXISTS public.musicotherapy_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_mt_cases_professional ON public.musicotherapy_cases(professional_id);

-- 2. INDICAÇÃO / PRESCRIÇÃO
CREATE TABLE IF NOT EXISTS public.musicotherapy_indications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.musicotherapy_cases(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_mt_indications_case ON public.musicotherapy_indications(case_id);

-- 3. HABILITAÇÃO PROFISSIONAL DO MUSICOTERAPEUTA
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

-- 4. AVALIAÇÃO MUSICOTERAPÊUTICA INICIAL & REAVALIAÇÕES
CREATE TABLE IF NOT EXISTS public.musicotherapy_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.musicotherapy_cases(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  professional_name TEXT NOT NULL,
  professional_register TEXT,
  assessment_type TEXT NOT NULL DEFAULT 'initial' CHECK (assessment_type IN ('initial', 'reassessment')),
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'archived')),
  version INTEGER NOT NULL DEFAULT 1,
  previous_assessment_id UUID REFERENCES public.musicotherapy_assessments(id),

  musical_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  sensory_response JSONB NOT NULL DEFAULT '{}'::jsonb,
  communication JSONB NOT NULL DEFAULT '{}'::jsonb,
  social_interaction JSONB NOT NULL DEFAULT '{}'::jsonb,
  attention_engagement JSONB NOT NULL DEFAULT '{}'::jsonb,
  regulation JSONB NOT NULL DEFAULT '{}'::jsonb,
  motor_aspects JSONB NOT NULL DEFAULT '{}'::jsonb,
  emotional_aspects JSONB NOT NULL DEFAULT '{}'::jsonb,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,

  objective_observations TEXT NOT NULL DEFAULT '',
  clinical_interpretation TEXT NOT NULL DEFAULT '',

  signed_at TIMESTAMPTZ,
  signed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_mt_assessments_case ON public.musicotherapy_assessments(case_id);
CREATE INDEX IF NOT EXISTS idx_mt_assessments_patient ON public.musicotherapy_assessments(patient_id);

-- 5. PLANO MUSICOTERAPÊUTICO
CREATE TABLE IF NOT EXISTS public.musicotherapy_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.musicotherapy_cases(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.musicotherapy_assessments(id),
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
CREATE INDEX IF NOT EXISTS idx_mt_plans_case ON public.musicotherapy_plans(case_id);

-- 6. OBJETIVOS ESPECÍFICOS
CREATE TABLE IF NOT EXISTS public.musicotherapy_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.musicotherapy_plans(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.musicotherapy_cases(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_mt_goals_plan ON public.musicotherapy_goals(plan_id);

-- 7. SESSÕES CLÍNICAS (DRAFT, SIGNED, CORRIGIDAS)
CREATE TABLE IF NOT EXISTS public.musicotherapy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.musicotherapy_cases(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.musicotherapy_plans(id),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_mt_sessions_case ON public.musicotherapy_sessions(case_id);
CREATE INDEX IF NOT EXISTS idx_mt_sessions_date ON public.musicotherapy_sessions(date DESC);

-- 8. ADENDOS E RETIFICAÇÕES DE SESSÃO
CREATE TABLE IF NOT EXISTS public.musicotherapy_session_addenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.musicotherapy_sessions(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  previous_snapshot JSONB NOT NULL,
  addendum_text TEXT NOT NULL,
  reason TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_mt_addenda_session ON public.musicotherapy_session_addenda(session_id);

-- 9. INDICADORES CLÍNICOS
CREATE TABLE IF NOT EXISTS public.musicotherapy_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.musicotherapy_cases(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.musicotherapy_goals(id),
  session_id UUID REFERENCES public.musicotherapy_sessions(id),
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'duracao',
  unit TEXT,
  baseline TEXT,
  value TEXT NOT NULL,
  date TEXT NOT NULL,
  context TEXT NOT NULL,
  observation TEXT,
  professional_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_mt_indicators_case ON public.musicotherapy_indicators(case_id);

-- 10. DOCUMENTOS & ANEXOS CLÍNICOS
CREATE TABLE IF NOT EXISTS public.musicotherapy_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.musicotherapy_cases(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'outro',
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  is_private BOOLEAN NOT NULL DEFAULT true,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_mt_documents_case ON public.musicotherapy_documents(case_id);

-- 11. ÁREA ADMINISTRATIVA / CONVÊNIO
CREATE TABLE IF NOT EXISTS public.musicotherapy_insurance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.musicotherapy_cases(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operator TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  protocol TEXT NOT NULL,
  requested_sessions INTEGER NOT NULL DEFAULT 12,
  authorized_sessions INTEGER NOT NULL DEFAULT 0,
  validity_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'autorizado', 'negado', 'em_recurso')),
  denial_reason TEXT,
  administrative_appeal TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_mt_insurance_case ON public.musicotherapy_insurance_records(case_id);

-- 12. HISTÓRICO DE VERSÕES DE RELATÓRIO
CREATE TABLE IF NOT EXISTS public.musicotherapy_reports (
  report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version INTEGER NOT NULL DEFAULT 1,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  case_id UUID NOT NULL REFERENCES public.musicotherapy_cases(id) ON DELETE CASCADE,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  generated_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'signed' CHECK (status IN ('draft', 'signed', 'archived')),
  professional_synthesis TEXT NOT NULL,
  recommendations_continuity TEXT NOT NULL,
  included_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  provenance_summary JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_mt_reports_case ON public.musicotherapy_reports(case_id);

-- ====================================================================
-- FUNÇÕES DE AUTORIZAÇÃO SEGURA (Zero dependência de e-mail hardcoded)
-- ====================================================================

-- 1. Verificador canônico de SuperAdmin derivado de auth.uid() + profiles.is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(check_uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF check_uid IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = check_uid AND (is_super_admin = true OR user_role = 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Verificador de vínculo profissional canônico com o caso clínico
CREATE OR REPLACE FUNCTION public.is_case_professional(p_case_id UUID, check_uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_case_id IS NULL OR check_uid IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.musicotherapy_cases 
    WHERE id = p_case_id AND professional_id = check_uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ====================================================================
-- RLS (ROW LEVEL SECURITY) SEPARADA POR OPERAÇÃO (SELECT, INSERT, UPDATE, DELETE)
-- ====================================================================

ALTER TABLE public.musicotherapy_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicotherapy_indications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicotherapist_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicotherapy_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicotherapy_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicotherapy_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicotherapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicotherapy_session_addenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicotherapy_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicotherapy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicotherapy_insurance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicotherapy_reports ENABLE ROW LEVEL SECURITY;

-- Limpar policies anteriores
DROP POLICY IF EXISTS "mt_cases_policy" ON public.musicotherapy_cases;
DROP POLICY IF EXISTS "mt_cases_select" ON public.musicotherapy_cases;
DROP POLICY IF EXISTS "mt_cases_insert" ON public.musicotherapy_cases;
DROP POLICY IF EXISTS "mt_cases_update" ON public.musicotherapy_cases;
DROP POLICY IF EXISTS "mt_cases_delete" ON public.musicotherapy_cases;

DROP POLICY IF EXISTS "mt_indications_policy" ON public.musicotherapy_indications;
DROP POLICY IF EXISTS "mt_indications_select" ON public.musicotherapy_indications;
DROP POLICY IF EXISTS "mt_indications_insert" ON public.musicotherapy_indications;
DROP POLICY IF EXISTS "mt_indications_update" ON public.musicotherapy_indications;
DROP POLICY IF EXISTS "mt_indications_delete" ON public.musicotherapy_indications;

DROP POLICY IF EXISTS "mt_qualifications_select" ON public.musicotherapist_qualifications;
DROP POLICY IF EXISTS "mt_qualifications_write" ON public.musicotherapist_qualifications;
DROP POLICY IF EXISTS "mt_qualifications_insert" ON public.musicotherapist_qualifications;
DROP POLICY IF EXISTS "mt_qualifications_update" ON public.musicotherapist_qualifications;
DROP POLICY IF EXISTS "mt_qualifications_delete" ON public.musicotherapist_qualifications;

DROP POLICY IF EXISTS "mt_assessments_policy" ON public.musicotherapy_assessments;
DROP POLICY IF EXISTS "mt_assessments_select" ON public.musicotherapy_assessments;
DROP POLICY IF EXISTS "mt_assessments_insert" ON public.musicotherapy_assessments;
DROP POLICY IF EXISTS "mt_assessments_update" ON public.musicotherapy_assessments;
DROP POLICY IF EXISTS "mt_assessments_delete" ON public.musicotherapy_assessments;

DROP POLICY IF EXISTS "mt_plans_policy" ON public.musicotherapy_plans;
DROP POLICY IF EXISTS "mt_plans_select" ON public.musicotherapy_plans;
DROP POLICY IF EXISTS "mt_plans_insert" ON public.musicotherapy_plans;
DROP POLICY IF EXISTS "mt_plans_update" ON public.musicotherapy_plans;
DROP POLICY IF EXISTS "mt_plans_delete" ON public.musicotherapy_plans;

DROP POLICY IF EXISTS "mt_goals_policy" ON public.musicotherapy_goals;
DROP POLICY IF EXISTS "mt_goals_select" ON public.musicotherapy_goals;
DROP POLICY IF EXISTS "mt_goals_insert" ON public.musicotherapy_goals;
DROP POLICY IF EXISTS "mt_goals_update" ON public.musicotherapy_goals;
DROP POLICY IF EXISTS "mt_goals_delete" ON public.musicotherapy_goals;

DROP POLICY IF EXISTS "mt_sessions_policy" ON public.musicotherapy_sessions;
DROP POLICY IF EXISTS "mt_sessions_select" ON public.musicotherapy_sessions;
DROP POLICY IF EXISTS "mt_sessions_insert" ON public.musicotherapy_sessions;
DROP POLICY IF EXISTS "mt_sessions_update" ON public.musicotherapy_sessions;
DROP POLICY IF EXISTS "mt_sessions_delete" ON public.musicotherapy_sessions;

DROP POLICY IF EXISTS "mt_addenda_select" ON public.musicotherapy_session_addenda;
DROP POLICY IF EXISTS "mt_addenda_insert" ON public.musicotherapy_session_addenda;
DROP POLICY IF EXISTS "mt_addenda_update" ON public.musicotherapy_session_addenda;
DROP POLICY IF EXISTS "mt_addenda_delete" ON public.musicotherapy_session_addenda;

DROP POLICY IF EXISTS "mt_indicators_policy" ON public.musicotherapy_indicators;
DROP POLICY IF EXISTS "mt_indicators_select" ON public.musicotherapy_indicators;
DROP POLICY IF EXISTS "mt_indicators_insert" ON public.musicotherapy_indicators;
DROP POLICY IF EXISTS "mt_indicators_update" ON public.musicotherapy_indicators;
DROP POLICY IF EXISTS "mt_indicators_delete" ON public.musicotherapy_indicators;

DROP POLICY IF EXISTS "mt_documents_policy" ON public.musicotherapy_documents;
DROP POLICY IF EXISTS "mt_documents_select" ON public.musicotherapy_documents;
DROP POLICY IF EXISTS "mt_documents_insert" ON public.musicotherapy_documents;
DROP POLICY IF EXISTS "mt_documents_update" ON public.musicotherapy_documents;
DROP POLICY IF EXISTS "mt_documents_delete" ON public.musicotherapy_documents;

DROP POLICY IF EXISTS "mt_insurance_policy" ON public.musicotherapy_insurance_records;
DROP POLICY IF EXISTS "mt_insurance_select" ON public.musicotherapy_insurance_records;
DROP POLICY IF EXISTS "mt_insurance_insert" ON public.musicotherapy_insurance_records;
DROP POLICY IF EXISTS "mt_insurance_update" ON public.musicotherapy_insurance_records;
DROP POLICY IF EXISTS "mt_insurance_delete" ON public.musicotherapy_insurance_records;

DROP POLICY IF EXISTS "mt_reports_policy" ON public.musicotherapy_reports;
DROP POLICY IF EXISTS "mt_reports_select" ON public.musicotherapy_reports;
DROP POLICY IF EXISTS "mt_reports_insert" ON public.musicotherapy_reports;
DROP POLICY IF EXISTS "mt_reports_update" ON public.musicotherapy_reports;
DROP POLICY IF EXISTS "mt_reports_delete" ON public.musicotherapy_reports;

-- --------------------------------------------------------------------
-- 1. CASES (Acompanhamentos)
-- --------------------------------------------------------------------
CREATE POLICY "mt_cases_select" ON public.musicotherapy_cases FOR SELECT
USING (
  auth.uid() = patient_id 
  OR auth.uid() = professional_id
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_cases_insert" ON public.musicotherapy_cases FOR INSERT
WITH CHECK (
  auth.uid() = professional_id
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_cases_update" ON public.musicotherapy_cases FOR UPDATE
USING (
  auth.uid() = professional_id
  OR public.is_super_admin(auth.uid())
)
WITH CHECK (
  auth.uid() = professional_id
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_cases_delete" ON public.musicotherapy_cases FOR DELETE
USING (
  -- Sem deleção física silenciosa. Exclusão restrita apenas a Superadmin para manutenção de teste,
  -- recomendando-se sempre arquivamento lógico (status = 'archived')
  public.is_super_admin(auth.uid())
);

-- --------------------------------------------------------------------
-- 2. INDICATIONS (Indicações)
-- --------------------------------------------------------------------
CREATE POLICY "mt_indications_select" ON public.musicotherapy_indications FOR SELECT
USING (
  auth.uid() = patient_id
  OR public.is_case_professional(case_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_indications_insert" ON public.musicotherapy_indications FOR INSERT
WITH CHECK (
  public.is_case_professional(case_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_indications_update" ON public.musicotherapy_indications FOR UPDATE
USING (
  public.is_case_professional(case_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_indications_delete" ON public.musicotherapy_indications FOR DELETE
USING (
  public.is_super_admin(auth.uid())
);

-- --------------------------------------------------------------------
-- 3. QUALIFICATIONS (Habilitação Profissional)
-- --------------------------------------------------------------------
CREATE POLICY "mt_qualifications_select" ON public.musicotherapist_qualifications FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "mt_qualifications_insert" ON public.musicotherapist_qualifications FOR INSERT
WITH CHECK (
  auth.uid() = professional_id 
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_qualifications_update" ON public.musicotherapist_qualifications FOR UPDATE
USING (
  auth.uid() = professional_id 
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_qualifications_delete" ON public.musicotherapist_qualifications FOR DELETE
USING (public.is_super_admin(auth.uid()));

-- --------------------------------------------------------------------
-- 4. ASSESSMENTS (Avaliações Clínicas)
-- --------------------------------------------------------------------
CREATE POLICY "mt_assessments_select" ON public.musicotherapy_assessments FOR SELECT
USING (
  auth.uid() = patient_id
  OR auth.uid() = professional_id
  OR public.is_case_professional(case_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_assessments_insert" ON public.musicotherapy_assessments FOR INSERT
WITH CHECK (
  auth.uid() = professional_id
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_assessments_update" ON public.musicotherapy_assessments FOR UPDATE
USING (
  -- Se draft, o profissional pode editar. Se finalizado ('signed'), apenas Superadmin para suporte técnico versionado.
  (auth.uid() = professional_id AND status = 'draft')
  OR public.is_super_admin(auth.uid())
)
WITH CHECK (
  (auth.uid() = professional_id AND status IN ('draft', 'signed'))
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_assessments_delete" ON public.musicotherapy_assessments FOR DELETE
USING (
  -- Apenas rascunho próprio pode ser deletado fisicamente. Registro finalizado é imutável.
  (auth.uid() = professional_id AND status = 'draft')
);

-- --------------------------------------------------------------------
-- 5. PLANS (Planos Terapêuticos)
-- --------------------------------------------------------------------
CREATE POLICY "mt_plans_select" ON public.musicotherapy_plans FOR SELECT
USING (
  auth.uid() = patient_id
  OR auth.uid() = professional_id
  OR public.is_case_professional(case_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_plans_insert" ON public.musicotherapy_plans FOR INSERT
WITH CHECK (
  auth.uid() = professional_id
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_plans_update" ON public.musicotherapy_plans FOR UPDATE
USING (
  auth.uid() = professional_id
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_plans_delete" ON public.musicotherapy_plans FOR DELETE
USING (
  -- Planos em vigor não são apagados fisicamente; são arquivados ou revisados
  (auth.uid() = professional_id AND status = 'draft')
);

-- --------------------------------------------------------------------
-- 6. GOALS (Metas Clínicas)
-- --------------------------------------------------------------------
CREATE POLICY "mt_goals_select" ON public.musicotherapy_goals FOR SELECT
USING (
  auth.uid() = patient_id
  OR auth.uid() = professional_id
  OR public.is_case_professional(case_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_goals_insert" ON public.musicotherapy_goals FOR INSERT
WITH CHECK (
  auth.uid() = professional_id
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_goals_update" ON public.musicotherapy_goals FOR UPDATE
USING (
  auth.uid() = professional_id
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_goals_delete" ON public.musicotherapy_goals FOR DELETE
USING (
  auth.uid() = professional_id
  OR public.is_super_admin(auth.uid())
);

-- --------------------------------------------------------------------
-- 7. SESSIONS (Registros de Atendimento / Sessões)
-- --------------------------------------------------------------------
CREATE POLICY "mt_sessions_select" ON public.musicotherapy_sessions FOR SELECT
USING (
  auth.uid() = patient_id
  OR auth.uid() = professional_id
  OR public.is_case_professional(case_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_sessions_insert" ON public.musicotherapy_sessions FOR INSERT
WITH CHECK (
  auth.uid() = professional_id
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_sessions_update" ON public.musicotherapy_sessions FOR UPDATE
USING (
  -- REGRA FUNDAMENTAL: Rascunho ('draft') pode ser atualizado pelo profissional.
  -- Sessão finalizada ('signed') bloqueia UPDATE direto pelo profissional (exige adendo).
  -- Superadmin tem acesso de suporte administrativo com motivo registrado.
  (auth.uid() = professional_id AND status = 'draft')
  OR public.is_super_admin(auth.uid())
)
WITH CHECK (
  (auth.uid() = professional_id AND status IN ('draft', 'signed'))
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_sessions_delete" ON public.musicotherapy_sessions FOR DELETE
USING (
  -- Sessão finalizada NUNCA pode ser deletada fisicamente. Apenas drafts próprios podem ser descartados.
  (auth.uid() = professional_id AND status = 'draft')
);

-- --------------------------------------------------------------------
-- 8. ADDENDA (Adendos e Retificações de Sessão — Imutáveis & Append-Only)
-- --------------------------------------------------------------------
CREATE POLICY "mt_addenda_select" ON public.musicotherapy_session_addenda FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.musicotherapy_sessions s 
    WHERE s.id = session_id AND (s.patient_id = auth.uid() OR s.professional_id = auth.uid())
  )
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_addenda_insert" ON public.musicotherapy_session_addenda FOR INSERT
WITH CHECK (
  auth.uid() = author_id
  AND (
    EXISTS (SELECT 1 FROM public.musicotherapy_sessions s WHERE s.id = session_id AND s.professional_id = auth.uid())
    OR public.is_super_admin(auth.uid())
  )
);

CREATE POLICY "mt_addenda_update" ON public.musicotherapy_session_addenda FOR UPDATE
USING (false); -- Imutável

CREATE POLICY "mt_addenda_delete" ON public.musicotherapy_session_addenda FOR DELETE
USING (false); -- Imutável

-- --------------------------------------------------------------------
-- 9. INDICATORS (Indicadores Clínicos)
-- --------------------------------------------------------------------
CREATE POLICY "mt_indicators_select" ON public.musicotherapy_indicators FOR SELECT
USING (
  auth.uid() = patient_id
  OR auth.uid() = professional_id
  OR public.is_case_professional(case_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_indicators_insert" ON public.musicotherapy_indicators FOR INSERT
WITH CHECK (
  auth.uid() = professional_id
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_indicators_update" ON public.musicotherapy_indicators FOR UPDATE
USING (
  auth.uid() = professional_id
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_indicators_delete" ON public.musicotherapy_indicators FOR DELETE
USING (
  auth.uid() = professional_id
  OR public.is_super_admin(auth.uid())
);

-- --------------------------------------------------------------------
-- 10. DOCUMENTS (Documentos & Anexos — Bucket Privado)
-- --------------------------------------------------------------------
CREATE POLICY "mt_documents_select" ON public.musicotherapy_documents FOR SELECT
USING (
  auth.uid() = patient_id
  OR auth.uid() = uploaded_by
  OR public.is_case_professional(case_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_documents_insert" ON public.musicotherapy_documents FOR INSERT
WITH CHECK (
  auth.uid() = uploaded_by
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_documents_update" ON public.musicotherapy_documents FOR UPDATE
USING (
  auth.uid() = uploaded_by
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_documents_delete" ON public.musicotherapy_documents FOR DELETE
USING (
  public.is_super_admin(auth.uid())
);

-- --------------------------------------------------------------------
-- 11. INSURANCE (Convênio & Guia Administrativa)
-- --------------------------------------------------------------------
CREATE POLICY "mt_insurance_select" ON public.musicotherapy_insurance_records FOR SELECT
USING (
  auth.uid() = patient_id
  OR public.is_case_professional(case_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_insurance_insert" ON public.musicotherapy_insurance_records FOR INSERT
WITH CHECK (
  public.is_case_professional(case_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_insurance_update" ON public.musicotherapy_insurance_records FOR UPDATE
USING (
  public.is_case_professional(case_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_insurance_delete" ON public.musicotherapy_insurance_records FOR DELETE
USING (
  public.is_super_admin(auth.uid())
);

-- --------------------------------------------------------------------
-- 12. REPORTS (Relatórios Clínicos Emitidos — Histórico Imutável)
-- --------------------------------------------------------------------
CREATE POLICY "mt_reports_select" ON public.musicotherapy_reports FOR SELECT
USING (
  auth.uid() = patient_id
  OR auth.uid() = generated_by
  OR public.is_case_professional(case_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_reports_insert" ON public.musicotherapy_reports FOR INSERT
WITH CHECK (
  auth.uid() = generated_by
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "mt_reports_update" ON public.musicotherapy_reports FOR UPDATE
USING (false); -- Relatórios emitidos são imutáveis; novas versões geram novo registro

CREATE POLICY "mt_reports_delete" ON public.musicotherapy_reports FOR DELETE
USING (false); -- Histórico de relatório não pode ser apagado

-- --------------------------------------------------------------------
-- 13. AUDIT_EVENTS (Auditoria Imutável e Append-Only)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "audit_events_select_own" ON public.audit_events;
DROP POLICY IF EXISTS "audit_events_insert_own" ON public.audit_events;
DROP POLICY IF EXISTS "audit_events_select" ON public.audit_events;
DROP POLICY IF EXISTS "audit_events_insert" ON public.audit_events;
DROP POLICY IF EXISTS "audit_events_update" ON public.audit_events;
DROP POLICY IF EXISTS "audit_events_delete" ON public.audit_events;

CREATE POLICY "audit_events_select" ON public.audit_events FOR SELECT
USING (
  actor_user_id = auth.uid() 
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "audit_events_insert" ON public.audit_events FOR INSERT
WITH CHECK (
  -- Ator não pode ser forjado: deve coincidir com o auth.uid() autenticado
  auth.uid() = actor_user_id
);

CREATE POLICY "audit_events_update" ON public.audit_events FOR UPDATE
USING (false); -- Ninguém pode alterar auditoria

CREATE POLICY "audit_events_delete" ON public.audit_events FOR DELETE
USING (false); -- Ninguém pode deletar auditoria

-- ====================================================================
-- DATABASE TRIGGER: AUDITORIA AUTOMÁTICA DE FINALIZAÇÃO CLÍNICA
-- ====================================================================
CREATE OR REPLACE FUNCTION public.audit_session_finalization()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    IF (OLD.status = 'draft' AND NEW.status = 'signed') THEN
      INSERT INTO public.audit_events (
        actor_user_id,
        action,
        entity_type,
        entity_id,
        before_data,
        after_data,
        source
      ) VALUES (
        auth.uid(),
        'CLINICAL_SESSION_FINALIZED',
        'musicotherapy_sessions',
        NEW.id::text,
        jsonb_build_object('status', OLD.status, 'version', OLD.version),
        jsonb_build_object('status', NEW.status, 'version', NEW.version, 'finalized_by', NEW.signed_by, 'finalized_at', NEW.signed_at),
        'supabase_db_trigger'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_session_finalization ON public.musicotherapy_sessions;
CREATE TRIGGER trg_audit_session_finalization
AFTER UPDATE ON public.musicotherapy_sessions
FOR EACH ROW EXECUTE FUNCTION public.audit_session_finalization();

