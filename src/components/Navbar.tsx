import React, { useState, useRef, useEffect } from "react";
import neuroconectaLogo from "../assets/logo";
import { 
  Menu, 
  PanelLeftClose, 
  PanelLeftOpen, 
  ShieldAlert, 
  Moon, 
  Sun, 
  User, 
  Lock, 
  LogOut, 
  LogIn, 
  Share2, 
  FileText, 
  Settings, 
  CheckCircle2, 
  CloudCheck,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Activity,
  Clock
} from "lucide-react";
import { UserProfile } from "../types";
import { useCurrentUser } from "../contexts/AuthContext";
import { useFocusTimer } from "../hooks/useFocusTimer";

export type NavTab = 
  | "chat" 
  | "musicoterapia" 
  | "jogos" 
  | "testes" 
  | "rotina" 
  | "agenda" 
  | "sensorial" 
  | "humor" 
  | "comunicacao" 
  | "relatorio" 
  | "cuidador" 
  | "educacao" 
  | "caps" 
  | "rh" 
  | "supabase" 
  | "scripts"
  | "momento"
  | "atividade"
  | "aprendizagem";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  userProfile: UserProfile;
  onOpenCrisis: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  toggleLowStimMode: () => void;
  hiddenModules?: string[];
  onOpenModuleAdmin?: () => void;
  onOpenShareManager?: () => void;
  onOpenFunctionalPlan?: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleMobileMenu: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; category: string }> = {
  chat: { title: "Assistente IA (Copiloto)", category: "Comunicação & Apoio" },
  rotina: { title: "Rotina Visual", category: "Meu Dia a Dia" },
  humor: { title: "Diário & Humor", category: "Meu Dia a Dia" },
  momento: { title: "Avaliação do Momento", category: "Meu Dia a Dia" },
  musicoterapia: { title: "Musicoterapia Clínica", category: "Clínico & Especialistas" },
  sensorial: { title: "Regulação Sensorial", category: "Meu Dia a Dia" },
  jogos: { title: "Jogos & Relaxamento", category: "Meu Dia a Dia" },
  agenda: { title: "Agenda & Medicamentos", category: "Meu Dia a Dia" },
  comunicacao: { title: "Comunicação AAC", category: "Comunicação & Apoio" },
  atividade: { title: "Planejador de Atividades", category: "Comunicação & Apoio" },
  educacao: { title: "Histórias & Roteiros", category: "Comunicação & Apoio" },
  cuidador: { title: "Cuidadores & Família", category: "Comunicação & Apoio" },
  testes: { title: "Centro de Testes", category: "Avaliações & Métricas" },
  aprendizagem: { title: "Perfil de Aprendizagem", category: "Avaliações & Métricas" },
  relatorio: { title: "Relatórios Funcionais", category: "Avaliações & Métricas" },
  supabase: { title: "Supabase DB & Auditoria", category: "Administração & Dados" },
  scripts: { title: "Central de Scripts", category: "Administração & Dados" },
  caps: { title: "Saúde CAPS (Congelado)", category: "Geral" },
  rh: { title: "RH & NR-1 (Congelado)", category: "Geral" },
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  onOpenCrisis,
  onOpenProfile,
  onOpenAuth,
  toggleLowStimMode,
  hiddenModules = [],
  onOpenModuleAdmin,
  onOpenShareManager,
  onOpenFunctionalPlan,
  isSidebarCollapsed,
  onToggleSidebar,
  onToggleMobileMenu,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, isSuperAdmin, signOut } = useCurrentUser();
  const { timerState, formatTime } = useFocusTimer();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentTabInfo = TAB_TITLES[activeTab] || { title: "NeuroConecta", category: "Módulo" };

  const getRoleBadge = () => {
    if (isSuperAdmin) {
      return {
        label: "Superadmin TI",
        classes: "bg-cyan-950 text-cyan-300 border-cyan-700",
      };
    }
    if (userProfile.userRole === "profissional_apoio") {
      return {
        label: "Profissional de Apoio",
        classes: "bg-indigo-950 text-indigo-300 border-indigo-700",
      };
    }
    if (userProfile.userRole === "cuidador_educador" || userProfile.professionalRoleType === "educador") {
      return {
        label: "Educador(a) / AEE",
        classes: "bg-amber-950 text-amber-300 border-amber-700",
      };
    }
    if (userProfile.userRole === "cuidador_familiar") {
      return {
        label: "Familiar / Cuidador",
        classes: "bg-emerald-950 text-emerald-300 border-emerald-700",
      };
    }
    return {
      label: "PCD Neurodivergente",
      classes: "bg-purple-950 text-purple-300 border-purple-700",
    };
  };

  const roleBadge = getRoleBadge();

  return (
    <header className="sticky top-0 z-50 h-16 bg-slate-900/98 border-b border-slate-800 backdrop-blur-md transition-all text-slate-100 flex items-center px-3 sm:px-5 justify-between">
      
      {/* Left Area: Navigation Controls & Brand Identity */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition active:scale-95"
          aria-label="Abrir menu de navegação"
          title="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition active:scale-95"
          aria-label={isSidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          title={isSidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-teal-400" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Brand & Institutional Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => setActiveTab("chat")}
          title="Voltar ao Copiloto IA"
        >
          <div className="p-1 bg-white rounded-xl border border-teal-200 shadow-sm shrink-0 group-hover:scale-105 transition">
            <img 
              src={neuroconectaLogo} 
              alt="NeuroConecta Logo" 
              className="w-8 h-8 object-contain aspect-square"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-teal-200 via-emerald-300 to-cyan-200 bg-clip-text text-transparent">
                NeuroConecta
              </span>
              <span className="hidden sm:inline-flex text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800 font-extrabold tracking-wider">
                SISTEMASTOP
              </span>
            </div>
            <span className="hidden md:block text-[10px] text-slate-400 truncate max-w-[180px]">
              Tecnologia Neuroafirmativa
            </span>
          </div>
        </div>

        {/* Contextual Module Breadcrumb Badge (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs">
          <span className="text-slate-400">{currentTabInfo.category}</span>
          <span className="text-slate-400">/</span>
          <span className="font-bold text-teal-300">{currentTabInfo.title}</span>
        </div>
      </div>

      {/* Right Area: Status, SOS Crisis, Actions & Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* Active Persistent Focus Timer Widget */}
        {timerState.isRunning && (
          <button
            onClick={() => setActiveTab("rotina")}
            title="Cronômetro Ativo — Clique para retornar à Rotina Visual"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-700/80 text-amber-300 hover:bg-amber-900/90 text-xs font-mono font-bold transition shadow-sm animate-pulse"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{formatTime(timerState.remainingSeconds)}</span>
            <span className="hidden sm:inline text-[10px] uppercase font-sans text-amber-300/80 font-bold">
              {timerState.mode === "foco" ? "Foco" : "Pausa"}
            </span>
          </button>
        )}

        {/* Supabase Identity & Sync Badge */}
        <div 
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] font-medium"
          title={
            isAuthenticated 
              ? `Autenticado no Supabase com ID persistente: ${user?.id || userProfile.id}` 
              : "Sessão local em execução. Conecte sua conta para sincronização segura na nuvem."
          }
        >
          {isAuthenticated ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
              <span className="text-emerald-300 font-semibold">Supabase Nuvem</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-400">Sessão Local</span>
            </>
          )}
        </div>

        {/* SOS Crisis Button */}
        <button
          onClick={onOpenCrisis}
          className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-950/40 flex items-center gap-1.5 transition active:scale-95"
          title="Apoio imediato em sobrecarga ou meltdown"
        >
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span className="font-bold">SOS Crise</span>
        </button>

        {/* Low-Stimulation Theme Mode Toggle */}
        <button
          onClick={toggleLowStimMode}
          className={`p-2 rounded-xl border transition active:scale-95 ${
            userProfile.lowStimulationMode
              ? "bg-teal-950 text-teal-300 border-teal-700 shadow-inner"
              : "bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700"
          }`}
          title={userProfile.lowStimulationMode ? "Modo Baixa Estimulação Ativo (Desativar)" : "Ativar Modo de Baixa Estimulação"}
          aria-label="Alternar modo de estimulação visual"
        >
          {userProfile.lowStimulationMode ? (
            <Moon className="w-4 h-4 text-teal-300" />
          ) : (
            <Sun className="w-4 h-4 text-slate-300" />
          )}
        </button>

        {/* User Account / Overflow Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition ${
              isUserMenuOpen
                ? "bg-slate-800 border-teal-500 text-white"
                : "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200"
            }`}
            title="Menu do Usuário & Ações Rápidas"
          >
            <div className="w-6 h-6 rounded-lg bg-teal-900/60 border border-teal-600/50 flex items-center justify-center text-teal-300 font-bold text-xs">
              {(userProfile.preferredName || "U").charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline max-w-[110px] truncate text-left">
              {userProfile.preferredName || "Usuário"}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Clean Dropdown Popover */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn text-slate-200 space-y-1">
              
              {/* User Identity Header Card */}
              <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 mb-2">
                <p className="text-xs font-bold text-slate-100 truncate">
                  {userProfile.preferredName || "Visitante"}
                </p>
                <p className="text-[11px] text-slate-400 truncate mb-1.5">
                  {user?.email || userProfile.email || "Sem e-mail vinculado"}
                </p>
                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadge.classes}`}>
                  {roleBadge.label}
                </span>
              </div>

              {/* Action 1: User Profile Settings */}
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenProfile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <User className="w-4 h-4 text-teal-400" />
                <span>Meu Perfil & Preferências</span>
              </button>

              {/* Action 2: Functional Support Plan */}
              {onOpenFunctionalPlan && (
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenFunctionalPlan();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Plano Individual Funcional</span>
                </button>
              )}

              {/* Action 3: Share Grants & Privacy */}
              {onOpenShareManager && (
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenShareManager();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>Privacidade & Compartilhamento</span>
                </button>
              )}

              {/* Action 4: SuperAdmin Module Visibility */}
              {isSuperAdmin && onOpenModuleAdmin && (
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenModuleAdmin();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl text-cyan-300 hover:text-white hover:bg-cyan-950/70 border border-cyan-900/60 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-cyan-400" />
                    <span>Gerenciar Visibilidade de Módulos</span>
                  </div>
                  {hiddenModules.length > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] bg-rose-950 text-rose-300 border border-rose-800 rounded-full font-black">
                      {hiddenModules.length}
                    </span>
                  )}
                </button>
              )}

              <div className="border-t border-slate-800 my-1" />

              {/* Action 5: Auth Login / Logout */}
              {isAuthenticated ? (
                <button
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await signOut();
                    setActiveTab("chat");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-rose-300 hover:text-rose-100 hover:bg-rose-950/60 transition"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Desconectar Sessão</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-teal-300 hover:text-teal-100 hover:bg-teal-950/70 border border-teal-800/80 transition shadow-sm"
                >
                  <LogIn className="w-4 h-4 text-teal-400" />
                  <span>Entrar / Criar Conta Supabase</span>
                </button>
              )}

            </div>
          )}
        </div>

      </div>

    </header>
  );
};
