import React, { useState, useEffect } from "react";
import { 
  Target, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Edit3, 
  Trash2, 
  Layers, 
  Sliders, 
  ShieldCheck, 
  Award,
  Sparkles,
  Music
} from "lucide-react";
import { 
  MusicotherapyCase, 
  MusicotherapyPlan, 
  MusicotherapyGoal,
  GoalDomainKey
} from "../../types/musicotherapy";
import { musicotherapyService } from "../../services/musicotherapyService";

interface MusicTherapyPlanManagementProps {
  currentCase: MusicotherapyCase;
  isDark?: boolean;
}

const DOMAIN_LABELS: Record<GoalDomainKey, { label: string; color: string }> = {
  comunicacao: { label: "Comunicação & Expressão", color: "text-sky-400 bg-sky-950/60 border-sky-800" },
  interacao_social: { label: "Interação Social & Turnos", color: "text-indigo-400 bg-indigo-950/60 border-indigo-800" },
  atencao: { label: "Atenção & Engajamento", color: "text-purple-400 bg-purple-950/60 border-purple-800" },
  autorregulacao: { label: "Autorregulação & Acalento", color: "text-emerald-400 bg-emerald-950/60 border-emerald-800" },
  resposta_sensorial: { label: "Tolerância Sensorial Auditiva", color: "text-amber-400 bg-amber-950/60 border-amber-800" },
  aspectos_motores: { label: "Aspectos Motores & Práxis", color: "text-rose-400 bg-rose-950/60 border-rose-800" },
  cognicao: { label: "Cognição & Sequenciamento", color: "text-teal-400 bg-teal-950/60 border-teal-800" },
  expressao_emocional: { label: "Expressão Emocional", color: "text-pink-400 bg-pink-950/60 border-pink-800" },
  participacao: { label: "Participação Social", color: "text-blue-400 bg-blue-950/60 border-blue-800" },
  autonomia: { label: "Autonomia & Escolha", color: "text-green-400 bg-green-950/60 border-green-800" },
  qualidade_de_vida: { label: "Qualidade de Vida", color: "text-yellow-400 bg-yellow-950/60 border-yellow-800" },
  outros: { label: "Outros Objetivos", color: "text-slate-400 bg-slate-950/60 border-slate-800" },
};

export const MusicTherapyPlanManagement: React.FC<MusicTherapyPlanManagementProps> = ({
  currentCase,
  isDark = true,
}) => {
  const [goals, setGoals] = useState<MusicotherapyGoal[]>([]);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [generalGoals, setGeneralGoals] = useState(
    "Ampliar a reciprocidade comunicativa através da música, aumentar a tolerância ao ambiente acústico escolar e consolidar recursos lúdicos sonoros de autorregulação."
  );
  const [strategies, setStrategies] = useState(
    "Técnicas de improvisação musical interativa, canções de transição estruturadas, exploração sensorial em xilofone/metalofone e desaceleração com tons binaurais suaves."
  );
  const [frequency, setFrequency] = useState("1 sessão semanal de 50 minutos");

  // Form states for new goal
  const [goalDomain, setGoalDomain] = useState<GoalDomainKey>("interacao_social");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalBaseline, setGoalBaseline] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadGoals();
  }, [currentCase.id]);

  const loadGoals = async () => {
    // Seed inicial de metas se ainda não existirem
    const defaultGoals: MusicotherapyGoal[] = [
      {
        id: "goal-01",
        plan_id: `plan-${currentCase.id}`,
        case_id: currentCase.id,
        patient_id: currentCase.patient_id,
        domain: "interacao_social",
        description: "Alternar turnos musicais (tocar e aguardar) em atividade percussiva estruturada.",
        baseline: "Sustenta até 2 turnos com mediação física direta.",
        target: "Realizar 6 turnos alternados consecutivos com apoio verbal mínimo ou visual.",
        status: "active",
        start_date: "2026-02-15",
        professional_id: currentCase.professional_id,
      },
      {
        id: "goal-02",
        plan_id: `plan-${currentCase.id}`,
        case_id: currentCase.id,
        patient_id: currentCase.patient_id,
        domain: "comunicacao",
        description: "Expressar intenção comunicativa de escolha entre 2 instrumentos musicais.",
        baseline: "Pega impulsivamente sem apontar ou vocalizar.",
        target: "Apontar espontaneamente ou vocalizar a sílaba inicial do instrumento desejado em 80% das oportunidades.",
        status: "active",
        start_date: "2026-02-15",
        professional_id: currentCase.professional_id,
      },
      {
        id: "goal-03",
        plan_id: `plan-${currentCase.id}`,
        case_id: currentCase.id,
        patient_id: currentCase.patient_id,
        domain: "resposta_sensorial",
        description: "Permanecer na sala tolerando sons de intensidade moderada (até 65 dB) sem sobrecarga sensorial.",
        baseline: "Apresenta desconforto auditivo e cobre ouvidos após 5 minutos.",
        target: "Permanecer regulado por 20 minutos com acomodações sonoras previsíveis.",
        status: "partially_achieved",
        start_date: "2026-02-15",
        professional_id: currentCase.professional_id,
      },
      {
        id: "goal-04",
        plan_id: `plan-${currentCase.id}`,
        case_id: currentCase.id,
        patient_id: currentCase.patient_id,
        domain: "autorregulacao",
        description: "Engajar-se no ritual de desaceleração sonora ao final da sessão.",
        baseline: "Apresenta agitação motora na transição para finalizar o encontro.",
        target: "Deitar ou sentar-se confortavelmente escutando canção de encerramento por 3 minutos.",
        status: "achieved",
        start_date: "2026-02-15",
        professional_id: currentCase.professional_id,
      },
    ];

    setGoals(defaultGoals);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalDescription.trim() || !goalBaseline.trim() || !goalTarget.trim()) return;

    const newGoal: MusicotherapyGoal = {
      id: `goal-${Date.now().toString(36)}`,
      plan_id: `plan-${currentCase.id}`,
      case_id: currentCase.id,
      patient_id: currentCase.patient_id,
      domain: goalDomain,
      description: goalDescription.trim(),
      baseline: goalBaseline.trim(),
      target: goalTarget.trim(),
      status: "active",
      start_date: new Date().toISOString().split("T")[0],
      professional_id: currentCase.professional_id,
    };

    const next = [...goals, newGoal];
    setGoals(next);
    setShowNewGoalModal(false);
    setGoalDescription("");
    setGoalBaseline("");
    setGoalTarget("");
    setFeedback("Nova meta terapêutica adicionada ao plano.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleToggleGoalStatus = (goalId: string, currentStatus: MusicotherapyGoal["status"]) => {
    const nextStatus: MusicotherapyGoal["status"] = 
      currentStatus === "active" ? "partially_achieved" :
      currentStatus === "partially_achieved" ? "achieved" : "active";

    setGoals(goals.map(g => g.id === goalId ? { ...g, status: nextStatus } : g));
  };

  return (
    <div className="space-y-6">
      {/* Header do Plano Terapêutico Singular */}
      <div className={`p-6 rounded-2xl border shadow-sm ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                PTS-MT • Plano Terapêutico Singular de Musicoterapia
              </span>
              <span className="text-xs text-slate-400">Pessoa Acompanhada: <strong>{currentCase.patient_name}</strong></span>
            </div>
            <h2 className="text-xl font-black mt-1 flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Diretrizes Terapêuticas & Metas SMART
            </h2>
            <p className="text-xs text-slate-400">
              Metas funcionais orientadas para autonomia, comunicação, autorregulação e conforto sensorial no cotidiano.
            </p>
          </div>

          <button
            onClick={() => setShowNewGoalModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" /> Nova Meta Terapêutica
          </button>
        </div>

        {/* Diretrizes Gerais do Plano */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 text-xs">
          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-bold block mb-1">Objetivos Gerais Centrais:</span>
            <p className="text-slate-200 text-[11px] leading-relaxed">{generalGoals}</p>
          </div>
          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-bold block mb-1">Estratégias Musico-Terapêuticas:</span>
            <p className="text-slate-200 text-[11px] leading-relaxed">{strategies}</p>
          </div>
          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-bold block mb-1">Frequência & Previsão:</span>
            <p className="text-teal-400 font-bold text-xs">{frequency}</p>
            <span className="text-[10px] text-slate-400 block mt-1">Revisão semestral programada</span>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-700 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Lista de Metas do Plano */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" /> Metas em Acompanhamento ({goals.length})
          </h3>
          <span className="text-[11px] text-slate-400">Clique no status para alternar o progresso</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const domainInfo = DOMAIN_LABELS[g.domain] || DOMAIN_LABELS.outros;
            return (
              <div
                key={g.id}
                className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between transition ${
                  isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${domainInfo.color}`}>
                      {domainInfo.label}
                    </span>
                    <button
                      onClick={() => handleToggleGoalStatus(g.id, g.status)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition flex items-center gap-1 ${
                        g.status === "achieved"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                          : g.status === "partially_achieved"
                          ? "bg-amber-950 text-amber-300 border border-amber-700"
                          : "bg-sky-950 text-sky-300 border border-sky-700"
                      }`}
                      title="Clique para alternar o status"
                    >
                      {g.status === "achieved" && "✓ Atingida"}
                      {g.status === "partially_achieved" && "⚡ Em Progresso"}
                      {g.status === "active" && "● Em Andamento"}
                    </button>
                  </div>

                  <h4 className="text-xs font-extrabold text-slate-100 mb-3 leading-snug">
                    {g.description}
                  </h4>

                  <div className="space-y-1.5 text-[11px] border-t border-slate-800/80 pt-2.5">
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-400 font-bold shrink-0">Linha de Base (Início):</span>
                      <span className="text-slate-300">{g.baseline}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-teal-400 font-bold shrink-0">Meta Alvo (Target):</span>
                      <span className="text-slate-200 font-semibold">{g.target}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-3 mt-3 border-t border-slate-800">
                  <span>Iniciada em: {g.start_date}</span>
                  <span className="text-teal-400/80 font-mono">ID: {g.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Adicionar Meta */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-teal-400">
                <Target className="w-5 h-5" /> Adicionar Meta Terapêutica (PTS-MT)
              </h3>
              <button onClick={() => setShowNewGoalModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Domínio da Meta *</label>
                <select
                  value={goalDomain}
                  onChange={(e) => setGoalDomain(e.target.value as GoalDomainKey)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                >
                  {Object.entries(DOMAIN_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição Funcional da Meta *</label>
                <textarea
                  required
                  rows={2}
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Ex: Ampliar contato visual durante a execução conjunta em dueto no teclado..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Linha de Base / Baseline (Ponto de Partida) *</label>
                <input
                  type="text"
                  required
                  value={goalBaseline}
                  onChange={(e) => setGoalBaseline(e.target.value)}
                  placeholder="Ex: Mantém olhar por 2 segundos antes de desviar..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-teal-300 mb-1">Meta Alvo / Target Esperado *</label>
                <input
                  type="text"
                  required
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder="Ex: Sustentar contato visual por 6 a 8 segundos em momentos de pausa melódica..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md"
                >
                  Salvar Meta no Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
