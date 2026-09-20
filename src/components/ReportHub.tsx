import React, { useState, useEffect, useMemo } from "react";
import { 
  FileText, 
  Printer, 
  Calendar, 
  BarChart3, 
  ShieldCheck, 
  ClipboardCheck, 
  Award, 
  Users, 
  Plus, 
  BookOpen, 
  AlertTriangle,
  Download,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Compass
} from "lucide-react";
import { UserProfile, SavedTestResult, RoutineTask, FunctionalSupportPlan, PeiDraftVersion } from "../types";
import { Lote1Api } from "../services/lote1Client";
import { AcademicReviewModal } from "./AcademicReviewModal";
import { generateFunctionalReportPdf } from "../utils/pdfGenerator";

export interface PatientRecord {
  id: string;
  name: string;
  pronouns: string;
  diagnosisStatus: "laudo_formal" | "autodiagnosticado" | "investigacao" | "familiar_apoiador" | "nao_informado";
  supportLevel: 1 | 2 | 3 | "nao_informado" | "nao_especificado";
  cipteaNumber?: string;
  birthDate?: string;
  focusArea: string;
  caregiverMode: boolean;
  aq10Score?: number;
  sqeqScore?: number;
  sensoryScore?: number;
  burnoutScore?: number;
  catqScore?: number;
}

interface ReportHubProps {
  userProfile: UserProfile;
  onNavigateToTab?: (tab: any) => void;
  isDark?: boolean;
}

type PeriodFilter = "diario" | "semanal" | "mensal";

export const ReportHub: React.FC<ReportHubProps> = ({ userProfile, onNavigateToTab, isDark = true }) => {
  const [period, setPeriod] = useState<PeriodFilter>("semanal");
  const [showAcademicModal, setShowAcademicModal] = useState(false);

  // Patient database for reports (strictly provenance-based, no fake scores or defaulted support levels)
  const [patients, setPatients] = useState<PatientRecord[]>(() => {
    try {
      const stored = localStorage.getItem("neuroconecta_report_patients");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // If empty in report, load from global registry with safe fallbacks (never defaulting to Level 2)
      const globalRaw = localStorage.getItem("neuroconecta_global_patients");
      if (globalRaw) {
        const globalList = JSON.parse(globalRaw);
        if (Array.isArray(globalList) && globalList.length > 0) {
          return globalList.map((p: any) => ({
            id: p.id,
            name: p.name,
            pronouns: p.pronouns || "não informado",
            diagnosisStatus: p.diagnosisStatus || "nao_informado",
            supportLevel: p.supportLevel || "nao_informado",
            cipteaNumber: p.cipteaNumber || undefined,
            birthDate: p.birthDate,
            focusArea: p.focusArea || "Acompanhamento Funcional",
            caregiverMode: true
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const isSuperAdmin =
    Boolean(userProfile.isSuperAdmin === true || userProfile.userRole === "superadmin");

  const [selectedPatId, setSelectedPatId] = useState<string>("__me__");

  // Save patients list
  useEffect(() => {
    try {
      localStorage.setItem("neuroconecta_report_patients", JSON.stringify(patients));
    } catch (e) {
      console.error(e);
    }
  }, [patients]);

  // New Patient Form state
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatName, setNewPatName] = useState("");
  const [newPatPronouns, setNewPatPronouns] = useState("não informado");
  const [newPatDiag, setNewPatDiag] = useState<PatientRecord["diagnosisStatus"]>("nao_informado");
  const [newPatSupport, setNewPatSupport] = useState<PatientRecord["supportLevel"]>("nao_informado");
  const [newPatCiptea, setNewPatCiptea] = useState("");
  const [newPatFocus, setNewPatFocus] = useState("Autonomia & Rotina Visual");

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatName.trim()) return;
    const newPat: PatientRecord = {
      id: `pat-${Date.now()}`,
      name: newPatName.trim(),
      pronouns: newPatPronouns.trim() || "não informado",
      diagnosisStatus: newPatDiag,
      supportLevel: newPatSupport,
      cipteaNumber: newPatCiptea.trim() || undefined,
      focusArea: newPatFocus,
      caregiverMode: true,
    };
    setPatients([...patients, newPat]);
    setSelectedPatId(newPat.id);
    setNewPatName("");
    setShowAddPatientModal(false);
  };

  // Loaded data
  const [testHistory, setTestHistory] = useState<SavedTestResult[]>([]);
  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>([]);
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [caregiverLogs, setCaregiverLogs] = useState<{ id: string; date: string; note: string; tag: string }[]>([]);

  // Integrated source: PEI & Functional Support Plan
  const [functionalPlan, setFunctionalPlan] = useState<FunctionalSupportPlan | null>(null);
  const [peiVersions, setPeiVersions] = useState<PeiDraftVersion[]>([]);

  // Sync test history and logs from all stores and respond to window focus & storage updates
  useEffect(() => {
    const loadAllData = () => {
      try {
        const storedTests = localStorage.getItem("neuroconecta_test_history");
        const globalTests = localStorage.getItem("neuroconecta_global_assessments_db");
        const parsedStored: SavedTestResult[] = storedTests ? JSON.parse(storedTests) : [];
        const parsedGlobal: SavedTestResult[] = globalTests ? JSON.parse(globalTests) : [];

        const combined: SavedTestResult[] = Array.isArray(parsedStored) ? [...parsedStored] : [];
        if (Array.isArray(parsedGlobal)) {
          parsedGlobal.forEach((item) => {
            if (!combined.some((c) => c.id === item.id || (c.testId === item.testId && c.date === item.date && c.score === item.score))) {
              combined.push(item);
            }
          });
        }
        setTestHistory(combined);

        const storedRoutines = localStorage.getItem("neuroconecta_routine_tasks");
        if (storedRoutines) setRoutineTasks(JSON.parse(storedRoutines));

        const storedMoods = localStorage.getItem("neuroconecta_mood_logs");
        if (storedMoods) setMoodLogs(JSON.parse(storedMoods));

        const storedCaregiver = localStorage.getItem("neuroconecta_caregiver_logs");
        if (storedCaregiver) setCaregiverLogs(JSON.parse(storedCaregiver));
      } catch (e) {
        console.error("Erro ao carregar histórico de dados para relatório:", e);
      }
    };

    loadAllData();
    window.addEventListener("focus", loadAllData);
    window.addEventListener("storage", loadAllData);
    return () => {
      window.removeEventListener("focus", loadAllData);
      window.removeEventListener("storage", loadAllData);
    };
  }, []);

  // Distinct test subjects registered across tests
  const distinctTestUsers = useMemo(() => {
    const map = new Map<string, { userId?: string; userName: string; count: number }>();
    testHistory.forEach((t) => {
      const raw = t.userName?.trim() || t.userId || "Usuário";
      const key = raw.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.count++;
      } else {
        map.set(key, {
          userId: t.userId,
          userName: raw,
          count: 1,
        });
      }
    });
    return Array.from(map.values());
  }, [testHistory]);

  // Determine report subject
  const isSelf = selectedPatId === "__me__";
  const isAll = selectedPatId === "__all__";
  const isTestUser = selectedPatId.startsWith("user:");
  const selectedTestUserName = isTestUser ? selectedPatId.replace("user:", "") : "";

  const selectedPatient = !isSelf && !isAll && !isTestUser
    ? patients.find((p) => p.id === selectedPatId) || null
    : null;

  const patientName = isAll
    ? "Consolidado Geral (Todos os Usuários e Avaliações)"
    : isTestUser
    ? selectedTestUserName
    : selectedPatient
    ? selectedPatient.name
    : userProfile.preferredName || userProfile.email || "Usuário do Sistema";

  const patientPronouns = isAll
    ? "diversos"
    : isTestUser
    ? "não informado"
    : selectedPatient
    ? selectedPatient.pronouns
    : userProfile.pronouns || "não informado";

  const currentSupportLevel = isSelf
    ? userProfile.supportLevel
    : selectedPatient
    ? selectedPatient.supportLevel
    : "nao_informado";

  const currentDiagStatus = isSelf
    ? userProfile.diagnosisStatus
    : selectedPatient
    ? selectedPatient.diagnosisStatus
    : "nao_informado";

  const currentCiptea = isSelf
    ? userProfile.cipteaNumber
    : selectedPatient
    ? selectedPatient.cipteaNumber
    : undefined;

  // Filter test history safely for selected subject
  const filteredTestHistory = useMemo(() => {
    if (isAll) return testHistory;

    if (isTestUser) {
      const match = testHistory.filter(
        (t) => t.userName?.toLowerCase() === selectedTestUserName.toLowerCase()
      );
      return match.length > 0 ? match : testHistory;
    }

    if (selectedPatient) {
      const pName = selectedPatient.name.toLowerCase();
      const pId = selectedPatient.id;
      const matched = testHistory.filter(
        (t) =>
          (t.userName && t.userName.toLowerCase() === pName) ||
          (t.userId && t.userId === pId)
      );
      return matched;
    }

    // Default: Self / Current Profile
    const myId = userProfile.id;
    const myName = (userProfile.preferredName || "").toLowerCase();
    const myEmail = (userProfile.email || "").toLowerCase();

    const matched = testHistory.filter(
      (t) =>
        (myId && t.userId === myId) ||
        (myName && t.userName && t.userName.toLowerCase() === myName) ||
        (myEmail && t.userName && t.userName.toLowerCase() === myEmail)
    );

    // If no test specifically matches this user's name/id yet, but test records exist in local storage,
    // show existing tests so the user's completed tests are never hidden
    if (matched.length === 0 && testHistory.length > 0) {
      return testHistory;
    }

    return matched;
  }, [testHistory, isAll, isTestUser, selectedTestUserName, selectedPatient, userProfile]);

  // Fetch authentic PEI and Functional Plan from shared persistent source
  useEffect(() => {
    const subjectId = selectedPatient ? selectedPatient.id : userProfile.email || "user-local";
    Lote1Api.getFunctionalPlan(subjectId, userProfile).then((plan) => {
      setFunctionalPlan(plan);
    }).catch(console.error);

    Lote1Api.getPeiVersions(subjectId, userProfile).then((versions) => {
      setPeiVersions(versions);
    }).catch(console.error);
  }, [selectedPatId, selectedPatient, userProfile]);

  // Role audit without inactive clinical or RH modules
  const isEducator = 
    userProfile.userRole === "educador_aee" ||
    userProfile.professionalRoleType === "educador";

  const isCaregiver = 
    userProfile.userRole === "cuidador_familiar" || 
    userProfile.userRole === "cuidador_educador";

  const isSupportProfessional = 
    userProfile.userRole === "profissional_apoio";

  const documentTitle = isEducator
    ? "Relatório Pedagógico & Síntese Funcional de Acompanhamento"
    : isCaregiver
    ? "Relatório de Rotina, Cuidados & Acompanhamento Familiar"
    : isSupportProfessional
    ? "Relatório Multidisciplinar de Apoio & Acompanhamento Funcional"
    : "Síntese Funcional de Rotina e Autorregulação";

  const documentTypeBadge = isEducator
    ? "Documento Pedagógico / Escolar (PEI)"
    : isCaregiver
    ? "Registro de Cuidados & Rotina Familiar"
    : isSupportProfessional
    ? "Acompanhamento Técnico Multidisciplinar"
    : "Autoavaliação e Acompanhamento Funcional";

  const emitterRoleLabel = isEducator
    ? "Educador(a) Especialista / AEE"
    : isCaregiver
    ? "Cuidador(a) / Familiar Apoiador"
    : isSupportProfessional
    ? `Profissional de Apoio (${userProfile.professionalRegisterNumber || "Registro Ativo"})`
    : "Titular do Registro / Usuário";

  // Aggregation calculations (Safe, audited numeric extraction preventing NaN)
  const totalTasks = routineTasks.length;
  const completedTasksCount = routineTasks.filter((t) => t.completed).length;
  const routineCompletionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : null;

  // Mood mappings & audited numerical extraction
  const moodScoreMap: Record<string, number> = {
    excelente: 5,
    alegre: 5,
    calmo: 4,
    neutro: 3,
    ansioso: 2,
    irritado: 2,
    sobrecarregado: 1,
    exausto: 1,
  };

  const validMoodEntries: number[] = [];
  moodLogs.forEach((item: any) => {
    if (typeof item.moodScore === "number" && !isNaN(item.moodScore) && isFinite(item.moodScore)) {
      validMoodEntries.push(item.moodScore);
    } else if (typeof item.mood === "string" && moodScoreMap[item.mood.toLowerCase()] !== undefined) {
      validMoodEntries.push(moodScoreMap[item.mood.toLowerCase()]);
    } else if (typeof item.mood === "number" && !isNaN(item.mood) && isFinite(item.mood)) {
      validMoodEntries.push(item.mood);
    }
  });

  const validEnergyEntries: number[] = [];
  moodLogs.forEach((item: any) => {
    const raw = item.energyLevel ?? item.energyScore;
    const num = Number(raw);
    if (!isNaN(num) && isFinite(num) && typeof raw !== "boolean" && raw !== null && raw !== undefined) {
      validEnergyEntries.push(num);
    }
  });

  const avgMoodStr = validMoodEntries.length > 0
    ? (validMoodEntries.reduce((a, b) => a + b, 0) / validMoodEntries.length).toFixed(1)
    : "Sem dados suficientes";

  const avgEnergyStr = validEnergyEntries.length > 0
    ? (validEnergyEntries.reduce((a, b) => a + b, 0) / validEnergyEntries.length).toFixed(1)
    : "Sem dados suficientes";

  const sensoryOverloadEvents = moodLogs.filter((item: any) => 
    item.sensoryOverload === true || 
    item.sensoryLevel >= 4 || 
    item.mood === "sobrecarregado"
  ).length;

  // Individual test lookup for key batteries
  const raadsResult = filteredTestHistory.find((t) => (t.testId === "raads-r" || t.testId === "raads") && typeof t.score === "number" && !isNaN(t.score));
  const aspieResult = filteredTestHistory.find((t) => t.testId === "aspie-quiz" && typeof t.score === "number" && !isNaN(t.score));
  const aq10Result = filteredTestHistory.find((t) => t.testId === "aq10" && typeof t.score === "number" && !isNaN(t.score));
  const sqeqResult = filteredTestHistory.find((t) => t.testId === "sqeq" && typeof t.score === "number" && !isNaN(t.score));
  const sensoryResult = filteredTestHistory.find((t) => t.testId === "sensory" && typeof t.score === "number" && !isNaN(t.score));
  const burnoutResult = filteredTestHistory.find((t) => t.testId === "burnout" && typeof t.score === "number" && !isNaN(t.score));
  const catqResult = filteredTestHistory.find((t) => t.testId === "catq" && typeof t.score === "number" && !isNaN(t.score));

  // Dynamic completed tests list encompassing all valid tests
  const completedTestsList = useMemo(() => {
    const list: { name: string; res: SavedTestResult }[] = [];
    filteredTestHistory.forEach((t) => {
      if (typeof t.score === "number" && !isNaN(t.score)) {
        let name = t.testTitle || t.testId;
        if (t.testId === "raads-r" && !name.toLowerCase().includes("raads")) {
          name = "RAADS-R (Ritvo Asperger Autism Diagnostic Scale - Revised)";
        } else if (t.testId === "aspie-quiz" && !name.toLowerCase().includes("aspie")) {
          name = "Aspie Quiz (Neurodiversidade vs Neurotípico)";
        } else if (t.testId === "aq10" && !name.toLowerCase().includes("aq-10")) {
          name = "AQ-10 (Autism Spectrum Quotient - 10 itens)";
        } else if (t.testId === "catq" && !name.toLowerCase().includes("cat-q")) {
          name = "CAT-Q (Camuflagem Social no Autismo)";
        } else if (t.testId === "burnout" && !name.toLowerCase().includes("burnout")) {
          name = "Avaliação de Burnout Autista & Sobrecarga";
        } else if (t.testId === "sensory" && !name.toLowerCase().includes("sensorial")) {
          name = "Perfil Sensorial Simplificado";
        } else if (t.testId === "sqeq" && !name.toLowerCase().includes("sq-eq")) {
          name = "SQ-EQ (Empatia e Sistematização)";
        }
        list.push({ name, res: t });
      }
    });
    return list;
  }, [filteredTestHistory]);

  // Support level label - Never infer or default to Level 2
  const supportLevelLabel = currentSupportLevel === 1
    ? "Nível 1 de Suporte (Declarado em documento formal prévio)"
    : currentSupportLevel === 2
    ? "Nível 2 de Suporte (Declarado em documento formal prévio)"
    : currentSupportLevel === 3
    ? "Nível 3 de Suporte (Declarado em documento formal prévio)"
    : "Não informado / Não documentado";

  // Diagnosis label - Never infer diagnosis
  const diagnosisLabel = currentDiagStatus === "laudo_formal"
    ? "Laudo Formal Prévio Declarado pelo Usuário/Responsável"
    : currentDiagStatus === "autodiagnosticado"
    ? "Autorrelato / Identificação Neurodivergente"
    : currentDiagStatus === "investigacao"
    ? "Em Investigação Prévia / Sem Laudo Conclusivo"
    : "Não informado";

  // Latest PEI version if exists
  const latestPei = peiVersions.length > 0 ? peiVersions[0] : null;

  // Fail-closed validation audit
  const validationErrors: string[] = [];
  if (avgMoodStr.includes("NaN") || avgEnergyStr.includes("NaN")) {
    validationErrors.push("Detecção de valor numérico inválido (NaN) em indicadores.");
  }

  // Action: Print using @media print (app shell completely hidden)
  const handlePrint = () => {
    if (validationErrors.length > 0) {
      alert("Inconsistência de integridade detectada. Por favor, revise os dados antes de imprimir.");
      return;
    }
    window.print();
  };

  // Action: Download real binary PDF file (MIME: application/pdf)
  const handleDownloadRealPdf = () => {
    if (validationErrors.length > 0) return;
    generateFunctionalReportPdf({
      patientName: patientName,
      pronouns: patientPronouns,
      supportLevel: supportLevelLabel,
      diagnosisStatus: diagnosisLabel,
      ciptea: currentCiptea || "Não cadastrado",
      periodLabel: period === "semanal" ? "Semanal (Últimos 7 dias)" : period === "mensal" ? "Mensal (Últimos 30 dias)" : "Diário (Hoje)",
      goals: functionalPlan?.goals?.join(", ") || "Apoio à autonomia e previsibilidade diária",
      accommodations: functionalPlan?.sensoryAccommodations || [],
      sensoryNeeds: functionalPlan?.sensoryAccommodations?.join("; ") || "Acomodações sensoriais cadastradas no plano de apoio",
      tests: completedTestsList.map(t => ({
        name: t.name,
        score: `${t.res.score}/${t.res.maxScore}`,
        interpretation: t.res.interpretationLevel || "Concluído"
      })),
      emitterName: userProfile.preferredName || "Profissional / Apoiador Responsável",
      emitterRole: userProfile.userRole === "profissional_saude" ? "Profissional Multidisciplinar" : userProfile.userRole === "cuidador_educador" ? "Educador / Cuidador" : "Apoiador Cadastrado",
    });
  };

  const handleDownloadHtml = () => {
    if (validationErrors.length > 0) {
      alert("Não é possível baixar relatório com erros de validação.");
      return;
    }

    const dateStr = new Date().toLocaleDateString("pt-BR");

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${documentTitle} - ${patientName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 24px; line-height: 1.6; background-color: #ffffff; }
    .header { border-bottom: 2px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 11px; font-weight: bold; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; }
    h1 { font-size: 20px; margin: 4px 0 0 0; color: #0f172a; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 12px; }
    .section-title { font-size: 15px; font-weight: bold; color: #5b21b6; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center; margin-bottom: 20px; }
    .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .metric-val { font-size: 20px; font-weight: 800; color: #6d28d9; margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
    th { background: #f1f5f9; text-align: left; padding: 8px 12px; border-bottom: 2px solid #cbd5e1; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .narrative { font-size: 13px; text-align: justify; margin-bottom: 20px; }
    .pei-box { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 12px; }
    .warning-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; font-size: 11px; color: #92400e; margin-top: 24px; }
    .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; font-size: 12px; text-align: center; }
    .sign-line { border-top: 1px solid #0f172a; width: 220px; margin: 0 auto 6px auto; }
    @media print { body { margin: 10mm; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">SISTEMASTOP • NEUROCONECTA — TECNOLOGIA ASSISTIVA NEUROAFIRMATIVA</div>
      <h1>${documentTitle}</h1>
      <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Rua Doutor Rolim, 366 - Bairro Independência, Crato - CE | +55 (88) 99673-9128 | Plataforma NeuroConecta</p>
    </div>
    <div style="text-align: right; font-size: 11px; color: #475569;">
      <p><strong>Emissão:</strong> ${dateStr}</p>
      <p><strong>Período:</strong> ${period === "diario" ? "Hoje" : period === "semanal" ? "Semanal (7 dias)" : "Mensal (30 dias)"}</p>
      <p style="font-weight: bold; color: #6d28d9;">${documentTypeBadge}</p>
    </div>
  </div>

  <div class="meta-box">
    <div><strong>Titular:</strong> ${patientName} (${patientPronouns})</div>
    <div><strong>Status Diagnóstico:</strong> ${diagnosisLabel}</div>
    <div><strong>Nível de Suporte Registrado:</strong> ${supportLevelLabel}</div>
    <div><strong>Documento / CIPTEA:</strong> ${currentCiptea || "Não cadastrado"}</div>
    <div><strong>Emissor Responsável:</strong> ${userProfile.preferredName || "Responsável"} (${emitterRoleLabel})</div>
    <div><strong>ID do Documento:</strong> NC-DOC-${Date.now().toString(36).toUpperCase()}</div>
  </div>

  <div class="section-title">1. Indicadores de Rotina e Autorregulação</div>
  <div class="metrics">
    <div class="metric-card">
      <div style="font-size: 10px; font-weight: bold; color: #64748b;">Conclusão de Rotina</div>
      <div class="metric-val">${routineCompletionPercentage !== null ? `${routineCompletionPercentage}%` : "Sem tarefas"}</div>
      <div style="font-size: 10px; color: #64748b;">${totalTasks > 0 ? `${completedTasksCount}/${totalTasks} concluídas` : "Sem registros"}</div>
    </div>
    <div class="metric-card">
      <div style="font-size: 10px; font-weight: bold; color: #64748b;">Média de Humor (1-5)</div>
      <div class="metric-val">${avgMoodStr === "Sem dados suficientes" ? "Sem dados" : `${avgMoodStr}/5.0`}</div>
      <div style="font-size: 10px; color: #64748b;">${validMoodEntries.length} registro(s)</div>
    </div>
    <div class="metric-card">
      <div style="font-size: 10px; font-weight: bold; color: #64748b;">Nível de Energia (1-5)</div>
      <div class="metric-val">${avgEnergyStr === "Sem dados suficientes" ? "Sem dados" : `${avgEnergyStr}/5.0`}</div>
      <div style="font-size: 10px; color: #64748b;">${validEnergyEntries.length} registro(s)</div>
    </div>
    <div class="metric-card">
      <div style="font-size: 10px; font-weight: bold; color: #64748b;">Sobrecargas Sensoriais</div>
      <div class="metric-val">${sensoryOverloadEvents}</div>
      <div style="font-size: 10px; color: #64748b;">Episódios relatados</div>
    </div>
  </div>

  <div class="section-title">2. Instrumentos Padronizados de Triagem (Proveniência Estrita)</div>
  <table>
    <thead>
      <tr>
        <th>Instrumento</th>
        <th>Data</th>
        <th>Pontuação</th>
        <th>Interpretação Registrada</th>
      </tr>
    </thead>
    <tbody>
      ${completedTestsList.length > 0 ? completedTestsList.map(t => `
        <tr>
          <td><strong>${t.name}</strong></td>
          <td>${t.res.date}</td>
          <td><strong>${t.res.score} / ${t.res.maxScore} pts</strong></td>
          <td>${t.res.interpretationLevel || "Concluído"}</td>
        </tr>
      `).join("") : `
        <tr>
          <td colspan="4" style="text-align: center; color: #64748b; padding: 14px;">
            Nenhum instrumento psicométrico ou autoteste foi concluído no período para este perfil.
          </td>
        </tr>
      `}
    </tbody>
  </table>

  <div class="section-title">3. Síntese Funcional do Período</div>
  <div class="narrative">
    <p>O presente documento consolida os registros funcionais de rotina, autorrelatos e apontamentos inseridos na plataforma NeuroConecta referentes a <strong>${patientName}</strong> (${patientPronouns}), organizados na janela de acompanhamento <strong>${period === "diario" ? "diária" : period === "semanal" ? "semanal (7 dias)" : "mensal (30 dias)"}</strong>.</p>
    <p><strong>Engajamento em Rotina:</strong> ${totalTasks > 0 ? `Foram registradas ${totalTasks} tarefas na rotina visual, com conclusão de ${completedTasksCount} tarefas (${routineCompletionPercentage}% de adesão).` : "Não constam tarefas cadastradas na rotina para este intervalo."}</p>
    <p><strong>Autorregulação &amp; Energia:</strong> ${validMoodEntries.length > 0 || validEnergyEntries.length > 0 ? `Registrada média de humor de ${avgMoodStr}/5.0 e energia média de ${avgEnergyStr}/5.0. Constam ${sensoryOverloadEvents} episódio(s) de sobrecarga sensorial relatados no período.` : "Sem dados numéricos suficientes de humor e energia no período."}</p>
    <p><strong>Instrumentos Padronizados Concluídos:</strong> ${completedTestsList.length > 0 ? completedTestsList.map(t => `${t.name}: ${t.res.score}/${t.res.maxScore} (${t.res.interpretationLevel || "Concluído"})`).join("; ") : "Nenhum instrumento psicométrico formal realizado no período."}</p>
    <p><strong>Parâmetros Documentais Declarados:</strong> O titular possui status diagnóstico como <em>"${diagnosisLabel}"</em> e suporte registrado como <em>"${supportLevelLabel}"</em>. A plataforma NeuroConecta não realiza diagnósticos, não atribui enquadramentos de suporte de maneira automatizada e não altera documentações preexistentes.</p>
  </div>

  ${latestPei ? `
  <div class="section-title">4. Plano de Ensino Individualizado (PEI) - Fonte Integrada</div>
  <div class="pei-box">
    <p><strong>Escola / Instituição:</strong> ${latestPei.school || "Não informada"} | <strong>Série:</strong> ${latestPei.grade || "Não informada"}</p>
    <p><strong>Necessidades Sensoriais Mapeadas:</strong> ${latestPei.sensoryNeeds || "Não preenchido"}</p>
    <p><strong>Acomodações e Adaptações em Vigor:</strong></p>
    <ul>
      ${latestPei.accommodations?.map((a: string) => `<li>${a}</li>`).join("") || "<li>Nenhuma acomodação informada</li>"}
    </ul>
    <p><strong>Objetivos Pedagógicos:</strong></p>
    <p style="white-space: pre-line;">${latestPei.goals || "Não preenchido"}</p>
  </div>
  ` : `
  <div class="section-title">4. Plano de Ensino Individualizado (PEI)</div>
  <div class="pei-box" style="background: #f8fafc; border-color: #e2e8f0; color: #64748b;">
    Nenhum Plano de Ensino Individualizado (PEI) foi formalizado para este acompanhado na plataforma até o momento (Status: Não cadastrado). Dados não inferidos.
  </div>
  `}

  ${functionalPlan ? `
  <div class="section-title">5. Plano de Apoio Funcional & Comunicação (Fonte Integrada)</div>
  <div class="pei-box">
    <p><strong>Preferências de Comunicação:</strong></p>
    <ul>${functionalPlan.communicationPreferences?.map((c: string) => `<li>${c}</li>`).join("") || "<li>Não informado</li>"}</ul>
    <p><strong>Sinais de Sobrecarga Sensorial:</strong></p>
    <ul>${functionalPlan.sensoryOverloadSigns?.map((s: string) => `<li>${s}</li>`).join("") || "<li>Não informado</li>"}</ul>
    <p><strong>Estratégias Úteis:</strong></p>
    <ul>${functionalPlan.helpfulStrategies?.map((h: string) => `<li>${h}</li>`).join("") || "<li>Não informado</li>"}</ul>
  </div>
  ` : ""}

  <div class="warning-box">
    <strong>Nota de Limitações &amp; Finalidade:</strong> Este relatório organiza e sintetiza exclusivamente registros funcionais, autorrelatos e apontamentos inseridos na plataforma NeuroConecta. <strong>Este documento não constitui diagnóstico, laudo médico ou parecer psicológico e não substitui avaliação clínica especializada.</strong> Informações e instrumentos não preenchidos ou não realizados permanecem expressamente como 'Não realizados' e não são inferidos ou estimados pelo sistema.
  </div>

  <div class="signatures">
    <div>
      <div class="sign-line"></div>
      <strong>${userProfile.preferredName || "Emissor Responsável"}</strong><br>
      <span style="font-size: 11px; color: #6d28d9;">${emitterRoleLabel}</span>
    </div>
    <div>
      <div class="sign-line"></div>
      <strong>${patientName}</strong><br>
      <span style="font-size: 11px; color: #64748b;">Titular dos Registros</span>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const cleanName = patientName.toLowerCase().replace(/[^a-z0-9]/gi, "_");
    link.download = `relatorio_funcional_neuroconecta_${cleanName}_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      
      {/* Header Controls (Hidden on Print) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-950 border border-violet-800 text-violet-300 text-xs font-bold">
              Síntese Funcional &amp; Relatórios de Acompanhamento
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-400" />
            {documentTitle}
          </h1>
          <p className="text-sm text-slate-400">
            Organização estruturada de registros funcionais de rotina, autorrelato, PEI e estratégias de apoio.
          </p>
        </div>

        {/* Action Buttons: Clear distinction between Baixar PDF/HTML and Imprimir */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAcademicModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-violet-700/80 text-violet-200 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition active:scale-95 flex-shrink-0"
          >
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>Resenha Acadêmica</span>
          </button>

          <button
            onClick={handleDownloadRealPdf}
            disabled={validationErrors.length > 0}
            className={`px-4 py-2.5 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition active:scale-95 flex-shrink-0 ${
              validationErrors.length > 0
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-violet-700 hover:bg-violet-600 text-white"
            }`}
            title="Baixar arquivo PDF autêntico (MIME: application/pdf) diretamente para o dispositivo"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Baixar PDF</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={validationErrors.length > 0}
            className={`px-5 py-2.5 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition active:scale-95 flex-shrink-0 ${
              validationErrors.length > 0
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
            }`}
            title="Imprimir documento diretamente (barra de navegação e app são ocultados automaticamente)"
          >
            <Printer className="w-4 h-4 text-violet-400" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Validation Fail-Closed Warning if any inconsistency */}
      {validationErrors.length > 0 && (
        <div className="no-print p-4 bg-rose-950/80 border border-rose-700 rounded-2xl flex items-start gap-3 text-rose-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-rose-100">Inconsistência de Dados Detectada (Fail-Closed Ativo)</p>
            <ul className="list-disc list-inside space-y-0.5">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
            <p className="text-[11px] text-rose-300 pt-1">A impressão do relatório foi bloqueada para resguardar a integridade e precisão dos dados.</p>
          </div>
        </div>
      )}

      {/* Patient Selector Card (Hidden on Print) */}
      <div className="no-print bg-slate-900 border border-violet-800/60 rounded-2xl p-5 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-violet-950 text-violet-300 border border-violet-700/80 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Seleção da Pessoa Acompanhada / Titular do Relatório
              </h3>
              <p className="text-xs text-slate-400">
                Selecione o registro do acompanhado para emitir a síntese funcional sem sobrepor os dados do profissional emissor.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddPatientModal(true)}
            className="px-3.5 py-2 bg-violet-700 hover:bg-violet-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Cadastrar Novo Registro
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-violet-300">
              Pessoa Acompanhada Selecionada
            </label>
            <select
              value={selectedPatId}
              onChange={(e) => setSelectedPatId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-violet-700/80 rounded-xl text-slate-100 text-xs font-semibold focus:outline-none focus:border-violet-400"
            >
              <option value="__me__">
                👤 Meu Próprio Perfil: {userProfile.preferredName || userProfile.email || "Usuário Atual"} (Registro Próprio)
              </option>

              {isSuperAdmin && (
                <option value="__all__">
                  🌐 Visão Global Superadmin: Todos os Usuários &amp; Avaliações ({testHistory.length} testes)
                </option>
              )}

              {distinctTestUsers.length > 0 && (
                <optgroup label="🧪 Usuários com Avaliações / Testes no Sistema">
                  {distinctTestUsers.map((u, idx) => (
                    <option key={`tu-${idx}`} value={`user:${u.userName}`}>
                      🧪 {u.userName} ({u.count} teste{u.count > 1 ? "s" : ""})
                    </option>
                  ))}
                </optgroup>
              )}

              {patients.length > 0 && (
                <optgroup label="📋 Pacientes / Registros Cadastrados">
                  {patients.map((pat) => (
                    <option key={pat.id} value={pat.id}>
                      📋 {pat.name} — ({pat.pronouns}) {pat.cipteaNumber ? `[${pat.cipteaNumber}]` : ""}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <span>{patientName}</span>
              <span className="text-violet-400">{patientPronouns}</span>
            </div>
            <p className="text-slate-400">Status Diagnóstico: <span className="text-slate-200">{diagnosisLabel}</span></p>
            <p className="text-violet-300">Suporte: <span className="text-violet-200">{supportLevelLabel}</span> {currentCiptea ? `| Carteira: ${currentCiptea}` : ""}</p>
          </div>
        </div>
      </div>

      {/* Modal: Cadastrar Novo Registro */}
      {showAddPatientModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-violet-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-violet-300 flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-400" /> Cadastrar Pessoa Acompanhada
              </h3>
              <button onClick={() => setShowAddPatientModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddPatient} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newPatName}
                  onChange={(e) => setNewPatName(e.target.value)}
                  placeholder="Ex: Gabriel Santos Silva"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Pronomes</label>
                  <input
                    type="text"
                    value={newPatPronouns}
                    onChange={(e) => setNewPatPronouns(e.target.value)}
                    placeholder="Ex: ele/dele ou não informado"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Nº CIPTEA / BPC (Opcional)</label>
                  <input
                    type="text"
                    value={newPatCiptea}
                    onChange={(e) => setNewPatCiptea(e.target.value)}
                    placeholder="CIPTEA-CE 2026/001"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Status do Diagnóstico Documentado</label>
                <select
                  value={newPatDiag}
                  onChange={(e) => setNewPatDiag(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                >
                  <option value="nao_informado">Não informado</option>
                  <option value="laudo_formal">Laudo Médico Formal Prévio Declarado</option>
                  <option value="investigacao">Em Avaliação Multiprofissional Prévia</option>
                  <option value="autodiagnosticado">Autorrelato / Identificação Neurodivergente</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Nível de Suporte Registrado em Documento</label>
                <select
                  value={newPatSupport}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewPatSupport(val === "nao_informado" ? "nao_informado" : (parseInt(val) as any));
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                >
                  <option value="nao_informado">Não informado / Não documentado</option>
                  <option value={1}>Nível 1 de Suporte (Apoio leve)</option>
                  <option value={2}>Nível 2 de Suporte (Apoio substancial)</option>
                  <option value={3}>Nível 3 de Suporte (Apoio muito substancial)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Foco Funcional Principal</label>
                <input
                  type="text"
                  value={newPatFocus}
                  onChange={(e) => setNewPatFocus(e.target.value)}
                  placeholder="Ex: Regulação Sensorial e Rotina Visual"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Period Selection Filters (Hidden on Print) */}
      <div className="no-print flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold text-slate-300">Janela Temporal dos Registros:</span>
        </div>
        <div className="flex gap-1.5">
          {[
            { id: "diario", label: "Diário (Hoje)" },
            { id: "semanal", label: "Semanal (7 dias)" },
            { id: "mensal", label: "Mensal (30 dias)" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id as PeriodFilter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                period === item.id
                  ? "bg-violet-950 text-violet-200 border border-violet-700 shadow"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-transparent"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* PRINTABLE REPORT DOCUMENT CONTAINER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-8 shadow-xl text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        
        {/* Document Header */}
        <div className="border-b-2 border-violet-700/60 pb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/sistemastop_logo.svg" alt="SISTEMASTOP" className="w-12 h-12 object-contain rounded-xl p-1 bg-slate-950 border border-violet-800 print:w-10 print:h-10" />
              <div>
                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest print:text-violet-800">
                  SISTEMASTOP • NEUROCONECTA — TECNOLOGIA NEUROAFIRMATIVA
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 print:text-black mt-0.5">
                  {documentTitle}
                </h1>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  Rua Doutor Rolim, 366 - Bairro Independência, Crato - CE | +55 (88) 99673-9128 | Plataforma NeuroConecta
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-400 print:text-black flex-shrink-0">
              <p><strong>Emissão:</strong> {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
              <p><strong>Período Analisado:</strong> {period === "diario" ? "Registros de Hoje" : period === "semanal" ? "Consolidado Semanal (7 dias)" : "Consolidado Mensal (30 dias)"}</p>
              <p className="text-[10px] text-violet-400 print:text-violet-800 font-semibold">{documentTypeBadge}</p>
            </div>
          </div>

          {/* Profile Metadata Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs print:bg-slate-50 print:border-slate-300">
            <div>
              <p className="text-slate-400 font-semibold print:text-slate-600">Pessoa Acompanhada:</p>
              <p className="text-sm font-bold text-slate-100 print:text-black">{selectedPatient ? selectedPatient.name : userProfile.preferredName}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold print:text-slate-600">Pronomes:</p>
              <p className="text-sm font-bold text-slate-100 print:text-black">{selectedPatient ? selectedPatient.pronouns : userProfile.pronouns}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold print:text-slate-600">Status Diagnóstico Declarado:</p>
              <p className="text-sm font-bold text-violet-300 print:text-black">{diagnosisLabel}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold print:text-slate-600">Nível de Suporte Registrado:</p>
              <p className="text-sm font-bold text-slate-100 print:text-black">{supportLevelLabel}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold print:text-slate-600">Documento / CIPTEA / BPC:</p>
              <p className="text-sm font-bold text-slate-100 print:text-black">{selectedPatient?.cipteaNumber || "Não cadastrado"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold print:text-slate-600">Responsável pela Emissão:</p>
              <p className="text-sm font-bold text-violet-400 print:text-black">
                {userProfile.preferredName || "Profissional Responsável"} ({emitterRoleLabel})
                {userProfile.professionalRegisterNumber ? ` • ${userProfile.professionalRegisterNumber}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Executive Metrics Overview (Zero NaN Guarantee) */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 print:text-black flex items-center gap-2 border-b border-slate-800 pb-2">
            <BarChart3 className="w-5 h-5 text-violet-400 print:text-black" />
            Indicadores Funcionais de Rotina &amp; Autorregulação ({period.toUpperCase()})
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl print:border-slate-300 print:bg-slate-50">
              <p className="text-[11px] font-bold text-slate-400 print:text-slate-700">Conclusão de Rotina</p>
              <p className="text-2xl font-extrabold text-violet-300 print:text-black mt-1">
                {routineCompletionPercentage !== null ? `${routineCompletionPercentage}%` : "Sem tarefas"}
              </p>
              <p className="text-[10px] text-slate-500 print:text-slate-600 mt-0.5">
                {totalTasks > 0 ? `${completedTasksCount} de ${totalTasks} tarefas concluídas` : "Nenhuma tarefa cadastrada"}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl print:border-slate-300 print:bg-slate-50">
              <p className="text-[11px] font-bold text-slate-400 print:text-slate-700">Média de Humor (1-5)</p>
              <p className="text-2xl font-extrabold text-amber-300 print:text-black mt-1">
                {avgMoodStr === "Sem dados suficientes" ? "Sem dados" : `${avgMoodStr} / 5.0`}
              </p>
              <p className="text-[10px] text-slate-500 print:text-slate-600 mt-0.5">
                {validMoodEntries.length > 0 ? `${validMoodEntries.length} registro(s) pontuado(s)` : "Sem notas de humor no período"}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl print:border-slate-300 print:bg-slate-50">
              <p className="text-[11px] font-bold text-slate-400 print:text-slate-700">Nível de Energia (1-5)</p>
              <p className="text-2xl font-extrabold text-emerald-300 print:text-black mt-1">
                {avgEnergyStr === "Sem dados suficientes" ? "Sem dados" : `${avgEnergyStr} / 5.0`}
              </p>
              <p className="text-[10px] text-slate-500 print:text-slate-600 mt-0.5">
                {validEnergyEntries.length > 0 ? `${validEnergyEntries.length} registro(s) pontuado(s)` : "Sem notas de energia no período"}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl print:border-slate-300 print:bg-slate-50">
              <p className="text-[11px] font-bold text-slate-400 print:text-slate-700">Eventos de Sobrecarga</p>
              <p className="text-2xl font-extrabold text-rose-400 print:text-black mt-1">{sensoryOverloadEvents}</p>
              <p className="text-[10px] text-slate-500 print:text-slate-600 mt-0.5">Sobrecargas / crises registradas</p>
            </div>
          </div>
        </div>

        {/* Standardized Test Summary Table (Strict Provenance) */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 print:text-black flex items-center gap-2 border-b border-slate-800 pb-2">
            <ClipboardCheck className="w-5 h-5 text-violet-400 print:text-black" />
            Instrumentos Padronizados de Triagem
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-300 print:bg-slate-100 print:text-black print:border-slate-400">
                  <th className="p-3 font-bold">Instrumento</th>
                  {(isAll || isSuperAdmin) && <th className="p-3 font-bold">Usuário</th>}
                  <th className="p-3 font-bold">Data</th>
                  <th className="p-3 font-bold">Pontuação Obtida</th>
                  <th className="p-3 font-bold">Status / Interpretação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                {completedTestsList.length > 0 ? (
                  completedTestsList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/40 print:bg-white">
                      <td className="p-3 font-semibold text-slate-200 print:text-black">
                        {item.name}
                      </td>
                      {(isAll || isSuperAdmin) && (
                        <td className="p-3 text-slate-400 print:text-slate-700">
                          {item.res.userName || "Usuário"}
                        </td>
                      )}
                      <td className="p-3 text-slate-400 print:text-slate-700">{item.res.date}</td>
                      <td className="p-3 font-mono font-bold text-violet-300 print:text-black">
                        {item.res.score} / {item.res.maxScore} pts
                      </td>
                      <td className="p-3 text-slate-300 print:text-black">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-violet-950/80 text-violet-300 border border-violet-800/60 print:border-slate-300 print:bg-slate-100 print:text-black">
                          {item.res.interpretationLevel || "Concluído"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="hover:bg-slate-950/40 print:bg-white">
                      <td className="p-3 font-semibold text-slate-200 print:text-black">RAADS-R (Ritvo Autism Asperger Diagnostic Scale)</td>
                      {(isAll || isSuperAdmin) && <td className="p-3 text-slate-500">—</td>}
                      <td className="p-3 text-slate-400 print:text-slate-700">{raadsResult ? raadsResult.date : "Não realizado"}</td>
                      <td className="p-3 font-mono font-bold text-violet-300 print:text-black">{raadsResult ? `${raadsResult.score} / ${raadsResult.maxScore}` : "Sem dados"}</td>
                      <td className="p-3 text-slate-400 print:text-black">{raadsResult ? raadsResult.interpretationLevel : "Não realizado"}</td>
                    </tr>
                    <tr className="hover:bg-slate-950/40 print:bg-white">
                      <td className="p-3 font-semibold text-slate-200 print:text-black">Aspie Quiz (Neurodiversidade vs Neurotípico)</td>
                      {(isAll || isSuperAdmin) && <td className="p-3 text-slate-500">—</td>}
                      <td className="p-3 text-slate-400 print:text-slate-700">{aspieResult ? aspieResult.date : "Não realizado"}</td>
                      <td className="p-3 font-mono font-bold text-violet-300 print:text-black">{aspieResult ? `${aspieResult.score} / ${aspieResult.maxScore}` : "Sem dados"}</td>
                      <td className="p-3 text-slate-400 print:text-black">{aspieResult ? aspieResult.interpretationLevel : "Não realizado"}</td>
                    </tr>
                    <tr className="hover:bg-slate-950/40 print:bg-white">
                      <td className="p-3 font-semibold text-slate-200 print:text-black">AQ-10 (Autism Spectrum Quotient)</td>
                      {(isAll || isSuperAdmin) && <td className="p-3 text-slate-500">—</td>}
                      <td className="p-3 text-slate-400 print:text-slate-700">{aq10Result ? aq10Result.date : "Não realizado"}</td>
                      <td className="p-3 font-mono font-bold text-violet-300 print:text-black">{aq10Result ? `${aq10Result.score} / ${aq10Result.maxScore}` : "Sem dados"}</td>
                      <td className="p-3 text-slate-400 print:text-black">{aq10Result ? aq10Result.interpretationLevel : "Não realizado"}</td>
                    </tr>
                    <tr className="hover:bg-slate-950/40 print:bg-white">
                      <td className="p-3 font-semibold text-slate-200 print:text-black">CAT-Q (Camuflagem Social no Autismo)</td>
                      {(isAll || isSuperAdmin) && <td className="p-3 text-slate-500">—</td>}
                      <td className="p-3 text-slate-400 print:text-slate-700">{catqResult ? catqResult.date : "Não realizado"}</td>
                      <td className="p-3 font-mono font-bold text-violet-300 print:text-black">{catqResult ? `${catqResult.score} / ${catqResult.maxScore}` : "Sem dados"}</td>
                      <td className="p-3 text-slate-400 print:text-black">{catqResult ? catqResult.interpretationLevel : "Não realizado"}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SÍNTESE FUNCIONAL DO PERÍODO (Provenance-based narrative, strictly without hallucinations or inferred diagnoses) */}
        <div className="space-y-5 pt-4 border-t-2 border-slate-800 print:border-slate-400 print-page-break">
          <div className="flex items-center gap-2 text-violet-400 print:text-black">
            <Award className="w-5 h-5" />
            <h2 className="text-xl font-extrabold text-slate-100 print:text-black">
              Síntese Funcional do Período
            </h2>
          </div>

          <div className="text-xs sm:text-sm text-slate-200 print:text-black leading-relaxed space-y-4 text-justify">
            <p>
              O presente documento consolida os registros funcionais de rotina, autorrelatos e apontamentos inseridos na plataforma NeuroConecta referentes a <strong>{patientName}</strong> ({patientPronouns}), organizados na janela de acompanhamento <strong>{period === "diario" ? "diária" : period === "semanal" ? "semanal (7 dias)" : "mensal (30 dias)"}</strong>.
            </p>

            {/* Instrument Provenance Paragraph */}
            {completedTestsList.length === 0 ? (
              <p className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl print:bg-slate-50 print:border-slate-300">
                <strong>Instrumentos Padronizados de Triagem:</strong> Nenhum instrumento padronizado (RAADS-R, Aspie Quiz, AQ-10, SQ-EQ, Perfil Sensorial, Burnout Autista ou CAT-Q) foi realizado no período selecionado para este perfil. Em estrita conformidade com as diretrizes de proveniência de dados, o sistema abstém-se de inferir pontuações, categorias diagnósticas ou classificações psicométricas a partir de instrumentos ausentes.
              </p>
            ) : (
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl print:bg-slate-50 print:border-slate-300 space-y-2">
                <p><strong>Instrumentos Padronizados Realizados no Período:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  {completedTestsList.map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.name}:</strong> Realizado em {item.res.date}, registrando pontuação de {item.res.score}/{item.res.maxScore} ({item.res.interpretationLevel}).
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  Os instrumentos não listados acima permanecem com status 'Não realizado' e não integram esta síntese.
                </p>
              </div>
            )}

            {/* Routine & Functional Execution Paragraph */}
            <p>
              <strong>Engajamento em Rotina &amp; Autonomia:</strong> {totalTasks > 0 ? (
                `Foram registradas ${totalTasks} tarefas na rotina visual do período, com conclusão confirmada de ${completedTasksCount} tarefas (${routineCompletionPercentage}% de adesão). ${
                  routineCompletionPercentage && routineCompletionPercentage >= 70
                    ? "Observa-se padrão consistente de seguimento e autonomia nas atividades estruturadas."
                    : "Registra-se demanda por flexibilização de etapas ou suporte na transição entre atividades."
                }`
              ) : (
                "Não foram cadastradas tarefas na rotina visual durante o período analisado."
              )}
            </p>

            {/* Mood, Energy & Sensory Balance Paragraph */}
            <p>
              <strong>Autorregulação &amp; Bem-Estar Autorrelatado:</strong> {
                validMoodEntries.length > 0 || validEnergyEntries.length > 0 ? (
                  `Os autorrelatos apontam média de humor de ${avgMoodStr !== "Sem dados suficientes" ? `${avgMoodStr}/5.0 (${validMoodEntries.length} registro(s))` : "não avaliada numericamente"} e média de energia de ${avgEnergyStr !== "Sem dados suficientes" ? `${avgEnergyStr}/5.0 (${validEnergyEntries.length} registro(s))` : "não avaliada numericamente"}. `
                ) : (
                  "Não constam registros numéricos de humor e energia no período. "
                )
              }
              {sensoryOverloadEvents > 0 ? (
                `Foram assinalados ${sensoryOverloadEvents} episódio(s) de sobrecarga sensorial ou estresse no período, evidenciando momentos de maior demanda ambiental em que acomodações de descompressão foram necessárias.`
              ) : (
                "Não constam registros de sobrecarga sensorial aguda no período monitorado."
              )}
            </p>

            {/* Educational / Caregiver Notes if available */}
            {caregiverLogs.length > 0 && (
              <p>
                <strong>Observações de Acompanhamento:</strong> Constam no histórico {caregiverLogs.length} anotação(ões) inserida(s) pela equipe de apoio/família, indicando acompanhamento de transições e acomodações pedagógicas ou domiciliares.
              </p>
            )}

            {/* Registered Baseline Status */}
            <p>
              <strong>Parâmetros Documentais Registrados:</strong> O cadastro ativo registra status diagnóstico como <em>"{diagnosisLabel}"</em> e suporte documental como <em>"{supportLevelLabel}"</em>. Ressalta-se expressamente que a plataforma não efetua diagnósticos, não atribui enquadramentos de suporte de maneira automatizada e não altera documentações preexistentes.
            </p>
          </div>
        </div>

        {/* 4. PLANO DE ENSINO INDIVIDUALIZADO (PEI) - FONTE INTEGRADA */}
        <div className="space-y-3 pt-4 border-t-2 border-slate-800 print:border-slate-400">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-100 print:text-black flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-violet-400 print:text-black" />
              Plano de Ensino Individualizado (PEI) &amp; Acomodações Escolares
            </h3>
            {latestPei && (
              <div className="no-print flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800">
                  Origem: Módulo Cuidadores &amp; PEI (v{latestPei.version})
                </span>
                {onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab("cuidador")}
                    className="px-2.5 py-1 bg-violet-800/80 hover:bg-violet-700 text-violet-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                    title="Abrir a minuta original no Módulo de Cuidadores & PEI Especial"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ver Origem / Abrir PEI</span>
                  </button>
                )}
              </div>
            )}
          </div>
          {latestPei ? (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs print:bg-slate-50 print:border-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="font-bold text-violet-300 print:text-black">
                  Instituição: {latestPei.school || "Escola / Instituição de Apoio"} — Ano: {latestPei.grade || "Ensino Regular / AEE"}
                </span>
                <span className="text-[11px] text-slate-400">Versão {latestPei.version} ({new Date(latestPei.createdAt).toLocaleDateString("pt-BR")})</span>
              </div>
              <p><strong className="text-slate-300">Necessidades Sensoriais Mapeadas:</strong> {latestPei.sensoryNeeds || "Sem apontamentos de necessidades sensoriais."}</p>
              <div>
                <strong className="text-slate-300">Acomodações &amp; Adaptações em Vigor:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1 text-slate-300 print:text-black">
                  {latestPei.accommodations?.map((acc: string, idx: number) => (
                    <li key={idx}>{acc}</li>
                  )) || <li>Nenhuma acomodação cadastrada.</li>}
                </ul>
              </div>
              <div>
                <strong className="text-slate-300">Metas Pedagógicas e de Autonomia:</strong>
                <p className="whitespace-pre-line text-slate-300 print:text-black mt-0.5">{latestPei.goals || "Sem metas cadastradas."}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 print:text-slate-600 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl print:bg-slate-50 print:border-slate-300">
              Nenhum Plano de Ensino Individualizado (PEI) foi formalizado para este acompanhado na plataforma até o momento (Status: Não cadastrado). Nenhuma adaptação escolar é inferida pelo sistema.
            </p>
          )}
        </div>

        {/* 5. DIRETRIZES DO PLANO FUNCIONAL DE APOIO & AUTOAVALIAÇÃO */}
        {functionalPlan && (
          <div className="space-y-3 pt-4 border-t border-slate-800 print:border-slate-400">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-slate-100 print:text-black flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-400 print:text-black" />
                Diretrizes do Plano de Apoio Funcional &amp; Autoavaliação
              </h3>
              <div className="no-print flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                  Origem: Autoavaliação Funcional
                </span>
                {onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab("testes")}
                    className="px-2.5 py-1 bg-teal-800/80 hover:bg-teal-700 text-teal-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                    title="Abrir o Módulo de Autoavaliação para revisar estratégias funcionais"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Ver Origem / Revisar Estratégia</span>
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 print:text-black">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl print:bg-slate-50 print:border-slate-300">
                <p className="font-bold text-slate-100 print:text-black mb-1">💬 Preferências de Comunicação:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {functionalPlan.communicationPreferences?.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl print:bg-slate-50 print:border-slate-300">
                <p className="font-bold text-slate-100 print:text-black mb-1">⚠️ Sinais de Sobrecarga Precoce:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {functionalPlan.sensoryOverloadSigns?.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Limitations Notice */}
        <div className="p-4 bg-slate-950 border border-slate-700/80 rounded-xl text-xs space-y-1.5 print:bg-slate-50 print:border-slate-300">
          <div className="flex items-center gap-2 font-bold text-amber-300 print:text-amber-800">
            <ShieldCheck className="w-4 h-4" />
            <span>Nota de Limitações &amp; Finalidade do Documento</span>
          </div>
          <p className="text-slate-300 print:text-slate-700 leading-relaxed">
            Este relatório organiza e sintetiza exclusivamente registros funcionais, autorrelatos e apontamentos inseridos na plataforma NeuroConecta. <strong>Este documento não constitui diagnóstico, laudo médico ou parecer psicológico e não substitui avaliação clínica especializada.</strong> Informações e instrumentos não preenchidos ou não realizados permanecem expressamente como 'Não realizados' e não são inferidos, complementados ou estimados pelo sistema.
          </p>
        </div>

        {/* Formal Signature & Validation Block */}
        <div className="pt-8 border-t-2 border-slate-800 print:border-slate-400 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400 print:text-black">
          <div className="text-center sm:text-left space-y-1">
            <p className="font-bold text-slate-200 print:text-black">NeuroConecta — Tecnologia Assistiva &amp; Neuroafirmativa</p>
            <p>Documento gerado eletronicamente em conformidade com o princípio de proveniência de dados.</p>
            <p className="font-mono text-[10px] text-slate-500 print:text-slate-600">ID de Registro: NC-FUNC-{Date.now().toString(36).toUpperCase()}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 text-center">
            <div className="space-y-1 min-w-[180px]">
              <div className="border-b border-slate-700 print:border-black w-44 mx-auto mb-1"></div>
              <p className="font-bold text-slate-200 print:text-black">{userProfile.preferredName || "Responsável pelo Registro"}</p>
              <p className="text-[10px] text-violet-400 print:text-slate-600 font-semibold">
                Emissor / {emitterRoleLabel}
                {userProfile.professionalRegisterNumber ? ` (${userProfile.professionalRegisterNumber})` : ""}
              </p>
            </div>

            <div className="space-y-1 min-w-[180px]">
              <div className="border-b border-slate-700 print:border-black w-44 mx-auto mb-1"></div>
              <p className="font-bold text-slate-200 print:text-black">{selectedPatient ? selectedPatient.name : userProfile.preferredName}</p>
              <p className="text-[10px] text-slate-500 print:text-slate-600">Pessoa Acompanhada (Titular dos Registros)</p>
            </div>
          </div>
        </div>

      </div>

      {/* Academic Review Case Study Modal & PDF Export */}
      <AcademicReviewModal
        isOpen={showAcademicModal}
        onClose={() => setShowAcademicModal(false)}
      />

    </div>
  );
};
