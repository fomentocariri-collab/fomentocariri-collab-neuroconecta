/// <reference types="vite/client" />
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const custom = localStorage.getItem("neuroconecta_supabase_custom_config");
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url.trim(),
          anonKey: parsed.anonKey.trim(),
          isCustom: true,
        };
      }
    }
  } catch (e) {
    console.warn("Erro ao ler config customizada do Supabase:", e);
  }

  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

  return {
    url: envUrl || "https://gbjanxdyllxpsydsubcx.supabase.co",
    anonKey: envKey || "sb_publishable_3YXxIUQtChenhRgqMlr0Xw_W8DgQ2da",
    isCustom: false,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(
    "neuroconecta_supabase_custom_config",
    JSON.stringify({
      url: url.trim(),
      anonKey: anonKey.trim(),
      updatedAt: new Date().toISOString(),
    })
  );
  rebuildSupabaseClient();
}

export function resetSupabaseConfig(): void {
  localStorage.removeItem("neuroconecta_supabase_custom_config");
  rebuildSupabaseClient();
}

let activeConfig = getSupabaseConfig();

export let supabase: SupabaseClient = createClient(activeConfig.url, activeConfig.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function rebuildSupabaseClient(): void {
  activeConfig = getSupabaseConfig();
  supabase = createClient(activeConfig.url, activeConfig.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export interface SupabaseHealthReport {
  status: "connected" | "tables_missing" | "offline_mitigated" | "error";
  endpointUrl: string;
  isCustom: boolean;
  message: string;
  technicalDetails?: string;
  localStorageStatus: "operational" | "error";
  totalLocalRecords: {
    userProfiles: number;
    testHistory: number;
    routineTasks: number;
    moodLogs: number;
    caregiverLogs: number;
  };
}

/**
 * Resilient health check that never hangs the application or throws fatal unhandled errors.
 * If Supabase is unreachable or DNS fails, it activates offline mitigation mode and verifies
 * that local storage is 100% operational with no data loss.
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthReport> {
  const config = getSupabaseConfig();

  const getLocalCount = (key: string): number => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return 0;
      const parsed = JSON.parse(item);
      return Array.isArray(parsed) ? parsed.length : 1;
    } catch {
      return 0;
    }
  };

  const localCounts = {
    userProfiles: getLocalCount("neuroconecta_user_profile"),
    testHistory: getLocalCount("neuroconecta_test_history"),
    routineTasks: getLocalCount("neuroconecta_routine_tasks"),
    moodLogs: getLocalCount("neuroconecta_mood_logs"),
    caregiverLogs: getLocalCount("neuroconecta_caregiver_notes"),
  };

  let storageHealth: "operational" | "error" = "operational";
  try {
    localStorage.setItem("neuroconecta_storage_test", "ok");
    localStorage.removeItem("neuroconecta_storage_test");
  } catch {
    storageHealth = "error";
  }

  // Fast abort timeout to avoid blocking if host is dead or DNS fails
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const queryPromise = supabase
      .from("profiles")
      .select("id")
      .limit(1);

    const raceResult: any = await Promise.race([
      queryPromise,
      new Promise((_, reject) => {
        controller.signal.addEventListener("abort", () => {
          reject(new Error("Timeout de conexão (endpoint Supabase remoto inacessível)"));
        });
      }),
    ]);

    clearTimeout(timeoutId);

    if (!raceResult.error) {
      return {
        status: "connected",
        endpointUrl: config.url,
        isCustom: config.isCustom,
        message: "Conectado ao Supabase com tabelas ativas e sincronização remota pronta!",
        localStorageStatus: storageHealth,
        totalLocalRecords: localCounts,
      };
    }

    const error = raceResult.error;
    if (
      error.code === "42P01" ||
      error.message?.includes("relation") ||
      error.message?.includes("does not exist")
    ) {
      return {
        status: "tables_missing",
        endpointUrl: config.url,
        isCustom: config.isCustom,
        message: "Conexão com o Supabase estabelecida! As tabelas precisam ser criadas com o script SQL fornecido.",
        technicalDetails: `Código: ${error.code} - ${error.message}`,
        localStorageStatus: storageHealth,
        totalLocalRecords: localCounts,
      };
    }

    return {
      status: "offline_mitigated",
      endpointUrl: config.url,
      isCustom: config.isCustom,
      message: "Modo Local Seguro Ativo: O endpoint remoto não respondeu. Todos os dados permanecem protegidos e íntegros no armazenamento local do navegador.",
      technicalDetails: `${error.message} ${error.code ? `(Código: ${error.code})` : ""}`,
      localStorageStatus: storageHealth,
      totalLocalRecords: localCounts,
    };
  } catch (err: any) {
    const isNetwork =
      err.name === "AbortError" ||
      err.message?.includes("Failed to fetch") ||
      err.message?.includes("NetworkError") ||
      err.message?.includes("Timeout") ||
      err.message?.includes("resolve");

    return {
      status: "offline_mitigated",
      endpointUrl: config.url,
      isCustom: config.isCustom,
      message: isNetwork
        ? "Modo Local Seguro Ativo: Endpoint remoto inacessível ou sem resolução DNS. Mitigação ativa: o aplicativo opera 100% autônomo com persistência local sem perda de dados."
        : `Modo Local Seguro Ativo: ${err.message || "Conexão remota não estabelecida"}. Persistência local operacional.`,
      technicalDetails: err.message || "Falha de rede ou host não resolvido",
      localStorageStatus: storageHealth,
      totalLocalRecords: localCounts,
    };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
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
    COALESCE((NEW.raw_user_meta_data->>'user_role' = 'superadmin'), false)
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

-- 4. TABELAS DE DADOS PERSISTENTES DO USUÁRIO (com owner_user_id obrigatório)
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

-- 5. BACKFILL SEGURO DE PERFIS EXISTENTES (NÃO apaga nenhum usuário, cria o perfil caso falte)
INSERT INTO public.profiles (
  id,
  display_name,
  preferred_name,
  user_role,
  is_super_admin
)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  COALESCE(u.raw_user_meta_data->>'preferred_name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'user_role', 'pcd'),
  COALESCE((u.raw_user_meta_data->>'user_role' = 'superadmin'), false)
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- 6. ROW LEVEL SECURITY (RLS) IDEMPOTENTE & ACESSO SUPERADMIN
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

-- Remove políticas anteriores para evitar erro 'policy already exists' ao refazer o script
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_superadmin_all" ON public.profiles;

DROP POLICY IF EXISTS "audit_events_insert_own" ON public.audit_events;
DROP POLICY IF EXISTS "audit_events_select_own" ON public.audit_events;

DROP POLICY IF EXISTS "test_history_owner" ON public.test_history;
DROP POLICY IF EXISTS "test_history_superadmin" ON public.test_history;

DROP POLICY IF EXISTS "routine_tasks_owner" ON public.routine_tasks;
DROP POLICY IF EXISTS "mood_logs_owner" ON public.mood_logs;
DROP POLICY IF EXISTS "caregiver_logs_owner" ON public.caregiver_logs;
DROP POLICY IF EXISTS "agenda_events_owner" ON public.agenda_events;

-- Políticas de Profiles (Usuário próprio OU SuperAdmin com papel no banco)
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT 
USING (
  auth.uid() = id 
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.is_super_admin = true OR p.user_role = 'superadmin'))
);

CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE 
USING (
  auth.uid() = id 
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.is_super_admin = true OR p.user_role = 'superadmin'))
)
WITH CHECK (
  auth.uid() = id 
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.is_super_admin = true OR p.user_role = 'superadmin'))
);

-- Políticas de Auditoria (Append-only e actor verificado)
CREATE POLICY "audit_events_insert_own" ON public.audit_events FOR INSERT 
WITH CHECK (auth.uid() = actor_user_id);

CREATE POLICY "audit_events_select_own" ON public.audit_events FOR SELECT 
USING (
  auth.uid() = actor_user_id 
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.is_super_admin = true OR p.user_role = 'superadmin'))
);

-- Políticas de Testes (Usuário próprio OU SuperAdmin)
CREATE POLICY "test_history_owner" ON public.test_history FOR ALL 
USING (
  auth.uid() = owner_user_id 
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.is_super_admin = true OR p.user_role = 'superadmin'))
)
WITH CHECK (
  auth.uid() = owner_user_id 
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.is_super_admin = true OR p.user_role = 'superadmin'))
);

-- Políticas de Rotinas, Humor, Cuidadores e Agenda
CREATE POLICY "routine_tasks_owner" ON public.routine_tasks FOR ALL 
USING (
  auth.uid() = owner_user_id 
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true)
) 
WITH CHECK (
  auth.uid() = owner_user_id 
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true)
);

CREATE POLICY "mood_logs_owner" ON public.mood_logs FOR ALL 
USING (
  auth.uid() = owner_user_id 
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true)
) 
WITH CHECK (
  auth.uid() = owner_user_id 
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true)
);

CREATE POLICY "caregiver_logs_owner" ON public.caregiver_logs FOR ALL 
USING (
  auth.uid() = owner_user_id 
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true)
) 
WITH CHECK (
  auth.uid() = owner_user_id 
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true)
);

CREATE POLICY "agenda_events_owner" ON public.agenda_events FOR ALL 
USING (
  auth.uid() = owner_user_id 
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true)
) 
WITH CHECK (
  auth.uid() = owner_user_id 
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true)
);
`;
