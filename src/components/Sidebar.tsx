import React, { useEffect, useState } from "react";
import { 
  Bot, 
  CalendarCheck, 
  HeartPulse, 
  Headphones, 
  Waves, 
  Gamepad2, 
  Pill, 
  MessageSquare, 
  BookOpen, 
  GraduationCap, 
  ClipboardCheck, 
  FileText, 
  Database, 
  Terminal, 
  Activity, 
  Layers, 
  Brain,
  ChevronLeft,
  ChevronRight,
  X,
  EyeOff,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { UserProfile } from "../types";
import { NavTab } from "./Navbar";

export interface NavGroup {
  title: string;
  items: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    description: string;
    roles?: string[];
    adminOnly?: boolean;
    badge?: string;
  }[];
}

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  userProfile: UserProfile;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  hiddenModules?: string[];
  isDark?: boolean;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Meu Dia a Dia",
    items: [
      {
        id: "rotina",
        label: "Rotina Visual",
        icon: CalendarCheck,
        description: "Planejamento previsível e sequencial de tarefas diárias",
      },
      {
        id: "humor",
        label: "Diário & Humor",
        icon: HeartPulse,
        description: "Registro seguro de energia, sobrecarga e bem-estar",
      },
      {
        id: "momento",
        label: "Avaliação do Momento",
        icon: Activity,
        description: "Diagnóstico situacional rápido de regulação e energia",
      },
      {
        id: "musicoterapia",
        label: "Musicoterapia Clínica",
        icon: Headphones,
        description: "Protocolos acústicos e evolução de musicoterapia estruturada",
        badge: "Especialistas",
        roles: ["profissional_apoio", "saude_caps", "cuidador_educador", "educador_aee", "superadmin"],
      },
      {
        id: "sensorial",
        label: "Regulação Sensorial",
        icon: Waves,
        description: "Ambientes visuais e sonoros de baixa estimulação",
      },
      {
        id: "jogos",
        label: "Jogos & Relaxamento",
        icon: Gamepad2,
        description: "Atividades lúdicas anti-estresse e foco suave",
      },
      {
        id: "agenda",
        label: "Agenda & Medicamentos",
        icon: Pill,
        description: "Lembretes pontuais de consultas e medicação",
      },
    ],
  },
  {
    title: "Comunicação & Apoio",
    items: [
      {
        id: "chat",
        label: "Assistente IA (Copiloto)",
        icon: Bot,
        description: "Apoio especializado e conversacional neuroafirmativo",
      },
      {
        id: "comunicacao",
        label: "Comunicação AAC",
        icon: MessageSquare,
        description: "Cartões visuais e prancha alternativa de comunicação",
      },
      {
        id: "atividade",
        label: "Planejador de Atividades",
        icon: Layers,
        description: "Adaptação curricular e planejamento estruturado",
      },
      {
        id: "educacao",
        label: "Histórias & Roteiros",
        icon: BookOpen,
        description: "Histórias sociais, scripts de previsibilidade e biblioteca",
        roles: ["cuidador_educador", "saude_caps", "superadmin", "pcd"],
      },
      {
        id: "cuidador",
        label: "Cuidadores & Família",
        icon: GraduationCap,
        description: "Rede de apoio, rotinas compartilhadas e diário familiar",
        roles: ["cuidador_familiar", "cuidador_educador", "saude_caps", "superadmin"],
      },
    ],
  },
  {
    title: "Avaliações & Métricas",
    items: [
      {
        id: "testes",
        label: "Centro de Testes",
        icon: ClipboardCheck,
        description: "Escalas validadas de autoavaliação (AQ-10, CAT-Q, Sensorial)",
      },
      {
        id: "aprendizagem",
        label: "Perfil de Aprendizagem",
        icon: Brain,
        description: "Mapeamento funcional de barreiras e preferências",
      },
      {
        id: "relatorio",
        label: "Relatórios Funcionais",
        icon: FileText,
        description: "Sínteses técnicas estruturadas prontas para PDF e impressão",
      },
    ],
  },
  {
    title: "Administração & Dados",
    items: [
      {
        id: "supabase",
        label: "Supabase & Auditoria",
        icon: Database,
        description: "Auditoria contínua de eventos, RLS e sincronização",
        adminOnly: true,
        roles: ["superadmin"],
      },
      {
        id: "scripts",
        label: "Central de Scripts",
        icon: Terminal,
        description: "Scripts de automação, validação e governança",
        adminOnly: true,
        roles: ["superadmin"],
      },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  hiddenModules = [],
  isDark = true,
}) => {
  const isSuperAdmin = 
    Boolean(userProfile.isSuperAdmin || userProfile.userRole === "superadmin");

  const userRole = userProfile.userRole || "pcd";

  const handleSelectTab = (id: NavTab) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    try {
      localStorage.setItem("neuroconecta_sidebar_collapsed", String(nextState));
    } catch (e) {
      console.error(e);
    }
  };

  // Filter groups and items
  const filteredGroups = NAV_GROUPS.map((group) => {
    const visibleItems = group.items.filter((item) => {
      if (item.adminOnly && !isSuperAdmin) return false;
      if (!isSuperAdmin && hiddenModules.includes(item.id)) return false;
      if (item.roles && !isSuperAdmin) {
        const hasAccess = 
          item.roles.includes(userRole) ||
          (!!userProfile.professionalRoleType && item.roles.includes("profissional_apoio")) ||
          (userProfile.caregiverMode && item.roles.includes("cuidador_familiar"));
        if (!hasAccess) return false;
      }
      return true;
    });
    return { ...group, items: visibleItems };
  }).filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 transition-all duration-300 ease-in-out border-r flex flex-col ${
          isDark 
            ? "bg-slate-900/98 border-slate-800/90 text-slate-200" 
            : "bg-white/98 border-slate-200 text-slate-800"
        } ${
          // Mobile state
          isMobileOpen 
            ? "translate-x-0 w-72 shadow-2xl" 
            : "-translate-x-full lg:translate-x-0"
        } ${
          // Desktop width state
          isCollapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        {/* Mobile Header Close */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Menu de Navegação
            </span>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-6 no-scrollbar">
          {filteredGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              {/* Group Title (hidden when collapsed on desktop) */}
              <div
                className={`px-3 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 transition-opacity duration-200 ${
                  isCollapsed ? "lg:hidden" : "block"
                }`}
              >
                {group.title}
              </div>

              {/* Items List */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isHidden = hiddenModules.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      title={isCollapsed ? `${item.label} — ${item.description}` : item.description}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                        isActive
                          ? isDark
                            ? "bg-teal-950/80 text-teal-200 border border-teal-700/80 shadow-sm"
                            : "bg-teal-50 text-teal-900 border border-teal-300 shadow-sm"
                          : isDark
                          ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                      } ${isCollapsed ? "lg:justify-center lg:px-0" : "justify-start"}`}
                    >
                      {/* Active Left Indicator Bar */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-teal-400 rounded-r-full shadow-sm" />
                      )}

                      {/* Icon */}
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105 ${
                          isActive 
                            ? "text-teal-400" 
                            : isDark ? "text-slate-400 group-hover:text-slate-200" : "text-slate-500 group-hover:text-slate-800"
                        }`}
                      />

                      {/* Label & Description (expanded view) */}
                      <span
                        className={`truncate text-left leading-tight transition-opacity duration-200 ${
                          isCollapsed ? "lg:hidden" : "block"
                        }`}
                      >
                        {item.label}
                      </span>

                      {/* Hidden Module Indicator for Admin */}
                      {isSuperAdmin && isHidden && (
                        <EyeOff 
                          className="w-3.5 h-3.5 text-rose-400 ml-auto flex-shrink-0" 
                          title="Módulo invisível para usuários padrão" 
                        />
                      )}

                      {/* Floating Tooltip for Desktop Collapsed State */}
                      {isCollapsed && (
                        <div className="hidden lg:group-hover:flex absolute left-full ml-2.5 z-50 px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-100 text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap items-center gap-2 pointer-events-none animate-fadeIn">
                          <span>{item.label}</span>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Collapse / Expand Footer Toggle */}
        <div className="hidden lg:flex p-3 border-t border-slate-800/80 items-center justify-between">
          <button
            onClick={toggleCollapse}
            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center transition ${
              isDark 
                ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800/80" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            } ${isCollapsed ? "justify-center" : "justify-between"}`}
            title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {!isCollapsed && (
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                Recolher Menu
              </span>
            )}
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-teal-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
