import React, { useState, useEffect } from "react";
import { 
  Stethoscope, 
  FileText, 
  Activity, 
  Pill, 
  ShieldAlert, 
  Plus, 
  Printer, 
  Copy, 
  Check, 
  UserCheck, 
  HeartPulse, 
  Sparkles, 
  ClipboardList,
  AlertTriangle,
  Brain,
  FileCheck,
  Users,
  Calendar
} from "lucide-react";
import { calculateAge, getAgeCategory } from "../types";

interface PatientGlobal {
  id: string;
  name: string;
  email?: string;
  birthDate?: string;
  ageCategory?: string;
  pronouns?: string;
  diagnosisStatus?: string;
  supportLevel?: number | string;
  cpf?: string;
  cipteaNumber?: string;
}

interface CapsHealthHubProps {
  isDark?: boolean;
  patientName?: string;
}

export const CapsHealthHub: React.FC<CapsHealthHubProps> = ({ 
  isDark = false,
  patientName = "Paciente em Acompanhamento"
}) => {
  const [activeTab, setActiveTab] = useState<"prontuario" | "escalas" | "protocolo_crise" | "receituario">("prontuario");

  // Global patients list
  const [globalPatients, setGlobalPatients] = useState<PatientGlobal[]>(() => {
    try {
      const stored = localStorage.getItem("neuroconecta_global_patients");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [selectedPatId, setSelectedPatId] = useState<string>(globalPatients[0]?.id || "");
  const selectedPatient = globalPatients.find(p => p.id === selectedPatId) || globalPatients[0];

  // --- PRONTUÁRIO & EVOLUÇÃO STATE ---
  const [patientId, setPatientId] = useState(selectedPatient?.id || "CAPS-ND-001");
  const [patientDisplayName, setPatientDisplayName] = useState(selectedPatient?.name || patientName);
  const [patientBirthDate, setPatientBirthDate] = useState(selectedPatient?.birthDate || "2000-01-01");
  const [patientCpf, setPatientCpf] = useState(selectedPatient?.cpf || "000.000.000-00");
  const [professionalName, setProfessionalName] = useState("Dr(a). Médico(a) / Enf. CAPS");
  const [professionalCrm, setProfessionalCrm] = useState("CRM/COREN 123456-CE");

  useEffect(() => {
    if (selectedPatient) {
      setPatientDisplayName(selectedPatient.name);
      setPatientId(selectedPatient.id);
      if (selectedPatient.birthDate) setPatientBirthDate(selectedPatient.birthDate);
      if (selectedPatient.cpf) setPatientCpf(selectedPatient.cpf);
    }
  }, [selectedPatId, selectedPatient]);

  const [evolutions, setEvolutions] = useState<{ id: string; date: string; type: string; notes: string; professional: string }[]>(() => {
    try {
      const stored = localStorage.getItem("neuroconecta_caps_evolutions");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("neuroconecta_caps_evolutions", JSON.stringify(evolutions));
    } catch (e) {
      console.error(e);
    }
  }, [evolutions]);

  const [newNote, setNewNote] = useState("");
  const [newNoteType, setNewNoteType] = useState("Evolução Médica");

  const handleAddEvolution = () => {
    if (!newNote.trim()) return;
    setEvolutions([
      {
        id: `ev-${Date.now()}`,
        date: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        type: newNoteType,
        notes: newNote.trim(),
        professional: professionalName,
      },
      ...evolutions,
    ]);
    setNewNote("");
  };

  // --- ESCALAS DIAGNÓSTICAS (ASRS-18 TDAH & M-CHAT Rastreio TEA) ---
  const [asrsScore, setAsrsScore] = useState(14);
  const [sensoryOverloadLevel, setSensoryOverloadLevel] = useState("Moderado");
  const [laudoSummary, setLaudoSummary] = useState(
    `Paciente ${patientName}, cadastro ${patientId}, em acompanhamento no CAPS. Apresenta quadro compatível com Transtorno do Espectro Autista (TEA Nível 2) associado a TDAH. Requer acompanhamento multiprofissional, acomodações sensoriais na rotina diária e suporte para regulação neurodivergente.`
  );
  const [copiedReport, setCopiedReport] = useState(false);

  // --- MEDICAMENTOS ATIVOS ---
  const [medications, setMedications] = useState<{ id: string; name: string; dosage: string; schedule: string; purpose: string }[]>(() => {
    try {
      const stored = localStorage.getItem("neuroconecta_caps_medications");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("neuroconecta_caps_medications", JSON.stringify(medications));
    } catch (e) {
      console.error(e);
    }
  }, [medications]);
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedSchedule, setNewMedSchedule] = useState("");
  const [newMedPurpose, setNewMedPurpose] = useState("");

  const handleAddMedication = () => {
    if (!newMedName.trim() || !newMedDosage.trim()) return;
    setMedications([
      ...medications,
      {
        id: `m-${Date.now()}`,
        name: newMedName.trim(),
        dosage: newMedDosage.trim(),
        schedule: newMedSchedule.trim() || "Conforme prescrição",
        purpose: newMedPurpose.trim() || "Uso contínuo",
      }
    ]);
    setNewMedName("");
    setNewMedDosage("");
    setNewMedSchedule("");
    setNewMedPurpose("");
  };

  const generateFormattedMedicalReport = () => {
    return `=====================================================
RELATÓRIO CLÍNICO & PARECER DE SAÚDE MENTAL (CAPS)
MINISTÉRIO DA SAÚDE / REDE DE ATENÇÃO PSICOSSOCIAL
=====================================================

DADOS DO PACIENTE:
• Nome do Paciente: ${patientDisplayName || patientName}
• Prontuário CAPS: ${patientId}
• Data de Nascimento: ${patientBirthDate} (${calculateAge(patientBirthDate) !== null ? `${calculateAge(patientBirthDate)} anos` : "Não informada"})
• CPF: ${patientCpf}

EQUIPE RESPONSÁVEL:
• Profissional: ${professionalName}
• Registro Profissional: ${professionalCrm}
• Unidade: CAPS - Centro de Atenção Psicossocial

AVALIAÇÃO E DIAGNÓSTICO SINTÉTICO:
${laudoSummary}

ESCALAS DE AVALIAÇÃO RÁPIDA:
• Rastreio TDAH (ASRS-18): ${asrsScore} / 18 pontos
• Nível de Vulnerabilidade a Sobreposição Sensorial: ${sensoryOverloadLevel}

PLANO TERAPÊUTICO SINGULAR (PTS) E MEDICAÇÕES:
${medications.map((m, i) => `${i + 1}. ${m.name} (${m.dosage}) - Horário: ${m.schedule} [${m.purpose}]`).join("\n")}

RECOMENDAÇÕES PARA REDE E BENEFÍCIOS (INSS/BPC/ESCOLA):
1. Garantia de ambiente de descompressão sensorial.
2. Manutenção de equipe multidisciplinar (Psiquiatria, Enfermagem, Psicologia, TO).
3. Concessão de laudo para isenção/acomodações conforme legislação de proteção à pessoa com deficiência (Lei Berenice Piana).

=====================================================
Emitido em ${new Date().toLocaleDateString("pt-BR")} via NeuroConecta Saúde Mental CAPS
=====================================================`;
  };

  const handleCopyReport = () => {
    const text = generateFormattedMedicalReport();
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family: monospace; font-size: 13px; padding: 24px; line-height: 1.5;">${generateFormattedMedicalReport()}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fadeIn">
      
      {/* Banner Principal Saúde CAPS */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm transition ${
        isDark 
          ? "bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-cyan-800/60 text-slate-100" 
          : "bg-gradient-to-r from-cyan-900 via-teal-900 to-slate-900 text-white border-cyan-800"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span>Módulo Clínico • Médicos, Enfermeiros & Equipe CAPS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Acompanhamento de Saúde Mental CAPS
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed font-sans">
              Prontuário multiprofissional neuroafirmativo, triagem com escalas padronizadas, manejo humanizado de crises sensoriais e emissão de pareceres médicos/periciais.
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-cyan-700/50 rounded-2xl space-y-1 text-xs">
            <p className="text-cyan-300 font-bold flex items-center gap-1">
              <UserCheck className="w-4 h-4" /> Paciente Ativo:
            </p>
            <p className="font-extrabold text-white text-sm">{patientDisplayName}</p>
            <p className="text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{getAgeCategory(patientBirthDate)} ({calculateAge(patientBirthDate) !== null ? `${calculateAge(patientBirthDate)} anos` : "Sem data"})</span>
            </p>
            <p className="text-slate-300">Prontuário: <span className="font-mono text-cyan-300">{patientId}</span></p>
          </div>
        </div>
      </div>

      {/* Selector / Pescar Paciente Cadastrado */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span>Pescar Paciente / Cadastro Geral</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                {globalPatients.length} cadastrado(s)
              </span>
            </h3>
            <p className="text-xs text-slate-400">Selecione o paciente cadastrado no início para trazer seus dados automaticamente para o CAPS.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedPatId}
            onChange={(e) => setSelectedPatId(e.target.value)}
            className={`px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 transition ${
              isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
            }`}
          >
            {globalPatients.length === 0 ? (
              <option value="">Nenhum paciente cadastrado no momento</option>
            ) : (
              globalPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} • {getAgeCategory(p.birthDate)} ({calculateAge(p.birthDate) !== null ? `${calculateAge(p.birthDate)} anos` : "Idade N/A"})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: "prontuario", label: "Evolução & Prontuário CAPS", icon: ClipboardList, color: "text-teal-500" },
          { id: "escalas", label: "Escalas Diagnósticas & Laudo", icon: Brain, color: "text-amber-500" },
          { id: "protocolo_crise", label: "Protocolo Desescalada CAPS", icon: ShieldAlert, color: "text-rose-500" },
          { id: "receituario", label: "Prescrição & Medicamentos", icon: Pill, color: "text-cyan-500" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === tab.id
                ? "bg-cyan-700 text-white shadow-md"
                : isDark
                ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            {React.createElement(tab.icon, { className: `w-4 h-4 ${activeTab === tab.id ? "text-white" : tab.color}` })}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* --- TAB 1: EVOLUÇÃO & PRONTUÁRIO CAPS --- */}
      {activeTab === "prontuario" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-teal-500" />
                <span>Registro de Evolução do Atendimento CAPS</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Anotações multiprofissionais protegidas no prontuário individual do paciente.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                value={professionalName}
                onChange={(e) => setProfessionalName(e.target.value)}
                placeholder="Seu Nome / Profissão"
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl"
              />
              <input
                type="text"
                value={professionalCrm}
                onChange={(e) => setProfessionalCrm(e.target.value)}
                placeholder="Registro CRM/COREN/CRP"
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>

          {/* Form para Nova Evolução */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Registrar Nova Evolução Clínica
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={newNoteType}
                onChange={(e) => setNewNoteType(e.target.value)}
                className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl"
              >
                <option value="Evolução Médica">🩺 Evolução Médica / Psiquiatria</option>
                <option value="Evolução Enfermagem">💉 Evolução de Enfermagem</option>
                <option value="Atendimento Psicologia">🧠 Atendimento Psicológico</option>
                <option value="Terapia Ocupacional">🎨 Terapia Ocupacional (TO)</option>
                <option value="Acolhimento Noturno / Crise">🌙 Acolhimento Noturno / Crise</option>
              </select>

              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Código de Prontuário"
                className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl"
              />

              <button
                onClick={handleAddEvolution}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Anotar no Prontuário
              </button>
            </div>

            <textarea
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Descreva o quadro do paciente, adesão à medicação, nível de sobrecarga sensorial e encaminhamentos..."
              className="w-full p-3 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl focus:outline-none"
            />
          </div>

          {/* Histórico de Evoluções */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Histórico Recente de Atendimentos</h3>
            {evolutions.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 font-bold">
                      {item.type}
                    </span>
                    <span className="text-slate-400 font-mono">{item.date}</span>
                  </div>
                  <span className="text-slate-500 font-medium">{item.professional}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{item.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: ESCALAS DIAGNÓSTICAS & LAUDO SINTÉTICO --- */}
      {activeTab === "escalas" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-500" />
                <span>Escalas Rápidas & Emissão de Parecer Pericial</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gere resumos técnicos estruturados para requisição do BPC/LOAS, passe livre ou suporte escolar.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                {copiedReport ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReport ? "Copiado!" : "Copiar Parecer"}</span>
              </button>

              <button
                onClick={handlePrintReport}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Parecer CAPS</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Escala ASRS-18 */}
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <h3 className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Rastreio ASRS-18 (Sintomas de TDAH em Jovens/Adultos)
              </h3>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Pontuação estimada da escala:</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="18"
                    value={asrsScore}
                    onChange={(e) => setAsrsScore(Number(e.target.value))}
                    className="flex-1 accent-amber-500"
                  />
                  <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">{asrsScore} / 18</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                {asrsScore >= 12 
                  ? "⚠️ Alta probabilidade de perfil TDAH predominantemente desatento ou combinado."
                  : "Pontuação moderada de desatenção ou hiperfoco episódico."}
              </p>
            </div>

            {/* Sensibilidade Sensorial */}
            <div className="p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-3">
              <h3 className="text-xs font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Vulnerabilidade a Sobrecarga Sensorial
              </h3>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Grau de impacto hiper/hipossensorial:</label>
                <select
                  value={sensoryOverloadLevel}
                  onChange={(e) => setSensoryOverloadLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl"
                >
                  <option value="Leve">Leve (Sensível a ruídos específicos)</option>
                  <option value="Moderado">Moderado (Sobrecarga frequente em ambientes aglomerados)</option>
                  <option value="Severo">Severo (Risco constante de shutdown/meltdown com estresse auditivo)</option>
                </select>
              </div>
            </div>

          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold">Síntese Diagnóstica para Relatório:</label>
            <textarea
              rows={4}
              value={laudoSummary}
              onChange={(e) => setLaudoSummary(e.target.value)}
              className="w-full p-3.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl focus:outline-none font-sans"
            />
          </div>
        </div>
      )}

      {/* --- TAB 3: PROTOCOLO DE DESESCALADA NO CAPS --- */}
      {activeTab === "protocolo_crise" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="space-y-1 border-b pb-4 border-slate-200 dark:border-slate-800">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-xs font-bold">
              Protocolo Neuroafirmativo de Acolhimento em Crise (CAPS)
            </span>
            <h2 className="text-lg font-bold flex items-center gap-2 mt-1">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>Manejo Humanizado de Meltdown e Agitação no CAPS</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Diretrizes clínicas para evitar contenções invasivas, garantindo descalonamento sensorial e resguardo afetivo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
              <h3 className="font-bold text-rose-700 dark:text-rose-300 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Passos Obrigatórios para a Equipe de Saúde
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <li>• <strong>Redução Imediata de Estímulos:</strong> Desligar lâmpadas fluorescentes diretas e conduzir o paciente para a sala de descompressão.</li>
                <li>• <strong>Comunicação Mínima & Tom Neutro:</strong> Falar em tom baixo, sem confrontar ou fazer exigências acadêmicas/burocráticas no momento.</li>
                <li>• <strong>Uso de Abafador de Ruído e Manta de Peso:</strong> Oferecer objetos de conforto tátil sem forçar o contato físico.</li>
                <li>• <strong>Não Tratar Meltdown como 'Comportamento Agressivo Punitivo':</strong> Trata-se de uma resposta neurológica de sobrecarga involuntária.</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-teal-500/5 border border-teal-500/20 space-y-3">
              <h3 className="font-bold text-teal-700 dark:text-teal-300 text-sm flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-teal-500" />
                Protocolo de Resguardo Medicamentoso
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <li>• <strong>Ansiolítico de Resgate se Necessário:</strong> Apenas se houver risco autolesivo e se as medidas sensoriais não forem suficientes.</li>
                <li>• <strong>Monitoramento de Sinais Vitais:</strong> Checar PA e FC após 20 minutos de repouso no espaço escuro.</li>
                <li>• <strong>Acompanhamento Familiar:</strong> Informar o familiar/cuidador de forma acolhedora, sem gerar pânico.</li>
                <li>• <strong>Registro em Prontuário:</strong> Anotar os gatilhos identificados para revisão do Plano Terapêutico Singular (PTS).</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* --- TAB 4: PRESCRIÇÃO & MEDICAMENTOS --- */}
      {activeTab === "receituario" && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="space-y-1 border-b pb-4 border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Pill className="w-5 h-5 text-cyan-500" />
              <span>Gestão de Medicamentos & Adesão</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acompanhamento de esquemas terapêuticos e controle de efeitos adversos (sonolência, apetite, tremor).
            </p>
          </div>

          {/* Add Medication Form */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Adicionar Prescrição
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nome do Medicamento (Ex: Risperidona, Sertralina...)"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                className="px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl"
              />
              <input
                type="text"
                placeholder="Dosagem (Ex: 1mg, 10mg, 30mg...)"
                value={newMedDosage}
                onChange={(e) => setNewMedDosage(e.target.value)}
                className="px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl"
              />
              <input
                type="text"
                placeholder="Horário (Ex: Manhã, Aos sábados...)"
                value={newMedSchedule}
                onChange={(e) => setNewMedSchedule(e.target.value)}
                className="px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl"
              />
              <input
                type="text"
                placeholder="Indicação Principal (Ex: Foco, Ansiedade...)"
                value={newMedPurpose}
                onChange={(e) => setNewMedPurpose(e.target.value)}
                className="px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl"
              />
            </div>
            <button
              onClick={handleAddMedication}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Registrar Prescrição
            </button>
          </div>

          {/* Active Medications List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medicações em Uso Ativo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {medications.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{m.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-bold">
                      {m.dosage}
                    </span>
                  </div>
                  <p className="text-slate-500">⏰ Horário: <strong className="text-slate-700 dark:text-slate-300">{m.schedule}</strong></p>
                  <p className="text-slate-500">🎯 Objetivo: {m.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
