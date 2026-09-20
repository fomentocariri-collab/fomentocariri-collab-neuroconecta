import React, { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  HelpCircle,
  Copy,
  Check,
  BarChart2,
  FileText,
  Search,
  UserCheck,
  Stethoscope,
  GraduationCap,
  HeartPulse,
  Eye,
  Trash2
} from "lucide-react";
import { TestDefinition, SavedTestResult, UserProfile } from "../types";
import { TESTS_LIST } from "../data/tests";
import { getGlobalTestHistory, saveTestResultToStore, clearAllTestHistory } from "../data/testHistory";
import { MomentAssessment } from "./MomentAssessment";

interface TestCenterProps {
  onNavigateToChat: (prompt?: string, role?: string) => void;
  onNavigateToSounds?: () => void;
  onNavigateToTab?: (tab: any) => void;
  userProfile?: UserProfile;
}

export const TestCenter: React.FC<TestCenterProps> = ({ onNavigateToChat, onNavigateToSounds, onNavigateToTab, userProfile }) => {
  const [activeSection, setActiveSection] = useState<"momento" | "triagem" | "historico">("momento");
  const [selectedTest, setSelectedTest] = useState<TestDefinition | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [copiedReport, setCopiedReport] = useState(false);

  const [testResult, setTestResult] = useState<{
    score: number;
    maxScore: number;
    level: string;
    technicalReview: string;
    recommendation: string;
    domainScores?: Record<string, { scored: number; max: number }>;
    aspieScore?: number;
    neurotypicalScore?: number;
  } | null>(null);

  const [savedHistory, setSavedHistory] = useState<SavedTestResult[]>([]);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyRoleFilter, setHistoryRoleFilter] = useState<string>("todos");
  const [viewingHistoryDetail, setViewingHistoryDetail] = useState<SavedTestResult | null>(null);

  // Load history from store
  useEffect(() => {
    const history = getGlobalTestHistory();
    setSavedHistory(history);
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Deseja apagar todo o histórico de autoavaliações salvas?")) {
      clearAllTestHistory();
      setSavedHistory([]);
      setViewingHistoryDetail(null);
    }
  };

  const handleStartTest = (test: TestDefinition) => {
    setSelectedTest(test);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTestResult(null);

    // Check for draft saved in localStorage
    try {
      const draft = localStorage.getItem(`neuroconecta_draft_${test.id}`);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed && typeof parsed === "object") {
          setAnswers(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    const updated = { ...answers, [questionId]: optionIndex };
    setAnswers(updated);

    if (selectedTest) {
      try {
        localStorage.setItem(`neuroconecta_draft_${selectedTest.id}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleFinishTest = () => {
    if (!selectedTest) return;

    let totalScore = 0;
    let maxPossibleScore = 0;

    const domainScores: Record<string, { scored: number; max: number }> = {};

    selectedTest.questions.forEach((q) => {
      const selectedIndex = answers[q.id];
      const selectedOption = selectedIndex !== undefined ? q.options[selectedIndex] : null;
      const selectedScore = selectedOption ? selectedOption.score : 0;
      totalScore += selectedScore;

      const maxOptionScore = Math.max(...q.options.map((o) => o.score));
      maxPossibleScore += maxOptionScore;

      if (q.category) {
        if (!domainScores[q.category]) {
          domainScores[q.category] = { scored: 0, max: 0 };
        }
        domainScores[q.category].scored += selectedScore;
        domainScores[q.category].max += maxOptionScore;
      }
    });

    const interpretation = selectedTest.interpretResult(totalScore, domainScores);

    const result = {
      score: totalScore,
      maxScore: maxPossibleScore,
      level: interpretation.level,
      technicalReview: interpretation.technicalReview,
      recommendation: interpretation.recommendation,
      domainScores,
      aspieScore: interpretation.aspieScore,
      neurotypicalScore: interpretation.neurotypicalScore,
    };

    setTestResult(result);

    // Clear draft
    try {
      localStorage.removeItem(`neuroconecta_draft_${selectedTest.id}`);
    } catch (e) {
      console.error(e);
    }

    // Save history item to global store with actual user's registered profile name
    const activeUserName = userProfile?.preferredName && userProfile?.preferredName !== "Visitante"
      ? userProfile.preferredName 
      : (userProfile?.email || "Usuário Cadastrado");

    const historyItem: SavedTestResult = {
      id: `res-${Date.now()}`,
      userId: userProfile?.id || `usr-${Date.now()}`,
      userName: activeUserName,
      userRole: userProfile?.userRole || "pcd",
      testId: selectedTest.id,
      testTitle: selectedTest.title,
      score: totalScore,
      maxScore: maxPossibleScore,
      date: new Date().toLocaleDateString("pt-BR"),
      interpretationLevel: interpretation.level,
      technicalReview: interpretation.technicalReview,
      recommendation: interpretation.recommendation,
      domainScores,
      validatedClinically: selectedTest.validatedClinically,
      validationReference: selectedTest.validationReference,
      clinicalStatus: "Concluído / Disponível para Equipe Multiprofissional",
    };

    const updatedStore = saveTestResultToStore(historyItem);
    setSavedHistory(updatedStore);
  };

  const handleCopyClinicalReport = (itemToCopy?: SavedTestResult) => {
    const test = selectedTest;
    const res = itemToCopy || testResult;
    if (!res) return;

    let domainText = "";
    if (res.domainScores) {
      domainText = Object.entries(res.domainScores)
        .map(([domain, val]: [string, { scored: number; max: number }]) => `  - ${domain}: ${val.scored} / ${val.max} pts (${Math.round((val.scored / val.max) * 100)}%)`)
        .join("\n");
    }

    const reportText = `[PARECER TÉCNICO & RESENHA CLÍNICA - NEUROCONECTA]
Data da Avaliação: ${itemToCopy ? itemToCopy.date : new Date().toLocaleDateString("pt-BR")}
Paciente / Usuário: ${itemToCopy?.userName || "Usuário Registrado"}
Instrumento Avaliativo: ${itemToCopy ? itemToCopy.testTitle : test?.title}
Validação Científica: ${itemToCopy?.validatedClinically || test?.validatedClinically ? `Sim (${itemToCopy?.validationReference || test?.validationReference})` : "Não (Reflexão Pessoal Comunitária)"}

PONTUAÇÃO OBTIDA: ${res.score} / ${res.maxScore} pts
CLASSIFICAÇÃO DE TRIAGEM: ${itemToCopy ? itemToCopy.interpretationLevel : res.level}

RESENHA TÉCNICA (AVALIAÇÃO EM PROSA CONTINUA):
${itemToCopy ? itemToCopy.technicalReview : res.technicalReview}

DIRETRIZES E RECOMENDAÇÕES MULTIPROFISSIONAIS:
${itemToCopy ? itemToCopy.recommendation : res.recommendation}

${domainText ? `DESCOMPOSIÇÃO POR DOMÍNIOS AVALIADOS:\n${domainText}\n` : ""}
Aviso Legal: Documento emitido por ferramenta pedagógica e psicométrica de triagem. A interpretação final e laudo definitivo exigem avaliação presencial multiprofissional (Médico Neurologista/Psiquiatra, Enfermeiro e Neuropsicólogo).`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Filtered history list for patients, professionals and admins
  const filteredHistory = savedHistory.filter((item) => {
    const matchesSearch =
      item.testTitle.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      (item.userName && item.userName.toLowerCase().includes(historySearchQuery.toLowerCase())) ||
      item.interpretationLevel.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      item.technicalReview.toLowerCase().includes(historySearchQuery.toLowerCase());

    const matchesRole =
      historyRoleFilter === "todos" ||
      (historyRoleFilter === "medicina" && item.validatedClinically) ||
      (historyRoleFilter === "enfermagem" && item.clinicalStatus) ||
      (historyRoleFilter === "escola" && (item.testId === "catq" || item.testId === "raads-r"));

    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-teal-400" />
            Centro de Autoavaliação &amp; Triagem Densa
          </h1>
          <p className="text-sm text-slate-400">
            Instrumentos clínicos validados por literatura médica e questionários de reflexão pessoal comunitária.
          </p>
        </div>
        <div className="text-xs bg-slate-800 text-slate-300 px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>Ferramentas de rastreio. Não substituem laudo psiquiátrico ou neuropsicológico.</span>
        </div>
      </div>

      {/* Main View Switch */}
      {!selectedTest ? (
        <div className="space-y-8">
          
          {/* Sub-Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
            <button
              type="button"
              onClick={() => setActiveSection("momento")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSection === "momento"
                  ? "bg-teal-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>Autoavaliação do Momento</span>
              <span className="text-[10px] bg-teal-900/80 px-2 py-0.5 rounded text-teal-200 border border-teal-700/60">
                100% Funcional / Sem Rótulos
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("triagem")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSection === "triagem"
                  ? "bg-teal-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-teal-300" />
              <span>Instrumentos de Triagem Clínica</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                RAADS-R, CAT-Q, AQ-10
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("historico")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSection === "historico"
                  ? "bg-teal-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Clock className="w-4 h-4 text-teal-300" />
              <span>Histórico Consolidado</span>
              {savedHistory.length > 0 && (
                <span className="text-[10px] bg-teal-900 px-2 py-0.5 rounded text-teal-200 font-mono">
                  {savedHistory.length}
                </span>
              )}
            </button>
          </div>

          {activeSection === "momento" && (
            <MomentAssessment
              onNavigateToChat={onNavigateToChat}
              onNavigateToSounds={onNavigateToSounds}
              onNavigateToTab={onNavigateToTab}
              isDark={true}
            />
          )}

          {activeSection === "triagem" && (
            <div className="space-y-8">
              {/* Scientific Context Comparison Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" />
              <h2 className="text-base font-bold text-slate-100">
                Comparativo de Instrumentos Avaliativos &amp; Validação
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="p-3">Instrumento / Teste</th>
                    <th className="p-3">Nº Questões</th>
                    <th className="p-3">Validação Clínica?</th>
                    <th className="p-3">Uso Principal &amp; Domínios</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-teal-300">RAADS-R</td>
                    <td className="p-3 font-mono">80 / 30 adapt.</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        <ShieldCheck className="w-3 h-3" /> Sim (Ritvo, 2011)
                      </span>
                    </td>
                    <td className="p-3">Triagem clínica de adultos (Sensibilidade 97%, Especificidade 100%). Avalia Social, Interesses, Linguagem e Sensório-Motor.</td>
                  </tr>

                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-teal-300">Aspie Quiz (v5)</td>
                    <td className="p-3 font-mono">~120 / 20 adapt.</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                        <HelpCircle className="w-3 h-3" /> Não (Rdos / Leif)
                      </span>
                    </td>
                    <td className="p-3">Reflexão pessoal e comunitária (Escala 0 a 200). Mapeia Talento, Percepção, Comunicação, Relacionamentos e Social.</td>
                  </tr>

                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-teal-300">AQ-10</td>
                    <td className="p-3 font-mono">10</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        <ShieldCheck className="w-3 h-3" /> Sim (Cambridge / NICE)
                      </span>
                    </td>
                    <td className="p-3">Rastreio rápido de 3 minutos para indicar se há necessidade de investigação aprofundada.</td>
                  </tr>

                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-teal-300">CAT-Q</td>
                    <td className="p-3 font-mono">25 / 6 adapt.</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        <ShieldCheck className="w-3 h-3" /> Sim (Hull, 2019)
                      </span>
                    </td>
                    <td className="p-3">Mede o nível de camuflagem social e esforço empregado para passar por neurotípico em público.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tests List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TESTS_LIST.map((test) => (
              <div
                key={test.id}
                className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-teal-700/60 rounded-2xl p-5 shadow-sm transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-950 text-teal-300 border border-teal-800/80">
                        {test.questionsCount} Questões
                      </span>
                      {test.validatedClinically ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Validado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" /> Reflexão Pessoal
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> ~{test.estimatedMinutes} min
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-teal-300 transition">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Uso: {test.usageType}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {test.shortDescription}
                  </p>

                  {test.domains && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {test.domains.map((d, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-950 text-slate-400 rounded-md border border-slate-800">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleStartTest(test)}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-600 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>Iniciar Autoavaliação</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Result History Section - Accessible to Users, Doctors, Nurses, Teachers & Super Admin */}
      {activeSection === "historico" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-400" />
                  Histórico Consolidado de Avaliações &amp; Pareceres Clínicos
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Acesso compartilhado para Pacientes, Médicos, Enfermeiros, Professores e Super Admins.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {savedHistory.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
                    title="Apagar todo o histórico de testes antigos"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Zerar Histórico</span>
                  </button>
                )}

                {/* Role filter buttons */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { id: "todos", label: "Todos", icon: UserCheck },
                    { id: "medicina", label: "Medicina", icon: Stethoscope },
                    { id: "enfermagem", label: "Enfermagem", icon: HeartPulse },
                    { id: "escola", label: "Escola / PEI", icon: GraduationCap },
                  ].map((rf) => {
                    const Icon = rf.icon;
                    return (
                      <button
                        key={rf.id}
                        onClick={() => setHistoryRoleFilter(rf.id)}
                        className={`px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 transition ${
                          historyRoleFilter === rf.id
                            ? "bg-teal-950 text-teal-200 border-teal-700 shadow-sm"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{rf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder="Buscar no histórico por paciente, instrumento ou palavras da resenha técnica..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* History Items Cards */}
            <div className="space-y-3">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                        {item.userName && (
                          <span className="text-[11px] font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                            👤 {item.userName}
                          </span>
                        )}
                        {item.validatedClinically && (
                          <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Validado
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-100">{item.testTitle}</h4>
                      <p className="text-teal-400 font-medium text-xs">{item.interpretationLevel}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-slate-200 font-mono text-center font-bold">
                        {item.score} / {item.maxScore} pts
                      </div>
                      <button
                        onClick={() => setViewingHistoryDetail(item)}
                        className="px-3 py-2 bg-teal-700 hover:bg-teal-600 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Resenha</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs italic bg-slate-950/60 rounded-xl border border-slate-800">
                  Nenhum registro encontrado para os filtros selecionados.
                </div>
              )}
            </div>
          </div>
        )}

        </div>
      ) : (
        /* Test Runner & Results */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">{selectedTest.title}</h2>
                {selectedTest.validatedClinically ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Validado Clinicamente
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    Reflexão Pessoal
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedTest.fullDescription}</p>
            </div>
            <button
              onClick={() => setSelectedTest(null)}
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            >
              Voltar aos Testes
            </button>
          </div>

          {!testResult ? (
            /* Active Questionnaire Flow */
            <div className="space-y-6">
              
              {/* Progress Bar & Sub-category Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Questão {currentQuestionIndex + 1} de {selectedTest.questionsCount}</span>
                  {selectedTest.questions[currentQuestionIndex]?.category && (
                    <span className="text-teal-400 font-bold bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800 text-[11px]">
                      Domínio: {selectedTest.questions[currentQuestionIndex].category}
                    </span>
                  )}
                  <span>{Math.round(((currentQuestionIndex + 1) / selectedTest.questionsCount) * 100)}% concluído</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 transition-all duration-300"
                    style={{
                      width: `${((currentQuestionIndex + 1) / selectedTest.questionsCount) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Current Question */}
              {selectedTest.questions[currentQuestionIndex] && (
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-6">
                  <h3 className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                    "{selectedTest.questions[currentQuestionIndex].text}"
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    {selectedTest.questions[currentQuestionIndex].options.map((opt, idx) => {
                      const isSelected = answers[selectedTest.questions[currentQuestionIndex].id] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(selectedTest.questions[currentQuestionIndex].id, idx)}
                          className={`p-4 rounded-xl border text-left font-medium text-xs sm:text-sm transition flex items-center justify-between ${
                            isSelected
                              ? "bg-teal-950 text-teal-200 border-teal-500 shadow-md"
                              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Next / Back Controls */}
              <div className="flex justify-between items-center pt-2">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs sm:text-sm rounded-xl transition"
                >
                  Anterior
                </button>

                {currentQuestionIndex < selectedTest.questionsCount - 1 ? (
                  <button
                    disabled={answers[selectedTest.questions[currentQuestionIndex].id] === undefined}
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5"
                  >
                    <span>Próxima Questão</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    disabled={Object.keys(answers).length < selectedTest.questionsCount}
                    onClick={handleFinishTest}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-950/50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ver Resultado e Relatório Completo</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* Test Results Display - Continuous Prose Monograph without Bullet Points */
            <div className="space-y-6">
              
              <div className="p-6 bg-slate-950 border border-teal-800/80 rounded-2xl space-y-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-teal-400 font-bold">Resultado da Autoavaliação &amp; Parecer</span>
                    <h3 className="text-xl font-bold text-slate-100">{testResult.level}</h3>
                  </div>
                  <div className="text-2xl font-extrabold text-teal-300 font-mono bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
                    {testResult.score} <span className="text-xs text-slate-500 font-normal">/ {testResult.maxScore} pts</span>
                  </div>
                </div>

                {/* Dense Technical Review Monograph in Prose */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    Resenha Técnica Avaliativa (Análise Monográfica em Prosa):
                  </h4>

                  <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl text-slate-200 text-sm leading-relaxed whitespace-pre-line text-justify font-sans">
                    {testResult.technicalReview}
                  </div>

                  <div className="text-slate-300 bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm leading-relaxed">
                    💡 <strong>Diretriz Técnica Multiprofissional:</strong> {testResult.recommendation}
                  </div>
                </div>

                {/* Sub-Domains Breakdown Meters */}
                {testResult.domainScores && Object.keys(testResult.domainScores).length > 0 && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-teal-400" />
                      Decomposição por Domínios AVALIADOS:
                    </h4>

                    <div className="space-y-2.5">
                      {Object.entries(testResult.domainScores).map(([domName, val]: [string, { scored: number; max: number }]) => {
                        const pct = Math.round((val.scored / val.max) * 100);
                        return (
                          <div key={domName} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-slate-200">{domName}</span>
                              <span className="text-teal-400 font-mono">{val.scored} / {val.max} ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleCopyClinicalReport()}
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-semibold text-xs sm:text-sm rounded-xl transition flex items-center gap-2 shadow"
                >
                  {copiedReport ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedReport ? "Relatório Copiado!" : "Copiar Relatório Clínico em Texto"}</span>
                </button>

                <button
                  onClick={onNavigateToChat}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs sm:text-sm rounded-xl transition flex items-center gap-2 border border-slate-700"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Discutir com Assistente IA</span>
                </button>

                <button
                  onClick={() => handleStartTest(selectedTest)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 border border-slate-800"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Refazer Teste</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* History Detail Modal View */}
      {viewingHistoryDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-teal-400">{viewingHistoryDetail.date}</span>
                <h3 className="text-lg font-bold text-slate-100">{viewingHistoryDetail.testTitle}</h3>
                <p className="text-xs text-slate-400">Paciente: {viewingHistoryDetail.userName || "Usuário"}</p>
              </div>
              <button
                onClick={() => setViewingHistoryDetail(null)}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold">Classificação</span>
                  <p className="text-sm font-bold text-teal-300">{viewingHistoryDetail.interpretationLevel}</p>
                </div>
                <div className="text-lg font-bold font-mono text-slate-100 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  {viewingHistoryDetail.score} / {viewingHistoryDetail.maxScore} pts
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Resenha Técnica (Análise Monográfica em Prosa):
                </h4>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed text-justify whitespace-pre-line">
                  {viewingHistoryDetail.technicalReview}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                💡 <strong>Recomendação:</strong> {viewingHistoryDetail.recommendation}
              </div>

              {viewingHistoryDetail.domainScores && Object.keys(viewingHistoryDetail.domainScores).length > 0 && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase">Domínios Avaliados:</h4>
                  {Object.entries(viewingHistoryDetail.domainScores).map(([dom, val]: [string, { scored: number; max: number }]) => (
                    <div key={dom} className="flex justify-between text-xs text-slate-300">
                      <span>{dom}</span>
                      <span className="font-mono text-teal-400">{val.scored} / {val.max} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleCopyClinicalReport(viewingHistoryDetail)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Parecer para Prontuário</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
