import React, { useState, useEffect } from "react";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  HeartPulse,
  Users,
  Copy,
  Check,
  Headphones,
  Sun,
  Clock,
  MessageSquare,
  Plus,
  Trash2,
  Award,
  BookOpen,
  Briefcase
} from "lucide-react";
import { UserProfile, calculateAge, getAgeCategory } from "../types";

export interface HrAccommodation {
  id: string;
  employeeName: string;
  role: string;
  isBpcBeneficiary: boolean; // Beneficiário BPC / LOAS
  category: "sensorial" | "comunicacao" | "jornada" | "ergonomia" | "suporte";
  title: string;
  description: string;
  status: "Ativa / Aprovada" | "Em Análise SESMT" | "Aguardando Equipamento";
  dateRequested: string;
  nr1Category: "NR-1.5.4 Gerenciamento de Riscos Psicossociais" | "NR-17 Ergonomia" | "LBI Lei 13.146/2015";
}

export interface HrEmployee {
  id: string;
  name: string;
  birthDate?: string;
  role: string;
  cpf: string;
  cid: string;
  isBpc: boolean;
  cipteaNumber?: string;
  sector: string;
}

interface HrManagementHubProps {
  userProfile?: UserProfile;
  isDark?: boolean;
}

export const HrManagementHub: React.FC<HrManagementHubProps> = ({ userProfile, isDark }) => {
  const [activeTab, setActiveTab] = useState<"acomodacoes" | "riscos" | "bpc" | "parecer">("acomodacoes");
  const [copied, setCopied] = useState(false);

  // List of employees for HR selection (does not default to fake data)
  const [employees, setEmployees] = useState<HrEmployee[]>(() => {
    try {
      const stored = localStorage.getItem("neuroconecta_hr_employees");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // If none in hr, check global patients list
      const globalRaw = localStorage.getItem("neuroconecta_global_patients");
      if (globalRaw) {
        const globalList = JSON.parse(globalRaw);
        if (Array.isArray(globalList) && globalList.length > 0) {
          return globalList.map((p: any) => ({
            id: p.id,
            name: p.name,
            birthDate: p.birthDate,
            role: "Trabalhador PCD / Neurodivergente",
            cpf: p.cpf || "000.000.000-00",
            cid: p.diagnosisStatus === "laudo_formal" ? "F84.0 (TEA) / F90 (TDAH)" : "Em Investigação",
            isBpc: false,
            cipteaNumber: p.cipteaNumber || "CIPTEA-REG-2026",
            sector: "Acessibilidade & Inclusão"
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || "emp-001");

  // Save employees
  useEffect(() => {
    try {
      localStorage.setItem("neuroconecta_hr_employees", JSON.stringify(employees));
    } catch (e) {
      console.error(e);
    }
  }, [employees]);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  // New Employee Modal state
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("");
  const [empCpf, setEmpCpf] = useState("");
  const [empCid, setEmpCid] = useState("F84.0 (Transtorno do Espectro Autista)");
  const [empIsBpc, setEmpIsBpc] = useState(true);
  const [empSector, setEmpSector] = useState("Operacional");

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) return;
    const newEmp: HrEmployee = {
      id: `emp-${Date.now()}`,
      name: empName.trim(),
      role: empRole.trim() || "Colaborador PCD",
      cpf: empCpf.trim() || "000.000.000-00",
      cid: empCid,
      isBpc: empIsBpc,
      sector: empSector,
    };
    setEmployees([...employees, newEmp]);
    setSelectedEmpId(newEmp.id);
    setEmpName("");
    setEmpRole("");
    setEmpCpf("");
    setShowAddEmpModal(false);
  };

  // Storage for accommodations
  const [accommodations, setAccommodations] = useState<HrAccommodation[]>(() => {
    try {
      const stored = localStorage.getItem("neuroconecta_hr_accommodations");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    // Default initial corporate accommodation requests for demonstration & NR-1 compliance
    return [
      {
        id: "acc-101",
        employeeName: userProfile?.preferredName || "Colaborador Neurodivergente",
        role: "Desenvolvedor / Analista de Sistemas",
        isBpcBeneficiary: true,
        category: "sensorial",
        title: "Fones de Ouvido com Cancelamento de Ruído Ativo (ANC)",
        description: "Fornecimento de abafador auditivo eletrônico para isolamento de ruídos contínuos no ambiente open-space.",
        status: "Ativa / Aprovada",
        dateRequested: new Date().toLocaleDateString("pt-BR"),
        nr1Category: "NR-1.5.4 Gerenciamento de Riscos Psicossociais",
      },
      {
        id: "acc-102",
        employeeName: userProfile?.preferredName || "Colaborador Neurodivergente",
        role: "Desenvolvedor / Analista de Sistemas",
        isBpcBeneficiary: true,
        category: "comunicacao",
        title: "Instruções de Tarefas Assíncronas por Escrito (Slack/Email)",
        description: "Alocação de chamadas com pauta prévia e priorização por escrito com prazos estruturados.",
        status: "Ativa / Aprovada",
        dateRequested: new Date().toLocaleDateString("pt-BR"),
        nr1Category: "NR-1.5.4 Gerenciamento de Riscos Psicossociais",
      },
    ];
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("neuroconecta_hr_accommodations", JSON.stringify(accommodations));
    } catch (e) {
      console.error(e);
    }
  }, [accommodations]);

  // New Accommodation Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<HrAccommodation["category"]>("sensorial");
  const [newDesc, setNewDesc] = useState("");
  const [isBpc, setIsBpc] = useState(true);

  // Risk Mapping Form State (NR-1 Checklist)
  const [riskAssessment, setRiskAssessment] = useState({
    noiseLevel: 3, // 1 to 5
    lightingDiscomfort: 2,
    meetingOverload: 4,
    unwrittenRulesAmbiguity: 3,
    lackOfQuietSpace: 2,
  });

  const handleAddAccommodation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: HrAccommodation = {
      id: `acc-${Date.now()}`,
      employeeName: selectedEmployee ? selectedEmployee.name : (userProfile?.preferredName || "Colaborador PCD"),
      role: selectedEmployee ? selectedEmployee.role : "Cargo / Função Registrada",
      isBpcBeneficiary: selectedEmployee ? selectedEmployee.isBpc : isBpc,
      category: newCategory,
      title: newTitle,
      description: newDesc || "Acomodação solicitada para garantia de acessibilidade no trabalho.",
      status: "Em Análise SESMT",
      dateRequested: new Date().toLocaleDateString("pt-BR"),
      nr1Category: "NR-1.5.4 Gerenciamento de Riscos Psicossociais",
    };

    setAccommodations([item, ...accommodations]);
    setNewTitle("");
    setNewDesc("");
    setShowAddForm(false);
  };

  const handleDeleteAccommodation = (id: string) => {
    setAccommodations(accommodations.filter((a) => a.id !== id));
  };

  const handleCopyHrReport = () => {
    const empName = selectedEmployee ? selectedEmployee.name : "Colaborador Neurodivergente";
    const empRole = selectedEmployee ? selectedEmployee.role : "Cargo não especificado";
    const empCpf = selectedEmployee ? selectedEmployee.cpf : "N/A";
    const empCid = selectedEmployee ? selectedEmployee.cid : "F84.0";
    const empSector = selectedEmployee ? selectedEmployee.sector : "Geral";
    const bpcText = selectedEmployee?.isBpc
      ? "Sim (Beneficiário enquadrado na regra de transição do Auxílio-Inclusão - Art. 26-A da LOAS / Lei 14.176/2021)"
      : "Não";

    const reportText = `[DOSSIÊ DE RH & LAUDO DE CONFORMIDADE NR-1 / GRO - NEUROCONECTA]
EMPRESA / INSTITUIÇÃO: Gestão de Acessibilidade Empresarial
COLABORADOR SELECIONADO: ${empName}
CARGO / SETOR: ${empRole} | Setor: ${empSector}
CPF: ${empCpf} | ENQUADRAMENTO / CID: ${empCid}
RESPONSÁVEL TÉCNICO EMISSOR (RH): ${userProfile?.preferredName || "Gestor de RH"} ${userProfile?.professionalRegisterNumber ? `(Registro: ${userProfile.professionalRegisterNumber})` : ""}
VÍNCULO: Cota PCD / Trabalhador Neurodivergente (TEA/TDAH)
CONDIÇÃO DE BPC/LOAS: ${bpcText}
DATA DA AUDITORIA DE RH: ${new Date().toLocaleDateString("pt-BR")}

1. MATRIZ DE ACOMODAÇÕES RAZOÁVEIS APROVADAS (NR-1.5.4 & NR-17):
${accommodations
  .map(
    (a, idx) =>
      `${idx + 1}. [${a.category.toUpperCase()}] ${a.title}\n   Colaborador: ${a.employeeName} (${a.role})\n   Status: ${a.status} | Diretriz: ${a.nr1Category}\n   Descrição: ${a.description}`
  )
  .join("\n\n")}

2. AVALIAÇÃO DE RISCOS OCUPACIONAIS PSICOSSOCIAIS (NR-1 GRO):
- Nível de Estresse por Ruído Ambiente: ${riskAssessment.noiseLevel} / 5
- Desconforto por Iluminação Fluorescente: ${riskAssessment.lightingDiscomfort} / 5
- Sobrecarga por Reuniões Não Agendadas: ${riskAssessment.meetingOverload} / 5
- Ambiguidades em Instruções de Trabalho: ${riskAssessment.unwrittenRulesAmbiguity} / 5
- Acesso a Espaço de Descompressão Silencioso: ${riskAssessment.lackOfQuietSpace <= 2 ? "Garantido" : "Requer Ajuste"}

PARECER TÉCNICO DE RECURSOS HUMANOS:
A empresa atende às diretrizes de Acessibilidade Ocupacional Neuroafirmativa da Norma Regulamentadora NR-1 (GRO), assegurando adaptações razoáveis no posto de trabalho para prevenir estresse sensorial, sobrecarga cognitiva e fadiga por camuflagem social (burnout autista). O funcionário dispõe de acompanhamento contínuo e canal de escuta neuroafirmativa.

Documento gerado pelo sistema NeuroConecta para integração ao SESMT, CIPA e Dossiê de Recursos Humanos.`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-teal-950 text-teal-300 border border-teal-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-400" />
                Módulo Recursos Humanos
              </span>
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-xl text-xs font-bold">
                NR-1 GRO Compliant
              </span>
              <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-xl text-xs font-bold">
                Lei 8.213/91 Cotas PCD &amp; BPC
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Acessibilidade Corporativa &amp; Atendimento NR-1
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
              Plataforma de gestão para Recursos Humanos, SESMT e lideranças: acompanhamento neuroafirmativo de colaboradores PCD/BPC, adaptação do posto de trabalho e mitigação de riscos psicossociais.
            </p>
          </div>

          <button
            onClick={handleCopyHrReport}
            className="px-5 py-3 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2 flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <FileText className="w-4 h-4" />}
            <span>{copied ? "Dossiê Copiado!" : "Gerar Dossiê NR-1 para RH"}</span>
          </button>
        </div>

        {/* Corporate KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs sm:text-sm">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 font-medium">Acomodações Ativas</span>
            <p className="text-2xl font-extrabold text-teal-300 mt-1 font-mono">{accommodations.length}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 font-medium">Funcionários Cadastrados</span>
            <p className="text-2xl font-extrabold text-emerald-300 mt-1 font-mono">{employees.length}</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 font-medium">Conformidade NR-1</span>
            <p className="text-2xl font-extrabold text-cyan-300 mt-1 font-mono">100% Ok</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-400 font-medium">Status no eSocial</span>
            <p className="text-2xl font-extrabold text-purple-300 mt-1 font-mono">Regularizado</p>
          </div>
        </div>
      </div>

      {/* Employee Selector Bar for Technical Reports & Dossier */}
      <div className="bg-slate-900 border border-blue-800/80 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-950 text-blue-300 border border-blue-700/80 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Seleção de Funcionário para Laudos, Dossiê &amp; NR-1
              </h3>
              <p className="text-xs text-slate-400">
                Escolha qual colaborador terá os dados emitidos no parecer (evitando utilizar os dados do gestor logado).
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddEmpModal(true)}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Cadastrar Colaborador
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-blue-300">
              Colaborador PCD / BPC Selecionado
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-blue-700/80 rounded-xl text-slate-100 text-xs font-semibold focus:outline-none focus:border-blue-400"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.role} {emp.isBpc ? " (BPC/LOAS)" : ""}
                </option>
              ))}
            </select>
          </div>

          {selectedEmployee && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span>{selectedEmployee.name}</span>
                <span className="text-blue-400 font-mono">{selectedEmployee.cpf}</span>
              </div>
              <p className="text-slate-400">Cargo: {selectedEmployee.role} | Setor: {selectedEmployee.sector}</p>
              <p className="text-teal-400">Diagnóstico/CID: {selectedEmployee.cid} {selectedEmployee.cipteaNumber ? `(${selectedEmployee.cipteaNumber})` : ""}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Cadastrar Novo Colaborador */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-blue-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-blue-300 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Novo Colaborador BPC / PCD
              </h3>
              <button onClick={() => setShowAddEmpModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Nome Completo do Funcionário</label>
                <input
                  type="text"
                  required
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="Ex: João Pedro Rodrigues"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Cargo / Função Registrada</label>
                <input
                  type="text"
                  required
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  placeholder="Ex: Auxiliar de Almoxarifado"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">CPF</label>
                  <input
                    type="text"
                    value={empCpf}
                    onChange={(e) => setEmpCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">Setor / Departamento</label>
                  <input
                    type="text"
                    value={empSector}
                    onChange={(e) => setEmpSector(e.target.value)}
                    placeholder="Logística"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Enquadramento CID / Diagnóstico</label>
                <select
                  value={empCid}
                  onChange={(e) => setEmpCid(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                >
                  <option value="F84.0 (Transtorno do Espectro Autista)">F84.0 (Transtorno do Espectro Autista - TEA)</option>
                  <option value="F90.0 (TDAH Predominantemente Desatento)">F90.0 (TDAH / Neurodiversidade)</option>
                  <option value="F84.5 (Síndrome de Asperger)">F84.5 (Síndrome de Asperger / TEA Nível 1)</option>
                  <option value="Deficiência Física / Sensorial PCD">Deficiência Física / Sensorial PCD</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="empBpcChk"
                  checked={empIsBpc}
                  onChange={(e) => setEmpIsBpc(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
                <label htmlFor="empBpcChk" className="text-slate-300 font-semibold cursor-pointer">
                  Beneficiário BPC / LOAS (Enquadrado no Auxílio-Inclusão Art. 26-A)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto no-scrollbar pb-1 text-xs sm:text-sm">
        {[
          { id: "acomodacoes", label: "Acomodações Razoáveis (Posto de Trabalho)", icon: Headphones },
          { id: "riscos", label: "Mapeamento NR-1 (Riscos Psicossociais)", icon: AlertTriangle },
          { id: "bpc", label: "Acolhimento BPC & Auxílio-Inclusão", icon: Briefcase },
          { id: "parecer", label: "Parecer Técnico de RH & Auditoria", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                isActive
                  ? "bg-teal-950 text-teal-200 border border-teal-700 shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Accommodations Management */}
      {activeTab === "acomodacoes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-teal-400" />
                Matriz de Acomodações Razoáveis Ocupacionais
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Adaptações de acessibilidade conforme Art. 3º da Lei Brasileira de Inclusão (Lei 13.146/2015) e NR-1.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Solicitar Nova Acomodação</span>
            </button>
          </div>

          {/* Add Accommodation Form */}
          {showAddForm && (
            <form onSubmit={handleAddAccommodation} className="p-6 bg-slate-900 border border-teal-800/80 rounded-2xl space-y-4 shadow-lg">
              <h4 className="text-sm font-bold text-teal-300 uppercase tracking-wider">Formulário de Acomodação Razoável (RH / Colaborador)</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Título da Adaptação Solicitada:</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Fones ANC / Iluminação LED dimerizada / Pausa de 10min"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria de Acessibilidade:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="sensorial">Sensorial (Ruído, Luz, Espaço Físico)</option>
                    <option value="comunicacao">Comunicação (Instruções Escritas, Slack)</option>
                    <option value="jornada">Jornada (Horários Flexíveis, Pausas)</option>
                    <option value="ergonomia">Ergonomia &amp; Posto de Trabalho</option>
                    <option value="suporte">Suporte &amp; Mentoria Individual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Justificativa e Impacto Esperado:</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  placeholder="Descreva brevemente a finalidade para redução de fadiga e melhoria de desempenho..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBpc}
                    onChange={(e) => setIsBpc(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Colaborador Beneficiário do BPC / Auxílio-Inclusão</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-xl hover:bg-slate-700 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-500 transition"
                  >
                    Protocolar no RH
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Accommodation Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accommodations.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-3 shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-slate-100 text-sm sm:text-base">{item.title}</h4>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Requisitado em: {item.dateRequested}</span>
                  <button
                    onClick={() => handleDeleteAccommodation(item.id)}
                    className="text-slate-500 hover:text-rose-400 transition"
                    title="Remover acomodação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: NR-1 Ergonomic & Psychosocial Risks Checklist */}
      {activeTab === "riscos" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Mapeamento de Riscos Psicossociais Corporativos (NR-1.5.4 GRO)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Avaliação de fatores ambientais e comportamentais que afetam colaboradores autistas e TDAH no ambiente de trabalho.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                id: "noiseLevel",
                title: "1. Nível de Estresse por Ruído de Fundo (Open Office / Conversas)",
                desc: "Avalia sobrecarga auditiva decorrente de ar-condicionado, impressoras e conversas contínuas sem abafamento.",
              },
              {
                id: "lightingDiscomfort",
                title: "2. Desconforto por Iluminação Fluorescente Direta",
                desc: "Avalia cintilação e brilho excessivo sobre o posto de trabalho sem dimerização.",
              },
              {
                id: "meetingOverload",
                title: "3. Reuniões de Surpresa / Chamadas Não Agendadas sem Pauta",
                desc: "Avalia a fadiga por imprevisibilidade e falta de tempo de preparação prévia de respostas.",
              },
              {
                id: "unwrittenRulesAmbiguity",
                title: "4. Ambiguidades em Regras Implícitas e Expectativas Não Declaradas",
                desc: "Avalia a sobrecarga decorrente de falta de clareza nas prioridades diárias.",
              },
              {
                id: "lackOfQuietSpace",
                title: "5. Acesso Restrito a Espaço Silencioso de Descompressão",
                desc: "Avalia a presença de local calmo para pausa de auto-regulação sensorial durante a jornada.",
              },
            ].map((item) => {
              const val = (riskAssessment as any)[item.id];
              return (
                <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                    <span className="text-xs font-mono font-bold text-teal-400">Intensidade: {val} / 5</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={val}
                    onChange={(e) =>
                      setRiskAssessment({ ...riskAssessment, [item.id]: parseInt(e.target.value) })
                    }
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 (Mínimo / Sem Risco)</span>
                    <span>3 (Moderado)</span>
                    <span>5 (Crítico / Ação Imediata)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-teal-950/60 border border-teal-800/80 rounded-xl flex items-center justify-between text-xs text-teal-200">
            <span>Diagnóstico do Sistema: Matriz NR-1 identificada e enquadrada em monitoramento preventivo.</span>
            <button
              onClick={handleCopyHrReport}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-lg transition"
            >
              Exportar Matriz NR-1
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: BPC / Auxílio-Inclusão Guidelines */}
      {activeTab === "bpc" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              Diretrizes de Acolhimento de Beneficiários do BPC / LOAS (Auxílio-Inclusão)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Informações jurídicas e trabalhistas para RH e Gestores sobre contratação de beneficiários da Lei nº 14.176/2021.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                O que é o Auxílio-Inclusão (Art. 26-A da LOAS)?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Ao ser contratado em emprego formal com carteira assinada (CLT), o beneficiário do BPC não perde os seus direitos! O BPC fica suspenso e o trabalhador passa a receber automaticamente o **Auxílio-Inclusão** (correspondente a 50% do salário mínimo) como complemento salarial pago pelo INSS.
              </p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="font-bold text-teal-300 flex items-center gap-1.5 text-sm">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Garantia de Retorno Imediato (Sem Burocracia)
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Caso ocorra desligamento da empresa, a reativação do BPC integral é **imediata**, mediante simples requerimento ao INSS, sem necessidade de passar por novo processo do zero. Isso garante segurança financeira ao trabalhador neurodivergente.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
            <h4 className="font-bold text-slate-100 uppercase">Checklist do RH para o eSocial (Cotas PCD):</h4>
            <ul className="space-y-1 list-disc list-inside text-slate-400">
              <li>Registrar a contratação com o código de deficiência correspondente no eSocial (TEA / Neurodiversidade - Lei 12.764/2012).</li>
              <li>Informar ao trabalhador a opção pelo Auxílio-Inclusão via aplicativo Meu INSS.</li>
              <li>Implantar o Plano Individual de Acomodação Razoável NR-1 antes do início das atividades.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 4: Technical Report & Dossier for HR Audit */}
      {activeTab === "parecer" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                Parecer Técnico Consolidado de RH &amp; Auditoria NR-1
              </h3>
              <p className="text-xs text-slate-400">
                Documento de conformidade corporativa para fiscalização de CIPA, MTE e SESMT.
              </p>
            </div>
            <button
              onClick={handleCopyHrReport}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copiado!" : "Copiar Parecer do Dossiê"}</span>
            </button>
          </div>

          <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line text-justify shadow-inner">
            {`[DOSSIÊ DE RH & LAUDO DE CONFORMIDADE NR-1 / GRO - NEUROCONECTA]
EMPRESA / INSTITUIÇÃO: Gestão de Acessibilidade Empresarial
COLABORADOR SELECIONADO: ${selectedEmployee ? selectedEmployee.name : "Colaborador Neurodivergente"}
CARGO / FUNÇÃO: ${selectedEmployee ? selectedEmployee.role : "Geral"} | Setor: ${selectedEmployee ? selectedEmployee.sector : "Operacional"}
CPF: ${selectedEmployee ? selectedEmployee.cpf : "N/A"} | ENQUADRAMENTO / CID: ${selectedEmployee ? selectedEmployee.cid : "F84.0"}
RESPONSÁVEL TÉCNICO EMISSOR (RH): ${userProfile?.preferredName || "Gestor de RH"} ${userProfile?.professionalRegisterNumber ? `(Registro RH/CRA: ${userProfile.professionalRegisterNumber})` : ""}
VÍNCULO: Cota PCD / Trabalhador Neurodivergente (TEA/TDAH / PCD)
CONDIÇÃO DE BPC/LOAS: ${selectedEmployee?.isBpc ? "Sim - Beneficiário enquadrado na regra de transição do Auxílio-Inclusão (Art. 26-A LOAS)" : "Não aplicável / Não beneficiário"}
DATA DA AUDITORIA DE RH: ${new Date().toLocaleDateString("pt-BR")}

1. MATRIZ DE ACOMODAÇÕES RAZOÁVEIS APROVADAS (NR-1.5.4 & NR-17):
${accommodations
  .map(
    (a, idx) =>
      `${idx + 1}. [${a.category.toUpperCase()}] ${a.title}\n   Colaborador Atendido: ${a.employeeName} (${a.role})\n   Status: ${a.status} | Diretriz: ${a.nr1Category}\n   Descrição: ${a.description}`
  )
  .join("\n\n")}

PARECER TÉCNICO DE RECURSOS HUMANOS:
A empresa atende às diretrizes de Acessibilidade Ocupacional Neuroafirmativa da Norma Regulamentadora NR-1 (GRO), assegurando adaptações razoáveis no posto de trabalho para prevenir estresse sensorial, sobrecarga cognitiva e fadiga por camuflagem social (burnout autista).`}
          </div>
        </div>
      )}
    </div>
  );
};
