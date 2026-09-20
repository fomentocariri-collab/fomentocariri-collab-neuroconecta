import React, { useState } from "react";
import { LogIn, UserPlus, ShieldCheck, Lock, Mail, User, CheckCircle2, AlertCircle, Sparkles, Key, LogOut, X, Calendar } from "lucide-react";
import { UserProfile, UserRole, ProfessionalRoleType, getAgeCategory, calculateAge } from "../types";
import { useCurrentUser } from "../contexts/AuthContext";
import neuroconectaLogo from "../assets/logo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
  isDark?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  isDark = true,
}) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [userRole, setUserRole] = useState<UserRole>("profissional");
  const [professionalRoleType, setProfessionalRoleType] = useState<ProfessionalRoleType>("medico");
  const [professionalRegisterNumber, setProfessionalRegisterNumber] = useState("");
  const [diagnosisStatus, setDiagnosisStatus] = useState("nao_informado");
  const [lgpdConsent, setLgpdConsent] = useState(true);
  
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useCurrentUser();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res?.error) {
        setErrorMessage(res.error);
        setGoogleLoading(false);
      } else {
        setSuccessMessage("Redirecionando com segurança para o Google Gmail...");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Não foi possível conectar ao Google no momento.");
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim()) {
      setErrorMessage("Por favor, informe seu nome ou apelido preferido.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Por favor, informe um e-mail válido.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("A confirmação de senha não confere com a senha digitada.");
      return;
    }
    if (!lgpdConsent) {
      setErrorMessage("Para sua segurança (LGPD), você precisa concordar com o isolamento dos seus dados.");
      return;
    }

    setLoading(true);

    try {
      const isSuperAdminRequested = userRole === "superadmin";

      const res = await signUp(email, password, {
        preferredName: name.trim(),
        userRole: isSuperAdminRequested ? "superadmin" : userRole,
        professionalRoleType: isSuperAdminRequested ? "medico" : professionalRoleType,
        professionalRegisterNumber: professionalRegisterNumber.trim() || undefined,
        diagnosisStatus: diagnosisStatus as any,
        birthDate: birthDate,
      });

      if (res.error) {
        setErrorMessage(res.error);
        setLoading(false);
        return;
      }

      if (res.isOfflineFallback) {
        setSuccessMessage("Conta criada em Modo Local Seguro! Seus dados e preferências estão salvos neste dispositivo.");
      } else {
        setSuccessMessage("Conta criada com sucesso no Supabase! Sessão canônica ativa.");
      }

      setTimeout(() => {
        if (res.user) {
          onLoginSuccess({
            id: res.user.id,
            email: res.user.email,
            preferredName: name.trim(),
            pronouns: "não informado",
            birthDate: birthDate,
            userRole: isSuperAdminRequested ? "superadmin" : userRole,
            professionalRoleType: isSuperAdminRequested ? "medico" : professionalRoleType,
            professionalRegisterNumber: professionalRegisterNumber.trim() || undefined,
            diagnosisStatus: diagnosisStatus as any,
            supportLevel: "nao_especificado",
            currentFocus: "geral",
            emergencyContacts: [],
            lowStimulationMode: false,
            onboardingCompleted: true,
            isGuest: false,
            isSuperAdmin: isSuperAdminRequested || Boolean(res.user.user_metadata?.is_super_admin),
          });
        }
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err?.message || "Ocorreu um erro ao criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Preencha o e-mail e a senha para entrar.");
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await signIn(cleanEmail, password);

      if (res.error) {
        setErrorMessage(res.error);
        setLoading(false);
        return;
      }

      if (res.isOfflineFallback) {
        setSuccessMessage("Entrando em Modo Local Seguro (Nuvem offline - seus dados e perfil permanecem protegidos neste dispositivo).");
      } else {
        setSuccessMessage("Autenticado com sucesso via Supabase Auth!");
      }

      setTimeout(() => {
        if (res.user) {
          onLoginSuccess({
            id: res.user.id,
            email: res.user.email,
            preferredName: res.user.user_metadata?.preferred_name || cleanEmail.split("@")[0],
            pronouns: "não informado",
            diagnosisStatus: "nao_informado",
            supportLevel: "nao_especificado",
            currentFocus: "geral",
            emergencyContacts: [],
            lowStimulationMode: false,
            onboardingCompleted: true,
            isGuest: false,
          });
        }
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage("Erro ao efetuar login no Supabase. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn transition-colors">
      <div className={`border rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden transition ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        
        {/* Header with White Logo Box */}
        <div className={`flex-shrink-0 p-4 sm:p-5 border-b flex items-center justify-between backdrop-blur transition ${
          isDark ? "bg-slate-900/95 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white border border-teal-200 rounded-2xl shadow-sm shrink-0">
              <img 
                src={neuroconectaLogo} 
                alt="Logo NeuroConecta" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain aspect-square"
              />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-extrabold leading-tight ${
                isDark ? "text-slate-100" : "text-slate-900"
              }`}>
                Acesso Individual & LGPD
              </h2>
              <p className={`text-[11px] sm:text-xs font-medium ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}>
                NeuroConecta • Conexões que acolhem e transformam
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition text-sm font-bold ${
              isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Current Active Account Card */}
          {currentUser && (
            <div className={`p-3 border rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs ${
              isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="space-y-0.5 min-w-0">
                <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>Conectado atualmente como:</p>
                <p className={`font-bold flex items-center gap-1.5 truncate ${
                  isDark ? "text-teal-300" : "text-teal-700"
                }`}>
                  <User className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{currentUser.preferredName} ({currentUser.email || "Sessão Local"})</span>
                </p>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setSuccessMessage("Você saiu da conta atual.");
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center gap-1 transition text-xs shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" /> Sair
              </button>
            </div>
          )}

          {/* Quick Access with Google Gmail */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2.5 transition border shadow-sm ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700"
                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-300"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? "Conectando ao Google..." : "Entrar com Google Gmail"}</span>
            </button>
            <p className={`text-[10px] text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Sessão segura salva no dispositivo. Seus dados e cadastros abrem sincronizados em qualquer tela ou aparelho.
            </p>
          </div>

          <div className="flex items-center gap-2 my-2">
            <div className={`flex-1 h-px ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              ou via credenciais
            </span>
            <div className={`flex-1 h-px ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
          </div>

          {/* Auth Mode Tabs */}
          <div className={`grid grid-cols-2 gap-2 p-1 rounded-2xl border text-xs font-bold ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
          }`}>
            <button
              onClick={() => { setMode("login"); setErrorMessage(""); }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                mode === "login"
                  ? "bg-teal-600 text-white shadow"
                  : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Entrar na Conta
            </button>
            <button
              onClick={() => { setMode("register"); setErrorMessage(""); }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                mode === "register"
                  ? "bg-teal-600 text-white shadow"
                  : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Criar Conta
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className={`p-3 border rounded-xl text-xs flex items-center gap-2 ${
              isDark ? "bg-rose-950/60 border-rose-800 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-800"
            }`}>
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className={`p-3 border rounded-xl text-xs flex items-center gap-2 ${
              isDark ? "bg-emerald-950/60 border-emerald-800 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <label className={`text-xs font-semibold flex items-center gap-1 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}>
                  <Mail className="w-3.5 h-3.5 text-teal-500" /> E-mail de Acesso
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className={`w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                    isDark ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-semibold flex items-center gap-1 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}>
                  <Lock className="w-3.5 h-3.5 text-teal-500" /> Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                    isDark ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                {loading ? "Verificando..." : "Entrar com Senha"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-semibold flex items-center gap-1 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}>
                    <User className="w-3.5 h-3.5 text-teal-500" /> Nome / Apelido
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como prefere ser chamado(a)"
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                      isDark ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-semibold flex items-center justify-between ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-500" /> Data de Nascimento
                    </span>
                    <span className="text-[10px] font-bold text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-800">
                      {getAgeCategory(birthDate)} ({calculateAge(birthDate) !== null ? `${calculateAge(birthDate)} anos` : "N/A"})
                    </span>
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                      isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-semibold flex items-center gap-1 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}>
                    <Mail className="w-3.5 h-3.5 text-teal-500" /> Seu E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                      isDark ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-semibold flex items-center gap-1 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}>
                    <Lock className="w-3.5 h-3.5 text-teal-500" /> Criar Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                      isDark ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-semibold flex items-center gap-1 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}>
                    <Lock className="w-3.5 h-3.5 text-teal-500" /> Confirmar Senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita sua senha"
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                      isDark ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className={`text-xs font-semibold flex items-center gap-1 ${
                    isDark ? "text-teal-300" : "text-teal-700"
                  }`}>
                    <Sparkles className="w-3.5 h-3.5 text-teal-500" /> Perfil Módulo de Acesso
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => {
                      const newRole = e.target.value as any;
                      setUserRole(newRole);
                      if (newRole === "cuidador_educador" || newRole === "educador_aee") setProfessionalRoleType("educador");
                      else if (newRole === "profissional_apoio") setProfessionalRoleType("terapeuta");
                      else setProfessionalRoleType("pcd");
                    }}
                    className={`w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 truncate transition ${
                      isDark ? "bg-slate-950 border-teal-800/80 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="pcd" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}>🧩 Pessoa / Usuário(a) (Autonomia, rotinas e autorregulação)</option>
                    <option value="cuidador_familiar" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}>🏡 Família / Cuidador(a) (Apoio compartilhado e diário)</option>
                    <option value="cuidador_educador" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}>🎓 Educador(a) / Escola / AEE (Acomodações DUA e PEI)</option>
                    <option value="profissional_apoio" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}>🤝 Profissional de Apoio (Terapia, Psicologia e Apoio Funcional)</option>
                    <option value="superadmin" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}>⚡ Administrador(a) do Sistema (Gestão técnica)</option>
                  </select>
                </div>

                {/* Sub-role and Professional Registration Number */}
                {userRole === "profissional_apoio" && (
                  <>
                    <div className="space-y-1">
                      <label className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        Área de Atuação
                      </label>
                      <select
                        value={professionalRoleType}
                        onChange={(e) => setProfessionalRoleType(e.target.value as any)}
                        className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                        }`}
                      >
                        <option value="terapeuta">Terapeuta Ocupacional / Fonoaudiólogo(a)</option>
                        <option value="psicologo">Psicólogo(a) / Neuropsicólogo(a)</option>
                        <option value="educador">Psicopedagogo(a) / Especialista em Inclusão</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        Registro no Conselho Profissional
                      </label>
                      <input
                        type="text"
                        value={professionalRegisterNumber}
                        onChange={(e) => setProfessionalRegisterNumber(e.target.value)}
                        placeholder="Ex: CREFITO, CRP, CRFa, etc."
                        className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>
                  </>
                )}

                {(userRole === "cuidador_educador" || (userRole as string) === "educador_aee") && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      Instituição Escolar / Registro de Docência
                    </label>
                    <input
                      type="text"
                      value={professionalRegisterNumber}
                      onChange={(e) => setProfessionalRegisterNumber(e.target.value)}
                      placeholder="Ex: Matrícula Escolar ou Registro Docente"
                      className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                        isDark ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>
                )}

                {userRole === "pcd" && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      Carteira CIPTEA / Cartão BPC (Opcional)
                    </label>
                    <input
                      type="text"
                      value={professionalRegisterNumber}
                      onChange={(e) => setProfessionalRegisterNumber(e.target.value)}
                      placeholder="Ex: CIPTEA-CE 2026/001 ou NB BPC 123.456"
                      className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                        isDark ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>
                )}

                <div className="space-y-1 sm:col-span-2">
                  <label className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Situação Diagnóstica
                  </label>
                  <select
                    value={diagnosisStatus}
                    onChange={(e) => setDiagnosisStatus(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 truncate transition ${
                      isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="laudo_formal" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}>Possuo laudo formal confirmado</option>
                    <option value="investigacao" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}>Em processo de investigação</option>
                    <option value="autodiagnosticado" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}>Autodiagnosticado / Identificação</option>
                    <option value="familiar_apoiador" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}>Familiar / Cuidador</option>
                    <option value="nao_informado" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}>Prefiro não informar</option>
                  </select>
                </div>
              </div>

              {/* LGPD Checkbox */}
              <div className="pt-1 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="lgpd"
                  checked={lgpdConsent}
                  onChange={(e) => setLgpdConsent(e.target.checked)}
                  className="mt-0.5 rounded border-slate-400 bg-slate-100 dark:bg-slate-950 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="lgpd" className={`text-[11px] leading-snug cursor-pointer ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}>
                  Concordo com o tratamento seguro dos meus dados no meu espaço exclusivo, em conformidade com a <strong>LGPD (Lei Geral de Proteção de Dados)</strong>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                {loading ? "Criando Conta..." : "Criar Minha Conta Segura"}
              </button>
            </form>
          )}

        </div>

        {/* Sticky Footer */}
        <div className={`flex-shrink-0 p-3 sm:px-5 border-t text-[11px] text-center leading-relaxed rounded-b-3xl ${
          isDark ? "bg-slate-950/90 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
        }`}>
          🔒 Seus testes, rotinas, registros de humor e notas de atendimento não são expostos nem compartilhados com outros visitantes.
        </div>

      </div>
    </div>
  );
};
