import React, { useState } from "react";
import { 
  HeartHandshake, 
  Target, 
  CalendarCheck, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  Plus, 
  ShieldCheck, 
  ArrowRight,
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import { 
  PsychologyTherapeuticProcess, 
  TherapeuticGoal, 
  CollaborativeSessionAgenda, 
  InterSessionResource,
  TherapeuticProcessCheckIn,
  TherapeuticRuptureAlert,
  AssistedUserSummary
} from "../../types";

interface PsychologyAllianceViewProps {
  process: PsychologyTherapeuticProcess;
  selectedUser: AssistedUserSummary | null;
  onSaveProcess: (updatedProcess: PsychologyTherapeuticProcess) => void;
  onPlanActivityForGoal: (goalTitle: string, goalDesc: string) => void;
  isDark?: boolean;
}

export const PsychologyAllianceView: React.FC<PsychologyAllianceViewProps> = ({
  process,
  selectedUser,
  onSaveProcess,
  onPlanActivityForGoal,
  isDark = true,
}) => {
  const [activeTab, setActiveTab] = useState<"objetivos" | "agenda" | "tarefas" | "checkin" | "sinais">("objetivos");

  // Novo objetivo terapêutico
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [newGoalPriority, setNewGoalPriority] = useState<"alta" | "media" | "baixa">("alta");
  const [newGoalNotes, setNewGoalNotes] = useState("");

  // Nova agenda de sessão
  const [isAddingAgenda, setIsAddingAgenda] = useState(false);
  const [agendaPatientPriorities, setAgendaPatientPriorities] = useState("");
  const [agendaTherapistPriorities, setAgendaTherapistPriorities] = useState("");
  const [agendaTopics, setAgendaTopics] = useState("");

  // Novo check-in de processo
  const [isAddingCheckIn, setIsAddingCheckIn] = useState(false);
  const [feltHeard, setFeltHeard] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [sessionSense, setSessionSense] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [understoodGoals, setUnderstoodGoals] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [taskFeasible, setTaskFeasible] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [checkInMsg, setCheckInMsg] = useState("");

  // Novo alerta de ruptura
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [alertType, setAlertType] = useState<any>("desacordo_objetivo");
  const [alertDesc, setAlertDesc] = useState("");
  const [alertManagement, setAlertManagement] = useState("");

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalDesc.trim()) return;

    const newGoal: TherapeuticGoal = {
      id: `t-goal-${Date.now()}`,
      description: newGoalDesc.trim(),
      priority: newGoalPriority,
      status: "ativo",
      discussedWithPatient: true,
      understoodByPatient: true,
      notes: newGoalNotes.trim() || undefined,
      reviewDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };

    onSaveProcess({
      ...process,
      collaborativeGoals: [...process.collaborativeGoals, newGoal],
    });

    setNewGoalDesc("");
    setNewGoalNotes("");
    setIsAddingGoal(false);
  };

  const handleAddAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaTopics.trim()) return;

    const newAgenda: CollaborativeSessionAgenda = {
      id: `agenda-${Date.now()}`,
      sessionDate: new Date().toISOString().split("T")[0],
      patientPriorities: agendaPatientPriorities.trim() || "Tópico trazido pelo paciente",
      professionalPriorities: agendaTherapistPriorities.trim() || "Continuidade do plano",
      agreedAgendaTopics: agendaTopics.split("\n").filter((t) => t.trim()),
      summaryNotes: "Construção colaborativa da agenda da sessão realizada no início do atendimento.",
    };

    onSaveProcess({
      ...process,
      sessionAgendas: [newAgenda, ...process.sessionAgendas],
    });

    setAgendaPatientPriorities("");
    setAgendaTherapistPriorities("");
    setAgendaTopics("");
    setIsAddingAgenda(false);
  };

  const handleAddCheckIn = (e: React.FormEvent) => {
    e.preventDefault();

    const newCheckIn: TherapeuticProcessCheckIn = {
      id: `chk-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      feltHeardScore: feltHeard,
      sessionMadeSenseScore: sessionSense,
      understoodGoalsScore: understoodGoals,
      taskFeasibleScore: taskFeasible,
      openMessageForTherapist: checkInMsg.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveProcess({
      ...process,
      processCheckIns: [newCheckIn, ...process.processCheckIns],
    });

    setCheckInMsg("");
    setIsAddingCheckIn(false);
  };

  const handleAddRuptureAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertDesc.trim()) return;

    const newAlert: TherapeuticRuptureAlert = {
      id: `rup-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      alertType,
      description: alertDesc.trim(),
      wasDiscussedInSession: true,
      clinicalManagementNotes: alertManagement.trim() || "Diálogo aberto sobre a expectativa da sessão.",
      reviewInNextSession: true,
      status: "em_manejo",
      createdAt: new Date().toISOString(),
    };

    onSaveProcess({
      ...process,
      ruptureAlerts: [newAlert, ...process.ruptureAlerts],
    });

    setAlertDesc("");
    setAlertManagement("");
    setIsAddingAlert(false);
  };

  return (
    <div className="space-y-5">
      {/* Banner de Fundamentação Teórica da TCC */}
      <div className="p-4 bg-indigo-950/40 border border-indigo-800/70 rounded-2xl flex items-start gap-3 text-indigo-200 text-xs">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Aliança Terapêutica na TCC: Vínculo, Metas Compartilhadas e Colaboração nas Tarefas
          </p>
          <p className="text-[11px] text-indigo-300/80 leading-relaxed">
            Fundamentação teórico-clínica: a qualidade da relação terapêutica e a construção colaborativa de metas 
            são preditores de adesão e segurança emocional. O sistema não gera pontuações automáticas de "sucesso" nem diagnósticos.
          </p>
        </div>
      </div>

      {/* Navegação entre eixos do processo */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "objetivos", label: "Objetivos Compartilhados", count: process.collaborativeGoals.length },
          { id: "agenda", label: "Agenda Colaborativa de Sessão", count: process.sessionAgendas.length },
          { id: "tarefas", label: "Recursos Entre Sessões", count: process.interSessionActivities.length },
          { id: "checkin", label: "Check-in de Processo", count: process.processCheckIns.length },
          { id: "sinais", label: "Sinais de Atenção & Rupturas", count: process.ruptureAlerts.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 1. OBJETIVOS COMPARTILHADOS */}
      {activeTab === "objetivos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                Metas Terapêuticas Construídas em Conjunto
              </h4>
              <p className="text-[11px] text-slate-400">
                Objetivos definidos e acordados com {selectedUser?.displayName || process.patientName}
              </p>
            </div>
            {!isAddingGoal && (
              <button
                type="button"
                onClick={() => setIsAddingGoal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Objetivo Terapêutico</span>
              </button>
            )}
          </div>

          {isAddingGoal && (
            <form onSubmit={handleAddGoal} className="p-4 bg-slate-900 border border-indigo-800/70 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300">Novo Objetivo Colaborativo</span>
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400">Descrição do Objetivo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Identificar pensamentos automáticos de autocobrança e praticar frases de autoapoio..."
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400">Observações de Construção</label>
                <input
                  type="text"
                  placeholder="Ex: Paciente concorda e prefere usar anotações no celular."
                  value={newGoalNotes}
                  onChange={(e) => setNewGoalNotes(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
              >
                Salvar Objetivo Terapêutico
              </button>
            </form>
          )}

          <div className="space-y-3">
            {process.collaborativeGoals.map((goal) => (
              <div
                key={goal.id}
                className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-[10px] font-bold">
                        Prioridade {goal.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-bold">
                        Acordado em Sessão
                      </span>
                    </div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-100">{goal.description}</h5>
                    {goal.notes && <p className="text-xs text-slate-400">{goal.notes}</p>}
                  </div>

                  {/* AÇÃO: PLANEJAR RECURSO/ATIVIDADE PARA ESTE OBJETIVO */}
                  <button
                    type="button"
                    onClick={() => onPlanActivityForGoal(goal.description, goal.notes || "")}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm self-start"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Planejar Atividade / Recurso</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. AGENDA COLABORATIVA DE SESSÃO */}
      {activeTab === "agenda" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-indigo-400" />
                Estruturação da Agenda da Sessão
              </h4>
              <p className="text-[11px] text-slate-400">
                Pauta definida conjuntamente no início de cada atendimento
              </p>
            </div>
            {!isAddingAgenda && (
              <button
                type="button"
                onClick={() => setIsAddingAgenda(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Agenda de Sessão</span>
              </button>
            )}
          </div>

          {isAddingAgenda && (
            <form onSubmit={handleAddAgenda} className="p-4 bg-slate-900 border border-indigo-800/70 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300">Nova Agenda de Sessão</span>
                <button
                  type="button"
                  onClick={() => setIsAddingAgenda(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">Prioridades Trazidas pelo Paciente</label>
                  <textarea
                    rows={2}
                    placeholder="O que o paciente mais deseja abordar hoje?"
                    value={agendaPatientPriorities}
                    onChange={(e) => setAgendaPatientPriorities(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">Prioridades do Profissional</label>
                  <textarea
                    rows={2}
                    placeholder="Revisão de tarefas, continuidade ou checagem de humor..."
                    value={agendaTherapistPriorities}
                    onChange={(e) => setAgendaTherapistPriorities(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400">Pauta Combinada (um item por linha)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="1. Checagem da semana&#10;2. Situação de conflito na escola&#10;3. Planejamento de resposta assertiva"
                  value={agendaTopics}
                  onChange={(e) => setAgendaTopics(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
              >
                Registrar Agenda de Sessão
              </button>
            </form>
          )}

          <div className="space-y-3">
            {process.sessionAgendas.map((agenda) => (
              <div key={agenda.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Sessão em {agenda.sessionDate}</span>
                  <span className="text-[10px] text-indigo-400 font-semibold">Agenda Colaborativa</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Trazido pelo Paciente:</span>
                    <p className="text-slate-300 mt-0.5">{agenda.patientPriorities}</p>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Prioridades do Terapeuta:</span>
                    <p className="text-slate-300 mt-0.5">{agenda.professionalPriorities}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Pauta Acordada:</span>
                  <ul className="mt-1 space-y-0.5 text-xs text-slate-200">
                    {agenda.agreedAgendaTopics.map((top, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        <span>{top}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ATIVIDADES ENTRE SESSÕES */}
      {activeTab === "tarefas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Atividades e Recursos Entre Sessões
              </h4>
              <p className="text-[11px] text-slate-400">
                Tarefas combinadas em sessão com objetivo claro e consentido
              </p>
            </div>
            <button
              type="button"
              onClick={() => onPlanActivityForGoal("Atividade Entre Sessões", "Psicoeducação e registro reflexivo")}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Planejar Nova Atividade Entre Sessões</span>
            </button>
          </div>

          <div className="space-y-3">
            {process.interSessionActivities.map((act) => (
              <div key={act.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs sm:text-sm font-bold text-slate-100">{act.title}</h5>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-[10px] font-bold">
                    {act.resourceCategory}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{act.description}</p>
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  <strong className="text-indigo-300">Explicação do Objetivo:</strong> {act.objectiveExplanation}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Paciente compreende o objetivo
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-teal-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Combinada em sessão
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CHECK-IN DE PROCESSO TERAPÊUTICO */}
      {activeTab === "checkin" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-indigo-400" />
                Check-in de Processo Terapêutico
              </h4>
              <p className="text-[11px] text-slate-400">
                Instrumento funcional de escuta sobre vínculo, sentido da sessão e viabilidade das tarefas
              </p>
            </div>
            {!isAddingCheckIn && (
              <button
                type="button"
                onClick={() => setIsAddingCheckIn(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Check-in</span>
              </button>
            )}
          </div>

          {isAddingCheckIn && (
            <form onSubmit={handleAddCheckIn} className="p-4 bg-slate-900 border border-indigo-800/70 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300">Registrar Percepção de Processo</span>
                <button
                  type="button"
                  onClick={() => setIsAddingCheckIn(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { label: "1. Senti que fui ouvido(a) e compreendido(a) hoje", val: feltHeard, set: setFeltHeard },
                  { label: "2. O que trabalhamos na sessão fez sentido para mim", val: sessionSense, set: setSessionSense },
                  { label: "3. Entendo claramente os objetivos do que estamos construindo", val: understoodGoals, set: setUnderstoodGoals },
                  { label: "4. As tarefas combinadas parecem viáveis e possíveis", val: taskFeasible, set: setTaskFeasible },
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs text-slate-200 font-semibold">
                      <span>{item.label}</span>
                      <span className="text-indigo-400 font-bold">{item.val} de 5</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={item.val}
                      onChange={(e) => item.set(Number(e.target.value) as any)}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400">Mensagem Aberta ou Comentário ao Terapeuta</label>
                <textarea
                  rows={2}
                  placeholder="Algo que gostaria de reforçar, sugerir ou conversar na próxima sessão..."
                  value={checkInMsg}
                  onChange={(e) => setCheckInMsg(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
              >
                Salvar Registro de Processo
              </button>
            </form>
          )}

          <div className="space-y-3">
            {process.processCheckIns.map((chk) => (
              <div key={chk.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Registro em {chk.date}</span>
                  <span className="text-[10px] text-indigo-400">Instrumento de Escuta Contínua</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Fui Ouvido</span>
                    <strong className="text-indigo-400">{chk.feltHeardScore}/5</strong>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Fez Sentido</span>
                    <strong className="text-indigo-400">{chk.sessionMadeSenseScore}/5</strong>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Metas Claras</span>
                    <strong className="text-indigo-400">{chk.understoodGoalsScore}/5</strong>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Tarefas Viáveis</span>
                    <strong className="text-indigo-400">{chk.taskFeasibleScore}/5</strong>
                  </div>
                </div>
                {chk.openMessageForTherapist && (
                  <p className="text-xs text-slate-300 italic pt-1 border-t border-slate-800">
                    "{chk.openMessageForTherapist}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SINAIS DE ATENÇÃO & MANEJO DE RUPTURAS */}
      {activeTab === "sinais" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Manejo Colaborativo de Rupturas e Desacordos
              </h4>
              <p className="text-[11px] text-slate-400">
                Acompanhamento clínico de hesitações, desacordos de objetivos ou dificuldades na tarefa
              </p>
            </div>
            {!isAddingAlert && (
              <button
                type="button"
                onClick={() => setIsAddingAlert(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Sinal de Atenção</span>
              </button>
            )}
          </div>

          {isAddingAlert && (
            <form onSubmit={handleAddRuptureAlert} className="p-4 bg-slate-900 border border-amber-800/70 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">Novo Registro de Ruptura / Ajuste Clínico</span>
                <button
                  type="button"
                  onClick={() => setIsAddingAlert(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">Tipo de Situação Observada</label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="desacordo_objetivo">Desacordo sobre objetivos da terapia</option>
                    <option value="dificuldade_tarefa">Dificuldade ou frustração com tarefa entre sessões</option>
                    <option value="desconforto_emocional">Desconforto com algum tópico abordado</option>
                    <option value="critica_ao_processo">Crítica explícita ao método ou ritmo</option>
                    <option value="queda_engajamento">Queda abrupta de engajamento ou silêncio</option>
                    <option value="faltas_adiamentos">Faltas ou cancelamentos frequentes</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">Descrição Breve</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Paciente relatou que a tarefa de escrita foi cansativa..."
                    value={alertDesc}
                    onChange={(e) => setAlertDesc(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400">Como Foi Conversado / Manejado Clinicada</label>
                <textarea
                  rows={2}
                  placeholder="Manejo empático, validação da frustração e redefinição colaborativa do passo seguinte..."
                  value={alertManagement}
                  onChange={(e) => setAlertManagement(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition"
              >
                Salvar Registro Clínico
              </button>
            </form>
          )}

          <div className="space-y-3">
            {process.ruptureAlerts.length === 0 ? (
              <div className="p-6 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-400">
                Nenhuma ruptura ou desacordo registrado. O processo segue com boa comunicação e colaboração mútua.
              </div>
            ) : (
              process.ruptureAlerts.map((rup) => (
                <div key={rup.id} className="p-4 bg-slate-900/90 border border-amber-950 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 capitalize">
                      {rup.alertType.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-slate-500">{rup.date}</span>
                  </div>
                  <p className="text-xs text-slate-200">{rup.description}</p>
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                    <strong className="text-amber-400">Manejo Clínico Realizado:</strong> {rup.clinicalManagementNotes}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
