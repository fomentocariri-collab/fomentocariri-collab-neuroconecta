import React, { useState, useEffect } from "react";
import { Navbar, NavTab } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { ChatAssistant } from "./components/ChatAssistant";
import { MusicotherapyHub } from "./components/MusicotherapyHub";
import { StimmingGamesHub } from "./components/StimmingGamesHub";
import { TestCenter } from "./components/TestCenter";
import { RoutinePlanner } from "./components/RoutinePlanner";
import { AgendaAndMeds } from "./components/AgendaAndMeds";
import { SensoryHub } from "./components/SensoryHub";
import { MoodTracker } from "./components/MoodTracker";
import { MomentAssessment } from "./components/MomentAssessment";
import { CommunicationHub } from "./components/CommunicationHub";
import { AccessibleActivityPlanner } from "./components/AccessibleActivityPlanner";
import { FunctionalLearningProfile } from "./components/FunctionalLearningProfile";
import { ReportHub } from "./components/ReportHub";
import { SupabaseHub } from "./components/SupabaseHub";
import { ScriptsHub } from "./components/ScriptsHub";
import { CaregiverHub } from "./components/CaregiverHub";
import { EducationHub } from "./components/EducationHub";
import { CrisisModal } from "./components/CrisisModal";
import { UserProfileModal } from "./components/UserProfileModal";
import { AuthModal } from "./components/AuthModal";
import { FooterAndContact } from "./components/FooterAndContact";
import { SuperAdminModuleModal } from "./components/SuperAdminModuleModal";
import { LandingCoverScreen } from "./components/LandingCoverScreen";
import { ShareManagerModal } from "./components/ShareManagerModal";
import { FunctionalPlanModal } from "./components/FunctionalPlanModal";
import { EyeOff, Lock, ArrowLeft } from "lucide-react";
import { UserProfile } from "./types";
import { useCurrentUser } from "./contexts/AuthContext";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("chat");

  const { 
    userProfile, 
    user, 
    isAuthenticated, 
    isSuperAdmin, 
    updateProfile, 
    signOut,
    signInLocal,
  } = useCurrentUser();

  // Sidebar responsive & collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("neuroconecta_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isExploringAsGuest, setIsExploringAsGuest] = useState(false);

  // Protect against access to frozen modules (Caps and RH)
  useEffect(() => {
    if (activeTab === "rh" || activeTab === "caps") {
      setActiveTab("chat");
    }
  }, [activeTab]);

  // Modals state
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isModuleAdminOpen, setIsModuleAdminOpen] = useState(false);
  const [isShareManagerOpen, setIsShareManagerOpen] = useState(false);
  const [isFunctionalPlanOpen, setIsFunctionalPlanOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<{ prompt: string; role?: any } | null>(null);

  const handleNavigateToChat = (prompt?: string, role?: any) => {
    if (prompt) {
      setChatInitialPrompt({ prompt, role });
    }
    setActiveTab("chat");
  };

  // Hidden modules state for Superadmin control
  const [hiddenModules, setHiddenModules] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("neuroconecta_hidden_modules");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const handleToggleModule = (tabId: string) => {
    setHiddenModules((prev) => {
      const updated = prev.includes(tabId) ? prev.filter((id) => id !== tabId) : [...prev, tabId];
      try {
        localStorage.setItem("neuroconecta_hidden_modules", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleResetHiddenModules = () => {
    setHiddenModules([]);
    try {
      localStorage.setItem("neuroconecta_hidden_modules", JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
  };

  // Profile save handler (updates AuthContext, local storage, and Supabase public.profiles)
  const handleSaveProfile = async (updated: UserProfile) => {
    await updateProfile(updated);
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setIsAuthOpen(false);
    setIsExploringAsGuest(false);

    // Intuitively route user upon login
    if (profile.isSuperAdmin || profile.userRole === "superadmin") {
      setActiveTab("chat");
    } else if (profile.professionalRoleType === "educador" || profile.userRole === "cuidador_educador") {
      setActiveTab("educacao");
    } else {
      setActiveTab("chat");
    }
  };

  const handleLogout = async () => {
    await signOut();
    setIsExploringAsGuest(false);
    setActiveTab("chat");
  };

  const toggleLowStimMode = () => {
    handleSaveProfile({
      ...userProfile,
      lowStimulationMode: !userProfile.lowStimulationMode,
    });
  };

  // If user is not authenticated, show the clean Cover Screen with secure login/register
  if (!isAuthenticated && !isExploringAsGuest) {
    return (
      <>
        <LandingCoverScreen
          onOpenAuth={() => setIsAuthOpen(true)}
          isDark={userProfile.lowStimulationMode}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={userProfile}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          isDark={userProfile.lowStimulationMode}
        />
      </>
    );
  }

  const isCurrentTabHidden = !isSuperAdmin && hiddenModules.includes(activeTab);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 flex flex-col ${
        userProfile.lowStimulationMode
          ? "theme-dark bg-slate-950 text-slate-100"
          : "theme-light bg-slate-50 text-slate-900"
      }`}
    >
      {/* Top Header Bar */}
      <div className="no-print">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userProfile={userProfile}
          onOpenCrisis={() => setIsCrisisOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          toggleLowStimMode={toggleLowStimMode}
          hiddenModules={hiddenModules}
          onOpenModuleAdmin={() => setIsModuleAdminOpen(true)}
          onOpenShareManager={() => setIsShareManagerOpen(true)}
          onOpenFunctionalPlan={() => setIsFunctionalPlanOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => {
            const next = !isSidebarCollapsed;
            setIsSidebarCollapsed(next);
            try {
              localStorage.setItem("neuroconecta_sidebar_collapsed", String(next));
            } catch (e) {
              console.error(e);
            }
          }}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
        />
      </div>

      {/* Main Application Shell with Retractable Sidebar */}
      <div className="flex flex-1 relative">
        {/* Retractable Thematic Sidebar */}
        <div className="no-print">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userProfile={userProfile}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
            hiddenModules={hiddenModules}
            isDark={userProfile.lowStimulationMode}
          />
        </div>

        {/* Dynamic Main Content Container adjusting smoothly to sidebar width */}
        <main 
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0 ${
            isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
          }`}
        >
          {/* Guest Mode Indicator Notification (if user is exploring without Supabase account) */}
          {!isAuthenticated && isExploringAsGuest && (
            <div className="no-print mx-4 mt-3 p-3 bg-amber-950/80 border border-amber-700/80 rounded-2xl flex items-center justify-between text-amber-200 text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>
                  <strong>Modo de Exploração Ativo:</strong> Seus dados estão salvos localmente neste navegador. Para garantir persistência canônica e isolamento LGPD entre dispositivos, conecte sua conta.
                </span>
              </div>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition shadow shrink-0 ml-3"
              >
                Conectar Conta
              </button>
            </div>
          )}

          {/* Module View Content */}
          <div className="flex-1 p-3 sm:p-6">
            {isCurrentTabHidden ? (
              <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 text-slate-300 shadow-xl">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400">
                  <EyeOff className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Módulo Temporariamente Oculto</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Este módulo foi pausado ou ocultado pelo Administrador do Sistema. Entre em contato com a gestão técnica para mais informações.
                </p>
                <button
                  onClick={() => setActiveTab("chat")}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition shadow"
                >
                  Voltar ao Assistente IA
                </button>
              </div>
            ) : (
              <>
                {/* Meu Dia a Dia */}
                {activeTab === "rotina" && <RoutinePlanner />}
                {activeTab === "humor" && (
                  <MoodTracker
                    isDark={userProfile.lowStimulationMode}
                    userProfile={userProfile}
                    onOpenShareModal={() => setIsShareManagerOpen(true)}
                  />
                )}
                {activeTab === "momento" && (
                  <MomentAssessment
                    onNavigateToChat={handleNavigateToChat}
                    onNavigateToSounds={() => setActiveTab("musicoterapia")}
                    onNavigateToTab={(tab) => setActiveTab(tab as NavTab)}
                    isDark={userProfile.lowStimulationMode}
                  />
                )}
                {activeTab === "musicoterapia" && (
                  <MusicotherapyHub isDark={userProfile.lowStimulationMode} />
                )}
                {activeTab === "sensorial" && (
                  <SensoryHub
                    isDark={userProfile.lowStimulationMode}
                    userProfile={userProfile}
                  />
                )}
                {activeTab === "jogos" && (
                  <StimmingGamesHub isDark={userProfile.lowStimulationMode} />
                )}
                {activeTab === "agenda" && (
                  <AgendaAndMeds isDark={userProfile.lowStimulationMode} />
                )}

                {/* Comunicação & Apoio */}
                {activeTab === "chat" && (
                  <ChatAssistant
                    userProfile={userProfile}
                    onUpdateProfile={handleSaveProfile}
                    onNavigateToTab={(tab) => setActiveTab(tab as NavTab)}
                    onOpenCrisis={() => setIsCrisisOpen(true)}
                    initialPrompt={chatInitialPrompt}
                    onClearInitialPrompt={() => setChatInitialPrompt(null)}
                  />
                )}
                {activeTab === "comunicacao" && <CommunicationHub />}
                {activeTab === "atividade" && (
                  <AccessibleActivityPlanner isDark={userProfile.lowStimulationMode} />
                )}
                {activeTab === "educacao" && (
                  (isSuperAdmin || userProfile.userRole === "cuidador_educador" || userProfile.professionalRoleType === "educador" || userProfile.userRole === "pcd") ? (
                    <EducationHub />
                  ) : (
                    <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3 text-slate-300">
                      <h3 className="text-lg font-bold text-slate-100">Biblioteca de Histórias & Roteiros</h3>
                      <p className="text-xs">Módulo reservado a educadores, pessoas cadastradas e acompanhantes.</p>
                      <button onClick={() => setActiveTab("chat")} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition">
                        Voltar ao Copiloto IA
                      </button>
                    </div>
                  )
                )}
                {activeTab === "cuidador" && (
                  <CaregiverHub
                    currentSupportLevel={userProfile.supportLevel}
                    userName={userProfile.preferredName || "Visitante"}
                    userProfile={userProfile}
                    onOpenFunctionalPlan={() => setIsFunctionalPlanOpen(true)}
                  />
                )}

                {/* Avaliações & Métricas */}
                {activeTab === "testes" && (
                  <TestCenter
                    onNavigateToChat={handleNavigateToChat}
                    onNavigateToSounds={() => setActiveTab("musicoterapia")}
                    onNavigateToTab={(tab) => setActiveTab(tab as NavTab)}
                    userProfile={userProfile}
                  />
                )}
                {activeTab === "aprendizagem" && (
                  <FunctionalLearningProfile />
                )}
                {activeTab === "relatorio" && (
                  <ReportHub
                    userProfile={userProfile}
                    onNavigateToTab={(tab) => setActiveTab(tab as NavTab)}
                    isDark={userProfile.lowStimulationMode}
                  />
                )}

                {/* Administração & Dados */}
                {activeTab === "supabase" && (
                  isSuperAdmin ? (
                    <SupabaseHub />
                  ) : (
                    <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3 text-slate-300">
                      <h3 className="text-lg font-bold text-slate-100">Acesso Restrito ao Superadmin</h3>
                      <p className="text-xs">O módulo do Banco de Dados Supabase está restrito para administradores técnicos.</p>
                      <button onClick={() => setActiveTab("chat")} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition">
                        Voltar ao Assistente IA
                      </button>
                    </div>
                  )
                )}
                {activeTab === "scripts" && (
                  isSuperAdmin ? (
                    <ScriptsHub />
                  ) : (
                    <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3 text-slate-300">
                      <h3 className="text-lg font-bold text-slate-100">Acesso Restrito ao Superadmin</h3>
                      <p className="text-xs">A Central de Scripts e Automação de Deploy é restrita para administradores e equipe técnica.</p>
                      <button onClick={() => setActiveTab("chat")} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition">
                        Voltar ao Assistente IA
                      </button>
                    </div>
                  )
                )}

                {/* Frozen Modules Notices */}
                {activeTab === "caps" && (
                  <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-100">Módulo Clínico CAPS Congelado</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Este módulo foi congelado para priorizar ferramentas de apoio funcional à rotina, autorregulação e comunicação do usuário.
                      </p>
                    </div>
                    <button onClick={() => setActiveTab("chat")} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition shadow-md">
                      Ir para o Copiloto IA
                    </button>
                  </div>
                )}
                {activeTab === "rh" && (
                  <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-100">Módulo RH Corporativo Congelado</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Este módulo foi congelado para priorizar inclusão, previsibilidade e tecnologia assistiva.
                      </p>
                    </div>
                    <button onClick={() => setActiveTab("chat")} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition shadow-md">
                      Ir para o Copiloto IA
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer & Fale Conosco */}
          <div className="no-print mt-auto">
            <FooterAndContact isDark={userProfile.lowStimulationMode} />
          </div>
        </main>
      </div>

      {/* Emergency Crisis / Meltdown Support Modal */}
      <CrisisModal
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
        userProfile={userProfile}
        toggleLowStimMode={toggleLowStimMode}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Interactive Account & LGPD Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={userProfile}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        isDark={userProfile.lowStimulationMode}
      />

      {/* Superadmin Module Visibility Modal */}
      <SuperAdminModuleModal
        isOpen={isModuleAdminOpen}
        onClose={() => setIsModuleAdminOpen(false)}
        hiddenModules={hiddenModules}
        onToggleModule={handleToggleModule}
        onResetAll={handleResetHiddenModules}
      />

      {/* Share Grants & Privacy Manager Modal */}
      <ShareManagerModal
        isOpen={isShareManagerOpen}
        onClose={() => setIsShareManagerOpen(false)}
        userProfile={userProfile}
      />

      {/* Functional Support Plan Modal */}
      <FunctionalPlanModal
        isOpen={isFunctionalPlanOpen}
        onClose={() => setIsFunctionalPlanOpen(false)}
        userProfile={userProfile}
      />
    </div>
  );
}
