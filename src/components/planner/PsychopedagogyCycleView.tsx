import React, { useState } from "react";
import { 
  Brain, 
  Target, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  Edit3,
  Bookmark,
  FileText
} from "lucide-react";
import { 
  PsychopedagogyPlan, 
  PsychopedagogyGoal, 
  AssistedUserSummary,
  PSYCHOPEDAGOGY_PROCESSES 
} from "../../types";

interface PsychopedagogyCycleViewProps {
  plan: PsychopedagogyPlan;
  selectedUser: AssistedUserSummary | null;
  onSavePlan: (updatedPlan: PsychopedagogyPlan) => void;
  onPlanActivityForGoal: (goal: PsychopedagogyGoal) => void;
  isDark?: boolean;
}

export const PsychopedagogyCycleView: React.FC<PsychopedagogyCycleViewProps> = ({
  plan,
  selectedUser,
  onSavePlan,
  onPlanActivityForGoal,
  isDark = true,
}) => {
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [demandDescription, setDemandDescription] = useState(plan.demandDescription);
  const [developmentContext, setDevelopmentContext] = useState(plan.developmentContext);
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  // Novo objetivo
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [newGoalProcess, setNewGoalProcess] = useState<string>(PSYCHOPEDAGOGY_PROCESSES[0]);
  const [newGoalPriority, setNewGoalPriority] = useState<"alta" | "media" | "manutencao">("alta");
  const [newGoalCriteria, setNewGoalCriteria] = useState("");
  const [newGoalStrategy, setNewGoalStrategy] = useState("");

  const handleSaveHeader = () => {
    onSavePlan({
      ...plan,
      demandDescription,
      developmentContext,
    });
    setIsEditingHeader(false);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalDesc.trim()) return;

    const createdGoal: PsychopedagogyGoal = {
      id: `goal-${Date.now()}`,
      description: newGoalDesc.trim(),
      targetProcess: newGoalProcess,
      priority: newGoalPriority,
      status: "ativo",
      strategiesPlanned: newGoalStrategy.trim() ? [newGoalStrategy.trim()] : [],
      reachCriteria: newGoalCriteria.trim() || "Consistência em 70% das tentativas observadas.",
      linkedActivitiesCount: 0,
      reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };

    onSavePlan({
      ...plan,
      priorityGoals: [...plan.priorityGoals, createdGoal],
    });

    setNewGoalDesc("");
    setNewGoalCriteria("");
    setNewGoalStrategy("");
    setIsAddingGoal(false);
  };

  return (
    <div className="space-y-5">
      {/* Banner Ético e Institucional do Ciclo */}
      <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-2xl flex items-start gap-3 text-amber-200 text-xs">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Ciclo Psicopedagógico Estruturado (Resolução Ética e Metodológica)</p>
          <p className="text-[11px] text-amber-300/80 leading-relaxed">
            O acompanhamento psicopedagógico foca nas funções cognitivas, mediação de estratégias e superação de barreiras de aprendizagem. 
            Não substitui avaliação clínica médica ou diagnóstica.
          </p>
        </div>
      </div>

      {/* Visão Geral do Aprendente e Demanda */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Plano Psicopedagógico Individualizado: {selectedUser?.displayName || plan.assistedUserName}
              </h3>
              <p className="text-[11px] text-slate-400">
                Mapeamento das potencialidades, barreiras e hipóteses operatórias de aprendizagem
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingHeader(!isEditingHeader)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingHeader ? "Fechar" : "Editar Contexto"}</span>
          </button>
        </div>

        {isEditingHeader ? (
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-300">Demanda Principal e Queixa Inicial</label>
              <textarea
                rows={2}
                value={demandDescription}
                onChange={(e) => setDemandDescription(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300">Contexto do Desenvolvimento & Hipóteses</label>
              <textarea
                rows={2}
                value={developmentContext}
                onChange={(e) => setDevelopmentContext(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveHeader}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition"
            >
              Salvar Alterações
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demanda Observada</span>
              <p className="text-slate-200 mt-1 leading-relaxed">{plan.demandDescription}</p>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contexto de Desenvolvimento</span>
              <p className="text-slate-200 mt-1 leading-relaxed">{plan.developmentContext}</p>
            </div>
          </div>
        )}

        {/* Pontos Fortes e Adaptações Conhecidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Pontos Fortes & Recursos do Aprendente
            </span>
            <ul className="mt-2 space-y-1 text-xs text-slate-300">
              {plan.strengthsObserved.map((s, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              Adaptações e Recursos que Ajudam
            </span>
            <ul className="mt-2 space-y-1 text-xs text-slate-300">
              {plan.environmentalAdaptations.map((a, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Lista de Objetivos SMART e Ação "PLANEJAR ATIVIDADE PARA ESTE OBJETIVO" */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              Objetivos Psicopedagógicos Prioritários ({plan.priorityGoals.length})
            </h4>
            <p className="text-[11px] text-slate-400">
              Clique em "Planejar Atividade" para estruturar uma intervenção direcionada à meta
            </p>
          </div>

          {!isAddingGoal && (
            <button
              type="button"
              onClick={() => setIsAddingGoal(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Objetivo</span>
            </button>
          )}
        </div>

        {/* Formulário para novo objetivo */}
        {isAddingGoal && (
          <form onSubmit={handleAddGoal} className="p-4 bg-slate-900 border border-amber-800/70 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">Novo Objetivo de Aprendizagem</span>
              <button
                type="button"
                onClick={() => setIsAddingGoal(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400">Descrição Clara da Meta</label>
              <input
                type="text"
                required
                placeholder="Ex: Identificar a ideia central de parágrafos curtos com apoio de esquema gráfico..."
                value={newGoalDesc}
                onChange={(e) => setNewGoalDesc(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-400">Processo Cognitivo / Habilidade</label>
                <select
                  value={newGoalProcess}
                  onChange={(e) => setNewGoalProcess(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {PSYCHOPEDAGOGY_PROCESSES.map((proc) => (
                    <option key={proc} value={proc}>
                      {proc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400">Critério de Alcance / Indicador</label>
                <input
                  type="text"
                  placeholder="Ex: Em 4 de 5 tentativas com mediação mínima"
                  value={newGoalCriteria}
                  onChange={(e) => setNewGoalCriteria(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                </input>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition"
            >
              Salvar Objetivo no Plano
            </button>
          </form>
        )}

        {/* Lista de Objetivos com Ação de Planejar Atividade */}
        <div className="space-y-3">
          {plan.priorityGoals.map((goal) => (
            <div
              key={goal.id}
              className="p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300 text-[10px] font-bold">
                      {goal.targetProcess}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] uppercase font-bold">
                      Prioridade {goal.priority}
                    </span>
                    {goal.reviewDate && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Revisão: {goal.reviewDate}
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-100">{goal.description}</h5>
                </div>

                {/* BOTÃO CENTRAL REQUISITADO: PLANEJAR ATIVIDADE PARA ESTE OBJETIVO */}
                <button
                  type="button"
                  onClick={() => onPlanActivityForGoal(goal)}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm self-start"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Planejar Atividade para Este Objetivo</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400">Critério de Alcance:</span>
                  <p className="text-slate-300">{goal.reachCriteria}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400">Estratégias Previstas:</span>
                  <p className="text-slate-300">
                    {goal.strategiesPlanned?.join(", ") || "A definir no plano de aula/intervenção"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
