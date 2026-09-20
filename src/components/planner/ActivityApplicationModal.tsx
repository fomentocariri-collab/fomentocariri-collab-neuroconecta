import React, { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  HeartHandshake, 
  HelpCircle, 
  Smile, 
  Meh, 
  Frown,
  Save,
  MessageSquare,
  ShieldCheck
} from "lucide-react";
import { PlannedActivity, SupportLevelType } from "../../types";

interface ActivityApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: PlannedActivity;
  onSaveApplication: (data: {
    appliedDate: string;
    wasCompleted: boolean;
    actualDurationMinutes: number;
    supportLevel: SupportLevelType;
    engagementScore: number;
    strategiesWorked: string[];
    difficultiesObserved?: string;
    adaptationsMade?: string;
    learnerFeedback?: {
      likedScore?: "gostei_muito" | "gostei" | "mais_ou_menos" | "dificil" | "nao_gostei";
      understood?: "sim" | "mais_ou_menos" | "nao";
      whatHelped?: string;
      whatWasHard?: string;
      whatHelpWasUseful?: string;
    };
    observations: string;
    nextSteps?: string;
  }) => void;
  isDark?: boolean;
}

export const ActivityApplicationModal: React.FC<ActivityApplicationModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSaveApplication,
  isDark = true,
}) => {
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split("T")[0]);
  const [wasCompleted, setWasCompleted] = useState(true);
  const [actualDurationMinutes, setActualDurationMinutes] = useState(30);
  const [supportLevel, setSupportLevel] = useState<SupportLevelType>("APOIO_LEVE");
  const [engagementScore, setEngagementScore] = useState(4);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [customStrategy, setCustomStrategy] = useState("");
  const [difficultiesObserved, setDifficultiesObserved] = useState("");
  const [adaptationsMade, setAdaptationsMade] = useState("");
  const [observations, setObservations] = useState("");
  const [nextSteps, setNextSteps] = useState("");

  // Feedback do Aprendente / Paciente (4 perguntas participativas NC-CORE-03)
  const [learnerLiked, setLearnerLiked] = useState<"gostei_muito" | "gostei" | "mais_ou_menos" | "dificil" | "nao_gostei">("gostei");
  const [learnerUnderstood, setLearnerUnderstood] = useState<"sim" | "mais_ou_menos" | "nao">("sim");
  const [learnerWhatHelped, setLearnerWhatHelped] = useState("");
  const [learnerWhatWasHard, setLearnerWhatWasHard] = useState("");
  const [learnerWhatHelpWasUseful, setLearnerWhatHelpWasUseful] = useState("");

  if (!isOpen) return null;

  const defaultStrategies = [
    "Roteiro visual no quadro ou mesa",
    "Divisão da tarefa em micro-passos",
    "Pausas de descompressão programadas",
    "Uso de material concreto/tátil",
    "Possibilidade de resposta oral/desenho",
    "Ambiente com ruído reduzido / abafador",
    "Mediação calma e previsível",
  ];

  const toggleStrategy = (strategy: string) => {
    if (selectedStrategies.includes(strategy)) {
      setSelectedStrategies(selectedStrategies.filter((s) => s !== strategy));
    } else {
      setSelectedStrategies([...selectedStrategies, strategy]);
    }
  };

  const handleAddCustomStrategy = () => {
    if (customStrategy.trim() && !selectedStrategies.includes(customStrategy.trim())) {
      setSelectedStrategies([...selectedStrategies, customStrategy.trim()]);
      setCustomStrategy("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApplication({
      appliedDate,
      wasCompleted,
      actualDurationMinutes,
      supportLevel,
      engagementScore,
      strategiesWorked: selectedStrategies,
      difficultiesObserved: difficultiesObserved.trim() || undefined,
      adaptationsMade: adaptationsMade.trim() || undefined,
      learnerFeedback: {
        likedScore: learnerLiked,
        understood: learnerUnderstood,
        whatHelped: learnerWhatHelped.trim() || undefined,
        whatWasHard: learnerWhatWasHard.trim() || undefined,
        whatHelpWasUseful: learnerWhatHelpWasUseful.trim() || undefined,
      },
      observations: observations.trim() || "Atividade aplicada conforme o planejamento pedagógico/terapêutico.",
      nextSteps: nextSteps.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-2xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Topo */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
              Registro de Aplicação & Memória Pedagógica
            </span>
            <h3 className="text-base font-bold text-slate-100 mt-0.5">{activity.title}</h3>
            <p className="text-xs text-slate-400">
              {activity.assistedUserName
                ? `Aplicada para: ${activity.assistedUserName}`
                : "Aplicada para turma / grupo"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Dados Gerais de Aplicação */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300">Data da Aplicação</label>
              <input
                type="date"
                required
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300">Duração Real (minutos)</label>
              <input
                type="number"
                min={5}
                max={240}
                required
                value={actualDurationMinutes}
                onChange={(e) => setActualDurationMinutes(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300">Realização da Proposta</label>
              <select
                value={wasCompleted ? "completa" : "parcial"}
                onChange={(e) => setWasCompleted(e.target.value === "completa")}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="completa">Concluída integralmente</option>
                <option value="parcial">Realização parcial / adaptada no momento</option>
              </select>
            </div>
          </div>

          {/* Nível de Apoio e Engajamento */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Nível de Apoio Real Observado</span>
                <span className="text-[10px] text-teal-400 font-normal">Base para evolução longitudinal</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {[
                  { id: "INDEPENDENTE", label: "Independente", desc: "Realizou com instruções gerais" },
                  { id: "APOIO_LEVE", label: "Apoio Leve", desc: "Incentivo verbal ou checagem" },
                  { id: "APOIO_FREQUENTE", label: "Apoio Frequente", desc: "Mediação passo a passo" },
                  { id: "APOIO_INTENSIVO", label: "Apoio Intensivo", desc: "Co-execução e alta mediação" },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSupportLevel(lvl.id as SupportLevelType)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      supportLevel === lvl.id
                        ? "bg-teal-950 border-teal-500 text-teal-200 ring-1 ring-teal-500/50"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <p className="text-xs font-bold">{lvl.label}</p>
                    <p className="text-[10px] opacity-75 mt-0.5 leading-tight">{lvl.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Engajamento e Conforto Observado</span>
                <span className="text-xs font-bold text-teal-400">{engagementScore} de 5</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={engagementScore}
                onChange={(e) => setEngagementScore(Number(e.target.value))}
                className="w-full mt-2 accent-teal-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 px-1 mt-1">
                <span>1 - Desconforto / Resistência</span>
                <span>3 - Participação Neutra</span>
                <span>5 - Alto Interesse & Fluidez</span>
              </div>
            </div>
          </div>

          {/* Estratégias que mais ajudaram */}
          <div>
            <label className="text-xs font-bold text-slate-200">Estratégias que Ajudaram na Execução</label>
            <p className="text-[11px] text-slate-400 mb-2">
              Selecione as mediações e recursos que favoreceram a aprendizagem ou regulação:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {defaultStrategies.map((strat) => {
                const isSelected = selectedStrategies.includes(strat);
                return (
                  <button
                    key={strat}
                    type="button"
                    onClick={() => toggleStrategy(strat)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition border ${
                      isSelected
                        ? "bg-teal-600 text-white border-teal-500 font-semibold shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {strat}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                placeholder="Adicionar outra estratégia observada..."
                value={customStrategy}
                onChange={(e) => setCustomStrategy(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomStrategy())}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleAddCustomStrategy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold rounded-xl text-xs transition"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Dificuldades & Adaptações feitas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300">
                Dificuldades ou Sobrecargas Observadas
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Cansaço no terceiro parágrafo, inquietação sonora..."
                value={difficultiesObserved}
                onChange={(e) => setDifficultiesObserved(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300">
                Adaptações Improvisadas ou Ajustes no Momento
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Reduzido de 4 para 2 itens, feita pausa de água..."
                value={adaptationsMade}
                onChange={(e) => setAdaptationsMade(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Participação do Aprendente / Paciente (Feedback Participativo NC-CORE-03) */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-400">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs font-bold">Participação e Escuta do Aprendente / Paciente</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">Registro colaborativo</span>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block mb-1">Como você se sentiu nesta atividade?</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "gostei_muito", label: "Adorei 😄" },
                  { id: "gostei", label: "Gostei 🙂" },
                  { id: "mais_ou_menos", label: "Neutro 😐" },
                  { id: "dificil", label: "Difícil 😓" },
                  { id: "nao_gostei", label: "Não gostei 🙁" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setLearnerLiked(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition ${
                      learnerLiked === f.id
                        ? "bg-teal-900 border-teal-500 text-teal-200 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  1. O que ajudou você nesta atividade?
                </label>
                <input
                  type="text"
                  placeholder="Ex: O exemplo com desenhos, o material concreto, o tempo..."
                  value={learnerWhatHelped}
                  onChange={(e) => setLearnerWhatHelped(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  2. O que foi difícil para você?
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ler o texto longo, o barulho da sala, lembrar a ordem..."
                  value={learnerWhatWasHard}
                  onChange={(e) => setLearnerWhatWasHard(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  3. Você entendeu o que precisava fazer?
                </label>
                <div className="flex gap-2">
                  {[
                    { id: "sim", label: "Sim, ficou claro" },
                    { id: "mais_ou_menos", label: "Mais ou menos" },
                    { id: "nao", label: "Não entendi bem" },
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setLearnerUnderstood(u.id as any)}
                      className={`flex-1 py-1 rounded-lg text-xs border transition text-center ${
                        learnerUnderstood === u.id
                          ? "bg-teal-900 border-teal-500 text-teal-200 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  4. Que tipo de ajuda foi mais útil?
                </label>
                <input
                  type="text"
                  placeholder="Ex: A professora fazer junto a primeira vez, ler em voz alta..."
                  value={learnerWhatHelpWasUseful}
                  onChange={(e) => setLearnerWhatHelpWasUseful(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Observações Gerais e Próximos Passos */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300">
                Parecer / Observações do Profissional
              </label>
              <textarea
                rows={3}
                placeholder="Síntese da evolução na atividade para relatórios futuros..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300">
                Próximos Passos Recomendados
              </label>
              <input
                type="text"
                placeholder="Ex: Repetir atividade com menor apoio verbal ou avançar para etapa 2."
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Botão de Conclusão */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Registro de Aplicação</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
