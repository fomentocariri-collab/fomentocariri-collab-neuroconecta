import React, { useState, useEffect } from "react";
import { 
  FolderPlus, 
  UserCheck, 
  Stethoscope, 
  Award, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Edit3,
  Archive,
  RefreshCw
} from "lucide-react";
import { 
  MusicotherapyCase, 
  MusicotherapyIndication, 
  MusicotherapistQualification 
} from "../../types/musicotherapy";
import { musicotherapyService } from "../../services/musicotherapyService";
import { auditService } from "../../services/auditService";

interface MusicTherapyCaseManagementProps {
  currentCase: MusicotherapyCase | null;
  onSelectCase: (c: MusicotherapyCase) => void;
  isDark?: boolean;
}

export const MusicTherapyCaseManagement: React.FC<MusicTherapyCaseManagementProps> = ({
  currentCase,
  onSelectCase,
  isDark = true,
}) => {
  const [cases, setCases] = useState<MusicotherapyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showIndicationModal, setShowIndicationModal] = useState(false);
  const [showQualificationModal, setShowQualificationModal] = useState(false);

  // Form states - Case
  const [patientName, setPatientName] = useState("");
  const [patientBirthDate, setPatientBirthDate] = useState("");
  const [patientPronouns, setPatientPronouns] = useState("ele/dele");
  const [patientCiptea, setPatientCiptea] = useState("");
  const [patientDiagnosis, setPatientDiagnosis] = useState("laudo_formal");
  const [professionalName, setProfessionalName] = useState("Musicoterapeuta Responsável");
  const [professionalRegister, setProfessionalRegister] = useState("CBO 2263-05 / UBAM 0412");

  // Form states - Indication
  const [prescriberName, setPrescriberName] = useState("");
  const [prescriberSpecialty, setPrescriberSpecialty] = useState("Neuropediatria");
  const [prescriberRegister, setPrescriberRegister] = useState("");
  const [indicationOrigin, setIndicationOrigin] = useState<MusicotherapyIndication["origin"]>("neuropediatria");
  const [recommendedFrequency, setRecommendedFrequency] = useState("1x por semana (50 minutos)");
  const [mentionedGoals, setMentionedGoals] = useState("");
  const [indicationNotes, setIndicationNotes] = useState("");

  // Form states - Qualification
  const [degree, setDegree] = useState("Bacharelado em Musicoterapia / Especialização em Neurodivergência");
  const [institution, setInstitution] = useState("Faculdade de Educação e Saúde");
  const [registerInfo, setRegisterInfo] = useState("CBO 2263-05 | Associação Estadual de Musicoterapia");

  // Feedback
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Load existing cases or initialize seed
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Tenta buscar do Supabase
      const remoteCases = await musicotherapyService.getCases();
      if (remoteCases.length > 0) {
        setCases(remoteCases);
        if (!currentCase) {
          onSelectCase(remoteCases[0]);
        }
      } else {
        // Fallback local caso ainda não haja dados no banco
        const local = localStorage.getItem("neuroconecta_mt_cases");
        if (local) {
          const parsed = JSON.parse(local);
          setCases(parsed);
          if (!currentCase && parsed.length > 0) onSelectCase(parsed[0]);
        } else {
          // Caso inicial padrão para demonstração clínica
          const seedCase: MusicotherapyCase = {
            id: "case-lucas-01",
            patient_id: "pat-lucas-01",
            patient_name: "Lucas Mendes Silva",
            patient_birth_date: "2018-04-12",
            patient_pronouns: "ele/dele",
            patient_ciptea: "CIPTEA-CE 2026/089",
            patient_diagnosis_status: "laudo_formal",
            professional_id: "prof-mt-01",
            professional_name: "Dra. Mariana Vasconcelos",
            professional_register: "CBO 2263-05 / UBAM 0341",
            start_date: "2026-02-10",
            status: "active",
            created_at: new Date().toISOString(),
            created_by: "prof-mt-01",
            updated_at: new Date().toISOString(),
            updated_by: "prof-mt-01",
          };
          setCases([seedCase]);
          onSelectCase(seedCase);
          localStorage.setItem("neuroconecta_mt_cases", JSON.stringify([seedCase]));
        }
      }
    } catch {
      // Ignora e usa fallback
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    const newCase: MusicotherapyCase = {
      id: `case-${Date.now().toString(36)}`,
      patient_id: `pat-${Date.now().toString(36)}`,
      patient_name: patientName.trim(),
      patient_birth_date: patientBirthDate || undefined,
      patient_pronouns: patientPronouns,
      patient_ciptea: patientCiptea.trim() || undefined,
      patient_diagnosis_status: patientDiagnosis,
      professional_id: "current-user",
      professional_name: professionalName.trim(),
      professional_register: professionalRegister.trim(),
      start_date: new Date().toISOString().split("T")[0],
      status: "active",
      created_at: new Date().toISOString(),
      created_by: "current-user",
      updated_at: new Date().toISOString(),
      updated_by: "current-user",
    };

    try {
      await musicotherapyService.saveCase(newCase);
    } catch {
      // Salva localmente se offline
    }

    const nextList = [newCase, ...cases];
    setCases(nextList);
    localStorage.setItem("neuroconecta_mt_cases", JSON.stringify(nextList));
    onSelectCase(newCase);
    setShowNewCaseModal(false);
    setPatientName("");
    setFeedbackMessage(`Prontuário de Musicoterapia criado para ${newCase.patient_name}`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Case Selection Card */}
      <div className={`p-6 rounded-2xl border shadow-md ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                Prontuário Ativo de Musicoterapia
              </span>
              <span className="text-xs text-slate-400">• Protocolo Clínico NC-MT1</span>
            </div>
            <h2 className="text-xl font-black mt-1 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {currentCase ? currentCase.patient_name : "Nenhum caso clínico selecionado"}
            </h2>
            <p className="text-xs text-slate-400">
              {currentCase?.patient_ciptea ? `CIPTEA: ${currentCase.patient_ciptea} | ` : ""}
              {currentCase?.patient_pronouns ? `Pronomes: ${currentCase.patient_pronouns} | ` : ""}
              Início do acompanhamento: {currentCase?.start_date || "Não definido"}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowNewCaseModal(true)}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <FolderPlus className="w-4 h-4" /> Novo Prontuário
            </button>
            <button
              onClick={() => setShowQualificationModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              title="Registro e Habilitação Profissional do Musicoterapeuta (CBO 2263-05)"
            >
              <Award className="w-4 h-4 text-amber-400" /> Habilitação Profissional
            </button>
          </div>
        </div>

        {/* Selected Case Quick Overview Grid */}
        {currentCase && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
            <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <span className="text-slate-400 font-semibold block">Musicoterapeuta Responsável:</span>
              <span className="font-bold text-slate-200">{currentCase.professional_name}</span>
              <span className="text-[11px] text-teal-400 block mt-0.5">{currentCase.professional_register || "CBO 2263-05"}</span>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <span className="text-slate-400 font-semibold block">Status Clínico do Prontuário:</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold uppercase tracking-wider text-emerald-400">
                  {currentCase.status === "active" ? "Acompanhamento Ativo" : currentCase.status}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Assinatura Eletrônica Habilitada</span>
            </div>

            <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Encaminhamento / Prescrição:</span>
                <button 
                  onClick={() => setShowIndicationModal(true)}
                  className="text-[11px] font-bold text-teal-400 hover:underline flex items-center gap-0.5"
                >
                  <Edit3 className="w-3 h-3" /> Detalhes
                </button>
              </div>
              <span className="font-bold text-slate-200 block mt-0.5">Neuropediatria / Saúde Mental</span>
              <span className="text-[11px] text-slate-500 block">Indicação clínica multidisciplinar vinculada</span>
            </div>
          </div>
        )}

        {/* Feedback alert */}
        {feedbackMessage && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-700 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Patient Selector Strip if multiple cases */}
      {cases.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
            Alternar Paciente:
          </span>
          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCase(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                currentCase?.id === c.id
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{c.patient_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Modal: Novo Prontuário */}
      {showNewCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-teal-400">
                <FolderPlus className="w-5 h-5" /> Abrir Prontuário de Musicoterapia
              </h3>
              <button onClick={() => setShowNewCaseModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome Completo da Pessoa Acompanhada *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Ex: Beatriz Lima Cavalcante"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={patientBirthDate}
                    onChange={(e) => setPatientBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pronomes de Preferência</label>
                  <input
                    type="text"
                    value={patientPronouns}
                    onChange={(e) => setPatientPronouns(e.target.value)}
                    placeholder="ela/dela, ele/dele"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nº CIPTEA / Documento</label>
                  <input
                    type="text"
                    value={patientCiptea}
                    onChange={(e) => setPatientCiptea(e.target.value)}
                    placeholder="CIPTEA-CE 2026/012"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status Diagnóstico</label>
                  <select
                    value={patientDiagnosis}
                    onChange={(e) => setPatientDiagnosis(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    <option value="laudo_formal">Laudo Médico Formal (TEA)</option>
                    <option value="investigacao">Em Avaliação Multidisciplinar</option>
                    <option value="autodiagnosticado">Identificação Neurodivergente</option>
                    <option value="nao_informado">Não informado</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <label className="block font-semibold text-slate-300 mb-1">Musicoterapeuta Responsável Técnico</label>
                <input
                  type="text"
                  value={professionalName}
                  onChange={(e) => setProfessionalName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 mb-2 focus:outline-none focus:border-teal-500"
                />
                <input
                  type="text"
                  value={professionalRegister}
                  onChange={(e) => setProfessionalRegister(e.target.value)}
                  placeholder="CBO 2263-05 / Registro Profissional"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md"
                >
                  Criar Prontuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Habilitação Profissional Musicoterapeuta */}
      {showQualificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-amber-400">
                <Award className="w-5 h-5" /> Habilitação Profissional do Musicoterapeuta
              </h3>
              <button onClick={() => setShowQualificationModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl text-[11px] text-amber-200 leading-relaxed">
              <strong>Classificação Brasileira de Ocupações (CBO 2263-05):</strong> A prática clínica de musicoterapia requer formação de nível superior (Graduação ou Especialização/Pós-Graduação Lato Sensu reconhecida pelo MEC). Os dados aqui inseridos conferem valor técnico e validade jurídica aos relatórios emitidos.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Titulação Acadêmica</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Instituição de Ensino Formadora</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Registro / Associação Profissional (UBAM ou Regional)</label>
                <input
                  type="text"
                  value={registerInfo}
                  onChange={(e) => setRegisterInfo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQualificationModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQualificationModal(false);
                    setFeedbackMessage("Dados de habilitação do musicoterapeuta atualizados.");
                    setTimeout(() => setFeedbackMessage(null), 3000);
                  }}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md"
                >
                  Salvar Habilitação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Indicação e Encaminhamento Clínico */}
      {showIndicationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-teal-400">
                <Stethoscope className="w-5 h-5" /> Indicação / Prescrição Multidisciplinar
              </h3>
              <button onClick={() => setShowIndicationModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nome do Profissional Prescritor</label>
                  <input
                    type="text"
                    value={prescriberName || "Dr. Carlos Eduardo Queiroz"}
                    onChange={(e) => setPrescriberName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">CRM / CRP / Registro</label>
                  <input
                    type="text"
                    value={prescriberRegister || "CRM-CE 14205 - RQE 8920"}
                    onChange={(e) => setPrescriberRegister(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Especialidade / Origem</label>
                  <select
                    value={indicationOrigin}
                    onChange={(e) => setIndicationOrigin(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  >
                    <option value="neuropediatria">Neuropediatria</option>
                    <option value="psiquiatria">Psiquiatria da Infância e Adolescência</option>
                    <option value="pediatria">Pediatria Geral</option>
                    <option value="escola_aee">Equipe Escolar / AEE</option>
                    <option value="equipe_multidisciplinar">Equipe Multidisciplinar (Fono/TO/Psi)</option>
                    <option value="demanda_espontanea">Demanda Espontânea da Família</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Frequência Sugerida</label>
                  <input
                    type="text"
                    value={recommendedFrequency}
                    onChange={(e) => setRecommendedFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Objetivos Destacados no Encaminhamento</label>
                <textarea
                  rows={2}
                  value={mentionedGoals || "Desenvolvimento da comunicação expressiva, ampliação de turnos interacionais e regulação sensorial acústica."}
                  onChange={(e) => setMentionedGoals(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIndicationModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowIndicationModal(false);
                    setFeedbackMessage("Encaminhamento clínico vinculado ao prontuário.");
                    setTimeout(() => setFeedbackMessage(null), 3000);
                  }}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md"
                >
                  Salvar Encaminhamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
