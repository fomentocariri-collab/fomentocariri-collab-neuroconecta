import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { UserProfile, UserRole } from "../types";
import { auditService } from "../services/auditService";
import { dataSyncService } from "../services/dataSyncService";
import { musicotherapyService } from "../services/musicotherapyService";

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile;
  canonicalUserId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isOfflineMode: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string; user?: User; isOfflineFallback?: boolean }>;
  signUp: (email: string, pass: string, initialProfile: Partial<UserProfile>) => Promise<{ error?: string; user?: User; isOfflineFallback?: boolean }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInLocal: (email: string, name?: string, role?: UserRole) => Promise<{ user: User }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ error?: string }>;
  refreshSession: () => Promise<void>;
}

export function isNetworkOrDnsError(err: any): boolean {
  if (!err) return false;
  const msg = (err?.message || err?.error_description || String(err)).toLowerCase();
  return (
    msg.includes("networkerror") ||
    msg.includes("failed to fetch") ||
    msg.includes("load failed") ||
    msg.includes("network request failed") ||
    msg.includes("could not resolve") ||
    msg.includes("enotfound") ||
    msg.includes("abort") ||
    msg.includes("timeout") ||
    msg.includes("cors")
  );
}

function getOrCreateDeterministicId(email: string): string {
  try {
    const key = email.trim().toLowerCase();
    const storageKey = "neuroconecta_account_uuid_map";
    const raw = localStorage.getItem(storageKey);
    const map = raw ? JSON.parse(raw) : {};
    if (map[key]) return map[key];

    let uuid = "";
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      uuid = crypto.randomUUID();
    } else {
      uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    map[key] = uuid;
    localStorage.setItem(storageKey, JSON.stringify(map));
    return uuid;
  } catch {
    return "00000000-0000-4000-8000-000000000001";
  }
}

const defaultGuestProfile: UserProfile = {
  id: undefined,
  email: undefined,
  preferredName: "Visitante",
  pronouns: "não informado",
  diagnosisStatus: "nao_informado",
  supportLevel: "nao_especificado",
  currentFocus: "geral",
  emergencyContacts: [],
  lowStimulationMode: false,
  caregiverMode: false,
  notificationsEnabled: true,
  onboardingCompleted: true,
  isGuest: true,
  isSuperAdmin: false,
  userRole: "pcd",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultGuestProfile);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Helper to check if an account has superadmin role
  const checkIsSuperAdmin = (email?: string, role?: string, profileFlag?: boolean): boolean => {
    return !!profileFlag || role === "superadmin";
  };

  const createDefaultLocalProfile = (userId: string, cleanEmail: string, isSuper: boolean): UserProfile => {
    return {
      id: userId,
      email: cleanEmail,
      preferredName: cleanEmail.split("@")[0] || "Usuário",
      pronouns: "não informado",
      userRole: isSuper ? "superadmin" : "pcd",
      diagnosisStatus: "laudo_formal",
      supportLevel: "nao_especificado",
      currentFocus: "geral",
      emergencyContacts: [],
      lowStimulationMode: false,
      caregiverMode: false,
      notificationsEnabled: true,
      onboardingCompleted: true,
      isGuest: false,
      isSuperAdmin: isSuper,
      createdAt: new Date().toISOString(),
    };
  };

  // Loads profile from public.profiles table or creates it if absent
  const fetchOrCreateProfile = useCallback(async (authUser: User): Promise<UserProfile> => {
    const isSuper = checkIsSuperAdmin(authUser.email, authUser.user_metadata?.user_role);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!error && data) {
        const loadedProfile: UserProfile = {
          id: authUser.id,
          email: authUser.email,
          preferredName: data.preferred_name || authUser.user_metadata?.preferred_name || authUser.email?.split("@")[0] || "Usuário",
          pronouns: data.pronouns || "não informado",
          birthDate: data.birth_date,
          userRole: isSuper ? "superadmin" : (data.user_role || "pcd"),
          professionalRoleType: data.professional_role_type,
          professionalRegisterNumber: data.professional_register_number,
          diagnosisStatus: data.diagnosis_status || "nao_informado",
          supportLevel: data.support_level || "nao_especificado",
          currentFocus: data.current_focus || "geral",
          emergencyContacts: data.emergency_contacts || [],
          lowStimulationMode: !!data.low_stimulation_mode,
          caregiverMode: !!data.caregiver_mode,
          notificationsEnabled: data.notifications_enabled !== false,
          onboardingCompleted: true,
          createdAt: data.created_at || authUser.created_at,
          isGuest: false,
          isSuperAdmin: isSuper || !!data.is_super_admin,
          hiddenModules: data.hidden_modules || [],
        };

        // Cache locally for instant UI responsiveness
        localStorage.setItem(`neuroconecta_profile_${authUser.id}`, JSON.stringify(loadedProfile));
        localStorage.setItem("neuroconecta_active_user_id", authUser.id);
        return loadedProfile;
      }

      // If not found in remote database, create it idempotently
      const initialName = authUser.user_metadata?.preferred_name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Usuário";
      const initialRole = isSuper ? "superadmin" : (authUser.user_metadata?.user_role || "pcd");

      const newProfilePayload = {
        id: authUser.id,
        display_name: authUser.email,
        preferred_name: initialName,
        pronouns: "não informado",
        user_role: initialRole,
        is_super_admin: isSuper,
        diagnosis_status: authUser.user_metadata?.diagnosis_status || "nao_informado",
        support_level: authUser.user_metadata?.support_level || "nao_especificado",
        current_focus: "geral",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        await supabase.from("profiles").upsert(newProfilePayload, { onConflict: "id" });
        await auditService.log({
          actorUserId: authUser.id,
          action: "PROFILE_CREATED",
          entityType: "profiles",
          entityId: authUser.id,
          afterData: newProfilePayload,
        });
      } catch (insertErr) {
        console.warn("Aviso na criação remota de perfil:", insertErr);
      }

      const created: UserProfile = {
        id: authUser.id,
        email: authUser.email,
        preferredName: initialName,
        pronouns: "não informado",
        userRole: initialRole,
        diagnosisStatus: (authUser.user_metadata?.diagnosis_status as any) || "nao_informado",
        supportLevel: authUser.user_metadata?.support_level || "nao_especificado",
        currentFocus: "geral",
        emergencyContacts: [],
        lowStimulationMode: false,
        onboardingCompleted: true,
        isGuest: false,
        isSuperAdmin: isSuper,
      };

      localStorage.setItem(`neuroconecta_profile_${authUser.id}`, JSON.stringify(created));
      localStorage.setItem("neuroconecta_active_user_id", authUser.id);
      return created;
    } catch (e) {
      console.warn("Erro ao carregar perfil do Supabase:", e);
      // Resilient fallback to local profile cache
      const cached = localStorage.getItem(`neuroconecta_profile_${authUser.id}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }

      return {
        id: authUser.id,
        email: authUser.email,
        preferredName: authUser.email?.split("@")[0] || "Usuário",
        pronouns: "não informado",
        diagnosisStatus: "nao_informado",
        supportLevel: "nao_especificado",
        currentFocus: "geral",
        emergencyContacts: [],
        lowStimulationMode: false,
        onboardingCompleted: true,
        isGuest: false,
        isSuperAdmin: isSuper,
        userRole: isSuper ? "superadmin" : "pcd",
      };
    }
  }, []);

  // Sync and hydrate user data on login/session restore
  const handleSession = useCallback(async (session: Session | null) => {
    if (session?.user) {
      setUser(session.user);
      const profile = await fetchOrCreateProfile(session.user);
      setUserProfile(profile);

      // Perform cross-device sync & legacy migration in non-blocking background
      dataSyncService.migrateLegacyLocalData(session.user.id).catch(console.warn);
      dataSyncService.pullRemoteUserData(session.user.id).catch(console.warn);
    } else {
      setUser(null);
      setUserProfile(defaultGuestProfile);
      localStorage.removeItem("neuroconecta_active_user_id");
    }
    setIsLoading(false);
  }, [fetchOrCreateProfile]);

  // Initial session check and auth listener
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // 1. Try remote Supabase session with a fast timeout
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null }; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout ao buscar sessão remota")), 2500)
        );
        const res: any = await Promise.race([sessionPromise, timeoutPromise]);
        const session = res?.data?.session;

        if (session?.user && mounted) {
          setIsOfflineMode(false);
          await handleSession(session);
          return;
        }
      } catch (err) {
        console.warn("Aviso na recuperação de sessão remota Supabase (ativando modo local resiliente):", err);
      }

      // 2. Check local saved session fallback
      try {
        const activeUserId = localStorage.getItem("neuroconecta_active_user_id");
        if (activeUserId) {
          const cachedProfile = localStorage.getItem(`neuroconecta_profile_${activeUserId}`);
          if (cachedProfile) {
            const parsed: UserProfile = JSON.parse(cachedProfile);
            const isSuper = checkIsSuperAdmin(parsed.email, parsed.userRole);
            const cleanEmail = parsed.email || `${parsed.preferredName.toLowerCase().replace(/\s+/g, "")}@local.dev`;

            const localUser: User = {
              id: activeUserId,
              app_metadata: { provider: "local_offline" },
              user_metadata: {
                preferred_name: parsed.preferredName,
                user_role: isSuper ? "superadmin" : parsed.userRole,
              },
              aud: "authenticated",
              created_at: parsed.createdAt || new Date().toISOString(),
              email: cleanEmail,
            } as any;

            if (mounted) {
              setUser(localUser);
              setUserProfile({
                ...parsed,
                isSuperAdmin: isSuper,
                userRole: isSuper ? "superadmin" : parsed.userRole,
              });
              setIsOfflineMode(true);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (e) {
        console.warn("Erro ao restaurar sessão local:", e);
      }

      if (mounted) {
        setUser(null);
        setUserProfile(defaultGuestProfile);
        setIsLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted && session?.user) {
        setIsOfflineMode(false);
        await handleSession(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleSession]);

  // Offline sign in handler
  const executeOfflineSignIn = async (cleanEmail: string, isSuper: boolean) => {
    const userId = getOrCreateDeterministicId(cleanEmail);
    const cachedProfileRaw = localStorage.getItem(`neuroconecta_profile_${userId}`);
    let profile: UserProfile;

    if (cachedProfileRaw) {
      try {
        profile = JSON.parse(cachedProfileRaw);
        profile.isSuperAdmin = isSuper || profile.isSuperAdmin;
        if (isSuper) profile.userRole = "superadmin";
      } catch {
        profile = createDefaultLocalProfile(userId, cleanEmail, isSuper);
      }
    } else {
      profile = createDefaultLocalProfile(userId, cleanEmail, isSuper);
    }

    const localUser: User = {
      id: userId,
      app_metadata: { provider: "local_offline" },
      user_metadata: {
        preferred_name: profile.preferredName,
        user_role: profile.userRole,
      },
      aud: "authenticated",
      created_at: profile.createdAt || new Date().toISOString(),
      email: cleanEmail,
    } as any;

    setUser(localUser);
    setUserProfile(profile);
    setIsOfflineMode(true);
    setIsLoading(false);

    localStorage.setItem(`neuroconecta_profile_${userId}`, JSON.stringify(profile));
    localStorage.setItem("neuroconecta_active_user_id", userId);
    localStorage.setItem("neuroconecta_user_profile", JSON.stringify(profile));

    await auditService.log({
      actorUserId: userId,
      action: "LOGIN_SUCCESS",
      entityType: "auth.users",
      entityId: userId,
      source: "AuthContext.signIn (Contingência Local Offline)",
    });

    return { user: localUser, isOfflineFallback: true };
  };

  // Offline sign up handler
  const executeOfflineSignUp = async (
    cleanEmail: string,
    isSuper: boolean,
    initialProfile: Partial<UserProfile>
  ) => {
    const userId = getOrCreateDeterministicId(cleanEmail);
    const preferredName = initialProfile.preferredName?.trim() || cleanEmail.split("@")[0] || "Usuário";
    const userRole = isSuper ? "superadmin" : (initialProfile.userRole || "pcd");

    const profile: UserProfile = {
      id: userId,
      email: cleanEmail,
      preferredName,
      pronouns: initialProfile.pronouns || "não informado",
      birthDate: initialProfile.birthDate,
      userRole,
      professionalRoleType: isSuper ? "medico" : initialProfile.professionalRoleType,
      professionalRegisterNumber: initialProfile.professionalRegisterNumber,
      diagnosisStatus: initialProfile.diagnosisStatus || "nao_informado",
      supportLevel: initialProfile.supportLevel || "nao_especificado",
      currentFocus: "geral",
      emergencyContacts: [],
      lowStimulationMode: false,
      caregiverMode: false,
      notificationsEnabled: true,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      isGuest: false,
      isSuperAdmin: isSuper,
      hiddenModules: [],
    };

    const localUser: User = {
      id: userId,
      app_metadata: { provider: "local_offline" },
      user_metadata: {
        preferred_name: preferredName,
        user_role: userRole,
      },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: cleanEmail,
    } as any;

    setUser(localUser);
    setUserProfile(profile);
    setIsOfflineMode(true);
    setIsLoading(false);

    localStorage.setItem(`neuroconecta_profile_${userId}`, JSON.stringify(profile));
    localStorage.setItem("neuroconecta_active_user_id", userId);
    localStorage.setItem("neuroconecta_user_profile", JSON.stringify(profile));

    await auditService.log({
      actorUserId: userId,
      action: "PROFILE_CREATED",
      entityType: "profiles",
      entityId: userId,
      afterData: profile,
      source: "AuthContext.signUp (Contingência Local Offline)",
    });

    return { user: localUser, isOfflineFallback: true };
  };

  // Actions
  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const isSuper = checkIsSuperAdmin(cleanEmail);

    try {
      const signInPromise = supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      // Guard with timeout so the user never hangs indefinitely
      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error("NetworkError when attempting to fetch resource.")), 3500)
      );

      const res: any = await Promise.race([signInPromise, timeoutPromise]);
      const { data, error } = res;

      if (error) {
        if (isNetworkOrDnsError(error)) {
          return await executeOfflineSignIn(cleanEmail, isSuper);
        }
        setIsLoading(false);
        return { error: error.message };
      }

      if (data?.user) {
        setIsOfflineMode(false);
        await auditService.log({
          actorUserId: data.user.id,
          action: "LOGIN_SUCCESS",
          entityType: "auth.users",
          entityId: data.user.id,
          source: "AuthContext.signIn",
        });
        return { user: data.user };
      }

      return await executeOfflineSignIn(cleanEmail, isSuper);
    } catch (err: any) {
      if (isNetworkOrDnsError(err)) {
        return await executeOfflineSignIn(cleanEmail, isSuper);
      }
      setIsLoading(false);
      return { error: err.message || "Erro ao conectar." };
    }
  };

  const signUp = async (email: string, pass: string, initialProfile: Partial<UserProfile>) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const isSuper = checkIsSuperAdmin(cleanEmail, initialProfile.userRole);

    try {
      const signUpPromise = supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            preferred_name: initialProfile.preferredName,
            user_role: isSuper ? "superadmin" : (initialProfile.userRole || "pcd"),
            diagnosis_status: initialProfile.diagnosisStatus || "nao_informado",
            support_level: initialProfile.supportLevel || "nao_especificado",
          },
        },
      });

      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error("NetworkError when attempting to fetch resource.")), 3500)
      );

      const res: any = await Promise.race([signUpPromise, timeoutPromise]);
      const { data, error } = res;

      if (error) {
        if (isNetworkOrDnsError(error)) {
          return await executeOfflineSignUp(cleanEmail, isSuper, initialProfile);
        }
        setIsLoading(false);
        return { error: error.message };
      }

      if (data?.user) {
        setIsOfflineMode(false);
        await auditService.log({
          actorUserId: data.user.id,
          action: "LOGIN_SUCCESS",
          entityType: "auth.users",
          entityId: data.user.id,
          source: "AuthContext.signUp",
        });
        return { user: data.user };
      }

      return await executeOfflineSignUp(cleanEmail, isSuper, initialProfile);
    } catch (err: any) {
      if (isNetworkOrDnsError(err)) {
        return await executeOfflineSignUp(cleanEmail, isSuper, initialProfile);
      }
      setIsLoading(false);
      return { error: err.message || "Erro ao cadastrar usuário." };
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const redirectOrigin = window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectOrigin,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      return {};
    } catch (err: any) {
      setIsLoading(false);
      return { error: err?.message || "Falha ao iniciar autenticação com Google." };
    }
  };

  const signInLocal = async (email: string, name?: string, role?: UserRole) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const isSuper = checkIsSuperAdmin(cleanEmail, role);
    return await executeOfflineSignUp(cleanEmail, isSuper, {
      preferredName: name || cleanEmail.split("@")[0],
      userRole: isSuper ? "superadmin" : (role || "pcd"),
    });
  };

  const signOut = async () => {
    const currentId = user?.id;
    if (currentId) {
      await auditService.log({
        actorUserId: currentId,
        action: "LOGOUT",
        entityType: "auth.users",
        entityId: currentId,
        source: "AuthContext.signOut",
      });
      // Expulgo rigoroso de rascunhos clínicos locais e cache volátil ao deslogar
      musicotherapyService.clearUserSessionData(currentId);
    }

    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Aviso ao deslogar:", e);
    }

    setUser(null);
    setUserProfile(defaultGuestProfile);
    setIsOfflineMode(false);
    localStorage.removeItem("neuroconecta_active_user_id");
  };

  const updateProfile = async (partial: Partial<UserProfile>) => {
    if (!user) {
      // Offline guest update
      setUserProfile((prev) => ({ ...prev, ...partial }));
      return {};
    }

    const before = { ...userProfile };
    const updated: UserProfile = {
      ...userProfile,
      ...partial,
      id: user.id,
      email: user.email,
    };

    setUserProfile(updated);
    localStorage.setItem(`neuroconecta_profile_${user.id}`, JSON.stringify(updated));
    localStorage.setItem("neuroconecta_user_profile", JSON.stringify(updated));

    try {
      const remotePayload = {
        id: user.id,
        preferred_name: updated.preferredName,
        pronouns: updated.pronouns,
        birth_date: updated.birthDate,
        user_role: updated.userRole,
        professional_role_type: updated.professionalRoleType,
        professional_register_number: updated.professionalRegisterNumber,
        diagnosis_status: updated.diagnosisStatus,
        support_level: updated.supportLevel,
        current_focus: updated.currentFocus,
        emergency_contacts: updated.emergencyContacts,
        low_stimulation_mode: updated.lowStimulationMode,
        caregiver_mode: updated.caregiverMode,
        notifications_enabled: updated.notificationsEnabled,
        hidden_modules: updated.hiddenModules,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(remotePayload, { onConflict: "id" });

      if (!error) {
        await auditService.log({
          actorUserId: user.id,
          action: "PROFILE_UPDATED",
          entityType: "profiles",
          entityId: user.id,
          beforeData: before,
          afterData: remotePayload,
          source: "AuthContext.updateProfile",
        });
      }

      return {};
    } catch (err: any) {
      console.warn("Aviso ao sincronizar perfil remoto (mantido íntegro no navegador):", err);
      return {};
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await handleSession(session);
    } catch {
      // Offline mode maintained
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    canonicalUserId: user?.id || null,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin: userProfile.isSuperAdmin || checkIsSuperAdmin(user?.email, userProfile.userRole),
    isOfflineMode,
    signIn,
    signUp,
    signInWithGoogle,
    signInLocal,
    signOut,
    updateProfile,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useCurrentUser = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useCurrentUser deve ser utilizado dentro de um AuthProvider");
  }
  return context;
};

export const useAuth = useCurrentUser;
