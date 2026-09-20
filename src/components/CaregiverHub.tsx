import React, { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  Plus, 
  GraduationCap, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  School,
  Sparkles,
  History,
  Send,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Lightbulb,
} from "lucide-react";
import { CAREGIVER_GUIDE } from "../data/caregiverData";
import { 
  CaregiverGuideItem, 
  SupportLevel, 
  PeiDraftVersion, 
  SchoolFamilyMessage, 
  SchoolFamilyNoteType,
  UserProfile 
} from "../types";
import { Lote1Api } from "../services/lote1Client";

interface CaregiverHubProps {
  currentSupportLevel?: SupportLevel;
  userName?: string;
  userProfile?: UserProfile;
  onOpenFunctionalPlan?: () => void;
}

const fallbackDefaultProfile: UserProfile = {
  preferredName: "Pessoa em Apoio",
  pronouns: "não informado",
  diagnosisStatus: "laudo_formal",
  currentFocus: "rotina",
  supportLevel: 2,
  lowStimulationMode: false,
  userRole: "cuidador_educador",
  emergencyContacts: [],
  onboardingCompleted: true,
};

export const CaregiverHub: React.FC<CaregiverHubProps> = ({
  currentSupportLevel = 2,
  userName = "Pessoa em Apoio",
  userProfile = fallbackDefaultProfile,
  onOpenFunctionalPlan,
}) => {
  const profile = userProfile || fallbackDefaultProfile;
  const subjectId = profile.email || "user-local";
  const [activeTab, setActiveTab] = useState<"cuidador" | "pei" | "escola">("cuidador");

  const [activeCategory, setActiveCategory] = useState<CaregiverGuideItem["category"]>("meltdown_shutdown");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>("todos");

  // --- PEI (Plano de Ensino Individualizado) Form State ---
  const [peiStudentName, setPeiStudentName] = useState(userName || "Aluno(a)");
  const [peiSchool, setPeiSchool] = useState("Escola Municipal / Colégio de Apoio");
  const [peiGrade, setPeiGrade] = useState("Ensino Fundamental II / Médio");
  const [peiTeacher, setPeiTeacher] = useState("Prof. Especialista em AEE");
  const [peiSensoryNeeds, setPeiSensoryNeeds] = useState("Sensibilidade a ruídos agudos e luzes fluorescentes. Necessita de fones abafadores no recreio e espaço reservado para transições.");
  const [peiAccommodations, setPeiAccommodations] = useState<string[]>([
    "Tempo adicional (50% a mais) em avaliações e atividades individuais",
    "Instruções fornecidas por escrito, fracionadas passo a passo no quadro",
    "Acesso autorizado ao 'Cantinho da Calma' para autorregulação quando solicitado",
    "Uso de abafador auricular permitido em aulas com atividades coletivas barulhentas",
    "Provas com adaptação visual, diagramação espaçada e comandos diretos",
  ]);
  const [peiNewAccommodation, setPeiNewAccommodation] = useState("");
  const [peiGoals, setPeiGoals] = useState("1. Ampliar a autonomia no início de tarefas acadêmicas complexas.\n2. Minimizar ansiedade em mudanças de horário com aviso prévio de 5 minutos.\n3. Fomentar interação colaborativa em duplas estruturadas.");
  const [peiStatus, setPeiStatus] = useState<PeiDraftVersion["status"]>("minuta_rascunho");
  const [peiClinicalDiagnosis, setPeiClinicalDiagnosis] = useState("");
  const [showClinicalField, setShowClinicalField] = useState(false);

  // PEI Versions History
  const [peiVersions, setPeiVersions] = useState<PeiDraftVersion[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [copiedPei, setCopiedPei] = useState(false);
  const [savedPeiStatus, setSavedPeiStatus] = useState(false);

  // --- Observation Logs state ---
  const [logs, setLogs] = useState<{ id: string; date: string; note: string; tag: string }[]>(() => {
    try {
      const stored = localStorage.getItem("neuroconecta_caregiver_logs");
      return stored ? JSON.parse(stored) : [
        {
          id: "log-1",
          date: new Date().toLocaleDateString("pt-BR"),
          note: "Ótima resposta à rotina visual matinal de café e hidratação.",
          tag: "Vitória",
        },
      ];
    } catch {
      return [];
    }
  });

  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("Observação");

  // --- Escola-Família Messages State ---
  const [schoolMessages, setSchoolMessages] = useState<SchoolFamilyMessage[]>([]);
  const [newMsgContent, setNewMsgContent] = useState("");
  const [newMsgType, setNewMsgType] = useState<SchoolFamilyNoteType>("ROUTINE_UPDATE");
  const [msgSenderRole, setMsgSenderRole] = useState<"escola" | "familia">(
    profile.userRole === "cuidador_educador" && profile.professionalRoleType === "educador" ? "escola" : "familia"
  );

  // Load PEI Versions, School Messages, and Caregiver Observation logs
  const loadPeiVersions = async () => {
    const data = await Lote1Api.getPeiVersions(subjectId, profile);
    setPeiVersions(data);
  };

  const loadSchoolMessages = async () => {
    const data = await Lote1Api.getSchoolFamilyMessages(subjectId, profile);
    setSchoolMessages(data);
  };

  const loadCaregiverObservations = async () => {
    try {
      const res = await Lote1Api.getDiaryEntries(subjectId, profile);
      const serverObservations = res.entries
        .filter((e) => e.entryType === "caregiver_observation")
        .map((e) => ({
          id: e.id,
          date: e.date || new Date().toLocaleDateString("pt-BR"),
          note: e.notes || "",
          tag: e.triggers?.[0] || "Observação",
        }));

      if (serverObservations.length > 0) {
        setLogs((prev) => {
          const existingIds = new Set(prev.map((l) => l.id));
          const toAdd = serverObservations.filter((s) => !existingIds.has(s.id));
          const merged = [...toAdd, ...prev];
          localStorage.setItem("neuroconecta_caregiver_logs", JSON.stringify(merged));
          return merged;
        });
      }
    } catch (e) {
      console.warn("Offline/local fallback para caregiver logs:", e);
    }
  };

  useEffect(() => {
    loadPeiVersions();
    loadSchoolMessages();
    loadCaregiverObservations();
  }, [subjectId]);

  const handleAddLog = async () => {
    if (!newNote.trim()) return;
    const newEntry = {
      id: `c-log-${Date.now()}`,
      date: new Date().toLocaleDateString("pt-BR"),
      note: newNote.trim(),
      tag: newTag,
    };
    const updated = [newEntry, ...logs];
    setLogs(updated);
    try {
      localStorage.setItem("neuroconecta_caregiver_logs", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    // Persiste no backend seguro com auditoria e vínculo de autor
    try {
      await Lote1Api.createDiaryEntry(
        {
          id: newEntry.id,
          subjectId,
          date: new Date().toISOString().split("T")[0],
          notes: newEntry.note,
          triggers: [newTag],
          privacyLevel: "shared_caregivers",
          entryType: "caregiver_observation",
          authorId: profile.email || "caregiver-local",
          authorName: profile.preferredName || "Familiar / Cuidador",
          authorRole: profile.userRole || "familiar",
        },
        profile
      );
    } catch (e) {
      console.error("Erro ao sincronizar observação com backend:", e);
    }

    setNewNote("");
  };

  const filteredGuides = CAREGIVER_GUIDE.filter((g) => {
    const categoryMatch = g.category === activeCategory;
    if (selectedLevelFilter === "todos") return categoryMatch;
    return categoryMatch && (g.levelTarget === "Todos" || g.levelTarget.includes(selectedLevelFilter));
  });

  const handleAddAccommodation = () => {
    if (!peiNewAccommodation.trim()) return;
    setPeiAccommodations([...peiAccommodations, peiNewAccommodation.trim()]);
    setPeiNewAccommodation("");
  };

  const handleRemoveAccommodation = (idx: number) => {
    setPeiAccommodations(peiAccommodations.filter((_, i) => i !== idx));
  };

  const handleSavePeiVersion = async () => {
    const newDraft: Omit<PeiDraftVersion, "id" | "version" | "createdAt"> = {
      subjectId,
      createdBy: profile.preferredName || "Educador/Cuidador",
      creatorRole: profile.userRole || "educador_aee",
      studentName: peiStudentName,
      schoolName: peiSchool,
      grade: peiGrade,
      specialistName: peiTeacher,
      functionalNeeds: peiSensoryNeeds,
      sensoryAccommodations: [peiSensoryNeeds],
      curricularAccommodations: peiAccommodations,
      pedagogicalGoals: peiGoals,
      status: peiStatus,
    };

    await Lote1Api.createPeiVersion(newDraft, profile);
    await loadPeiVersions();
    setSavedPeiStatus(true);
    setTimeout(() => setSavedPeiStatus(false), 3000);
  };

  const handleRestorePeiVersion = (v: PeiDraftVersion) => {
    setPeiStudentName(v.studentName || "");
    setPeiSchool(v.schoolName || "");
    setPeiGrade(v.grade || "");
    setPeiTeacher(v.specialistName || "");
    setPeiSensoryNeeds(v.functionalNeeds || (v.sensoryAccommodations ? v.sensoryAccommodations.join("\n") : ""));
    setPeiAccommodations(v.curricularAccommodations || []);
    setPeiGoals(v.pedagogicalGoals || "");
    setPeiStatus(v.status);
    setShowVersionHistory(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgContent.trim()) return;

    const msg: Omit<SchoolFamilyMessage, "id" | "createdAt" | "readByOtherContext"> = {
      subjectId,
      authorId: profile.email || "local-author",
      authorName: profile.preferredName || (msgSenderRole === "escola" ? "Escola / Professor" : "Família"),
      authorContext: msgSenderRole,
      type: newMsgType,
      title: `Recado (${newMsgType})`,
      content: newMsgContent.trim(),
      date: new Date().toLocaleDateString("pt-BR"),
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    await Lote1Api.createSchoolFamilyMessage(msg, profile);
    setNewMsgContent("");
    await loadSchoolMessages();
  };

  const generateFormattedPeiText = () => {
    return `=====================================================
PROPOSTA PRELIMINAR DE PEI (MINUTA PEDAGÓGICA)
NEUROCONECTA • SUPORTE À EDUCAÇÃO ESPECIAL & AEE
(Documento Preliminar Centrado no Perfil Funcional e Apoio Pedagógico)
=====================================================

1. DADOS DE IDENTIFICAÇÃO DO ALUNO(A)
• Nome do Aluno: ${peiStudentName}
• Escola/Instituição: ${peiSchool}
• Ano/Série: ${peiGrade}
• Responsável / Educador AEE: ${peiTeacher}
• Status do Documento: ${peiStatus.toUpperCase()}

2. PERFIL FUNCIONAL E NECESSIDADES DE APOIO (SENSORIAL, COMUNICAÇÃO E ROTINA)
${peiSensoryNeeds}

3. ACOMODAÇÕES CURRICULARES E TECNOLOGIAS ASSISTIVAS (DUA)
${peiAccommodations.map((a, i) => `${i + 1}. ${a}`).join("\n")}

4. METAS PEDAGÓGICAS E DE DESENVOLVIMENTO
${peiGoals}
${
  peiClinicalDiagnosis
    ? `\n5. INFORMAÇÕES CLÍNICAS / LAUDO (CAMPO RESERVADO E OPCIONAL)\n${peiClinicalDiagnosis}`
    : ""
}

=====================================================
Aviso Pedagógico: Esta proposta não exige diagnóstico clínico como
condição para suporte pedagógico. Centra-se no perfil funcional,
acessibilidade e eliminação de barreiras à aprendizagem.
Data de emissão: ${new Date().toLocaleDateString("pt-BR")} via NeuroConecta.
=====================================================`;
  };

  const handleCopyPei = () => {
    const text = generateFormattedPeiText();
    navigator.clipboard.writeText(text);
    setCopiedPei(true);
    setTimeout(() => setCopiedPei(false), 2000);
  };

  const handlePrintPei = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-xs font-bold">
              Modo Cuidadores, Família & Educação Especial
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-teal-400" />
            Portal de Apoio Familiar & Articulação Escolar
          </h1>
          <p className="text-sm text-slate-400">
            Minutas preliminares de PEI com versionamento, comunicação escola-família e estratégias colaborativas de acolhimento para {userName}.
          </p>
        </div>

        {onOpenFunctionalPlan && (
          <button
            onClick={onOpenFunctionalPlan}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Ver Plano Individual Funcional</span>
          </button>
        )}
      </div>

      {/* Main Mode Subtabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("cuidador")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
            activeTab === "cuidador"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <Users className="w-4 h-4 text-teal-300" />
          <span>Guia para Pais & Cuidadores</span>
        </button>

        <button
          onClick={() => setActiveTab("pei")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
            activeTab === "pei"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Minutas de PEI (Educação Especial)</span>
        </button>

        <button
          onClick={() => setActiveTab("escola")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
            activeTab === "escola"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <School className="w-4 h-4 text-cyan-400" />
          <span>Comunicação Bidirecional Escola-Família</span>
        </button>
      </div>

      {/* TAB 1: PAIS & CUIDADORES */}
      {activeTab === "cuidador" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Filter Options */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex overflow-x-auto no-scrollbar gap-2">
                {[
                  { id: "meltdown_shutdown", label: "🛡️ Crises & Desligamento" },
                  { id: "rotina_sensorial", label: "🌱 Rotina & Sensorial" },
                  { id: "escola_trabalho", label: "📚 Escola & Trabalho" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                      activeCategory === cat.id
                        ? "bg-teal-950 text-teal-200 border border-teal-700"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-transparent"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Filtrar por Nível:</span>
                <select
                  value={selectedLevelFilter}
                  onChange={(e) => setSelectedLevelFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                >
                  <option value="todos">Todos os Níveis</option>
                  <option value="Nível 1">Nível 1</option>
                  <option value="Nível 2">Nível 2</option>
                  <option value="Nível 3">Nível 3</option>
                </select>
              </div>
            </div>

            {/* Guides Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-100 leading-snug">{guide.situation}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-teal-300 shrink-0">
                      {guide.levelTarget}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-teal-400">O que fazer:</span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {guide.whatToDo.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-teal-400">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-800/80">
                    <span className="text-[11px] font-bold text-rose-400">O que evitar:</span>
                    <ul className="space-y-1 text-xs text-slate-400">
                      {guide.whatToAvoid.map((avoid, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400">•</span>
                          <span>{avoid}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observation Journal */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold text-slate-100 text-base">Diário de Observações de Cuidado Cotidiano</h3>
            </div>
            <p className="text-xs text-slate-400">
              Observações práticas de cuidadores sobre bem-estar e pequenos marcos da rotina.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Anotação de hoje..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="sm:col-span-2 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100"
              />
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100"
              >
                <option value="Vitória">🎉 Vitória / Progresso</option>
                <option value="Gatilho">⚠️ Gatilho Identificado</option>
                <option value="Sensorial">🎧 Resposta Sensorial</option>
                <option value="Observação">📝 Observação Geral</option>
              </select>
              <button
                onClick={handleAddLog}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition"
              >
                <Plus className="w-4 h-4" /> Registrar
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400">{log.date}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-teal-300 text-[10px] font-semibold">
                        {log.tag}
                      </span>
                    </div>
                    <p className="text-slate-200">{log.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GERADOR DE MINUTAS DE PEI */}
      {activeTab === "pei" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          {/* Explicit Regulatory Disclaimer */}
          <div className="p-4 bg-amber-950/50 border border-amber-800/80 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-bold text-amber-300 text-sm">
                Minuta Preliminar / Proposta Pedagógica (AEE)
              </p>
              <p className="text-slate-200">
                Este gerador produz uma <strong>proposta preliminar estruturada</strong> para servir de base e diálogo
                entre escola, professor especialista em AEE e a família. Não constitui documento oficial homologado nem
                laudo médico pericial. Toda versão deve ser avaliada e validada presencialmente pelos profissionais responsáveis.
              </p>
            </div>
          </div>

          {/* Safeguard Guarantee Banner: Autoavaliação nunca altera PEI automaticamente */}
          <div className="p-3 bg-teal-950/40 border border-teal-800/60 rounded-xl flex items-start sm:items-center gap-2.5 text-xs text-teal-200">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 sm:mt-0" />
            <span className="leading-relaxed">
              <strong>Garantia de Integridade Documental:</strong> O PEI <em>nunca</em> é modificado de maneira automatizada por questionários, testes ou autoavaliações do usuário. Qualquer adaptação incorporada exige ação e revisão humana consciente pelo educador ou familiar, e o acesso pedagógico por terceiros é estritamente condicionado ao ShareGrant ativo.
            </span>
          </div>

          {savedPeiStatus && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Versão da minuta gravada no histórico com sucesso!
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">
                  Plano de Ensino Individualizado (PEI)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 text-xs font-bold border border-slate-700">
                  Status: {peiStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Construção colaborativa de adaptações curriculares e metas de desenvolvimento.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700"
              >
                <History className="w-4 h-4 text-cyan-400" />
                <span>Histórico ({peiVersions.length})</span>
              </button>

              <button
                onClick={handleSavePeiVersion}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow"
              >
                <Sparkles className="w-4 h-4" />
                <span>Salvar Nova Versão</span>
              </button>

              <button
                onClick={handleCopyPei}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow"
              >
                {copiedPei ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPei ? "Copiado!" : "Copiar"}</span>
              </button>

              <button
                onClick={handlePrintPei}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>

          {/* Version History Drawer / Accordion */}
          {showVersionHistory && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 animate-fadeIn">
              <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <History className="w-3.5 h-3.5" /> Versões e Revisões Salvas da Minuta
              </h3>

              {peiVersions.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhuma revisão anterior salva ainda.</p>
              ) : (
                <div className="space-y-2">
                  {peiVersions.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">Versão {v.version} - {v.studentName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            v.status === "aprovado_com_familia"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : v.status === "em_revisao_equipe"
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-slate-800 text-slate-400"
                          }`}>
                            {v.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Criada em: {new Date(v.createdAt).toLocaleDateString("pt-BR")} por {v.createdBy} ({v.creatorRole})
                        </p>
                      </div>

                      <button
                        onClick={() => handleRestorePeiVersion(v)}
                        className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg text-xs font-semibold"
                      >
                        Carregar esta versão
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Nome do Aluno(a):</label>
              <input
                type="text"
                value={peiStudentName}
                onChange={(e) => setPeiStudentName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Escola / Colégio:</label>
              <input
                type="text"
                value={peiSchool}
                onChange={(e) => setPeiSchool(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Ano / Série:</label>
              <input
                type="text"
                value={peiGrade}
                onChange={(e) => setPeiGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Professor AEE / Especialista:</label>
              <input
                type="text"
                value={peiTeacher}
                onChange={(e) => setPeiTeacher(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Status da Proposta:</label>
            <select
              value={peiStatus}
              onChange={(e) => setPeiStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-bold"
            >
              <option value="minuta_rascunho">Minuta Rascunho Inicial</option>
              <option value="em_revisao_equipe">Em Revisão / Diálogo com Família e Escola</option>
              <option value="aprovado_com_familia">Aprovado e Alinhado com a Família</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">
              Perfil Funcional e Necessidades de Apoio (Sensorial, Comunicação e Rotina):
            </label>
            <textarea
              rows={2}
              value={peiSensoryNeeds}
              onChange={(e) => setPeiSensoryNeeds(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>

          {/* Accommodations List */}
          <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Acomodações Curriculares Propostas:
            </h3>

            <div className="space-y-2">
              {peiAccommodations.map((acc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200">
                  <span>• {acc}</span>
                  <button
                    onClick={() => handleRemoveAccommodation(idx)}
                    className="text-rose-400 hover:text-rose-300 font-bold text-[10px] px-2 py-1 bg-rose-950/60 rounded-md"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Adicionar nova acomodação escolar..."
                value={peiNewAccommodation}
                onChange={(e) => setPeiNewAccommodation(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
              <button
                onClick={handleAddAccommodation}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Metas Pedagógicas e de Desenvolvimento Social:</label>
            <textarea
              rows={3}
              value={peiGoals}
              onChange={(e) => setPeiGoals(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>

          {/* Informação Clínica / Diagnóstico - Campo Opcional e Protegido (Item 19 do Adendo) */}
          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Informação Clínica / Laudo (Campo Reservado & Opcional)
              </span>
              <button
                type="button"
                onClick={() => setShowClinicalField(!showClinicalField)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                {showClinicalField ? "Ocultar" : "Exibir / Preencher"}
              </button>
            </div>

            {showClinicalField && (
              <div className="space-y-1.5 animate-fadeIn pt-1">
                <p className="text-[10px] text-slate-400">
                  O PEI não tem o diagnóstico como centro nem como condição de atendimento. Este campo é opcional e destinado exclusivamente a registrar orientações clínicas quando houver laudo anexado pela família:
                </p>
                <textarea
                  rows={2}
                  value={peiClinicalDiagnosis}
                  onChange={(e) => setPeiClinicalDiagnosis(e.target.value)}
                  placeholder="Ex: Laudo neurológico aponta CID-11 6A02. Recomenda-se acompanhamento multidisciplinar e flexibilização de tempo de avaliação."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COMUNICAÇÃO ESCOLA-FAMÍLIA */}
      {activeTab === "escola" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-bold">
                Canal Oficial de Alinhamento Bidirecional
              </span>
              <h2 className="text-xl font-bold text-slate-100 mt-1">
                Comunicação Escola & Família
              </h2>
              <p className="text-xs text-slate-400">
                Recados pontuais sobre rotina, alimentação, bem-estar e eventos pedagógicos.
              </p>
            </div>

            {/* Role switch in message send */}
            <div className="flex items-center gap-2 text-xs bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 pl-2">Estou enviando como:</span>
              <button
                onClick={() => setMsgSenderRole("familia")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  msgSenderRole === "familia" ? "bg-amber-600 text-white" : "text-slate-400"
                }`}
              >
                Família
              </button>
              <button
                onClick={() => setMsgSenderRole("escola")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  msgSenderRole === "escola" ? "bg-cyan-600 text-white" : "text-slate-400"
                }`}
              >
                Escola / Prof.
              </button>
            </div>
          </div>

          {/* Princípio de Comunicação Objetiva e Não Patologizante (Item 18 do Adendo) */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-teal-400 font-bold">
              <span className="flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-teal-400" />
                Diretriz Pedagógica: Descrição Objetiva e Não Acusatória
              </span>
              <span className="text-[10px] text-slate-400">Comunicação Colaborativa</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Evite termos patologizantes como <em>"comportamento inadequado"</em> ou <em>"não colaborou"</em>. Descreva fatos observáveis e o contexto ambiental (ex.: <em>"Durante atividade com ruído no pátio, houve dificuldade de permanência e necessidade de pausa sensorial."</em>).
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 self-center">Sugestões de redação respeitosa:</span>
              {[
                "Pausa sensorial após momento de ruído",
                "Ótima resposta com passo a passo ilustrado",
                "Necessidade de aviso prévio de 5 min para transição",
                "Bateria social reduzida hoje; preferiu apoio individual",
                "Participação entusiasmada na atividade em duplas",
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNewMsgContent((prev) => (prev ? `${prev} ${chip}.` : `${chip}.`))}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-teal-300 text-[10px] font-medium rounded-lg border border-slate-800 transition"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* New Message Form */}
          <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Registrar Novo Recado
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Tipo de Nota:</span>
                <select
                  value={newMsgType}
                  onChange={(e) => setNewMsgType(e.target.value as SchoolFamilyNoteType)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                >
                  <option value="ROUTINE_UPDATE">Atualização de Rotina</option>
                  <option value="SCHOOL_NOTE">Nota da Escola</option>
                  <option value="FAMILY_NOTE">Nota da Família</option>
                  <option value="ACCOMMODATION_REQUEST">Solicitação de Acomodação</option>
                  <option value="ACCOMMODATION_FEEDBACK">Feedback de Acomodação</option>
                  <option value="SUPPORT_STRATEGY">Estratégia de Suporte</option>
                  <option value="MEETING_NOTE">Anotação de Reunião</option>
                </select>
              </div>
            </div>

            <textarea
              rows={2}
              required
              placeholder={
                msgSenderRole === "escola"
                  ? "Ex: Hoje participou muito bem da aula de ciências. Teve leve desconforto com barulho no recreio, mas usou fone e regulou-se rápido..."
                  : "Ex: Não dormiu bem esta noite devido a uma gripe leve. Pode estar com a bateria social mais baixa hoje..."
              }
              value={newMsgContent}
              onChange={(e) => setNewMsgContent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Recado</span>
              </button>
            </div>
          </form>

          {/* Messages Feed */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recados Registrados ({schoolMessages.length})
            </h3>

            {schoolMessages.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                Nenhum recado trocado ainda neste canal.
              </p>
            ) : (
              schoolMessages.map((msg) => {
                const isSchool = msg.authorContext === "escola";
                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition ${
                      isSchool
                        ? "bg-slate-950 border-cyan-900/60"
                        : "bg-slate-950 border-amber-900/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isSchool
                              ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                              : "bg-amber-950 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {isSchool ? "🏫 Escola" : "👨‍👩‍👧 Família"}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{msg.authorName}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                          {msg.type}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {msg.date} às {msg.time}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 mt-2 leading-relaxed">{msg.content}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
