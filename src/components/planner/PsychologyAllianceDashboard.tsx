import React, { useMemo } from "react";
import { 
  TrendingUp, 
  HeartHandshake, 
  Target, 
  Compass, 
  CheckSquare, 
  AlertCircle, 
  HelpCircle,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { TherapeuticProcessCheckIn, PsychologyTherapeuticProcess } from "../../types";

interface PsychologyAllianceDashboardProps {
  process: PsychologyTherapeuticProcess;
  patientDisplayName: string;
  isDark?: boolean;
  onNavigateToCheckInTab?: () => void;
}

export const PsychologyAllianceDashboard: React.FC<PsychologyAllianceDashboardProps> = ({
  process,
  patientDisplayName,
  isDark = true,
  onNavigateToCheckInTab,
}) => {
  // Ordenar check-ins por data cronológica crescente para cálculo longitudinal consistente
  const sortedCheckIns = useMemo(() => {
    return [...process.processCheckIns].sort((a, b) => {
      const timeA = new Date(a.date || a.createdAt || "").getTime();
      const timeB = new Date(b.date || b.createdAt || "").getTime();
      return timeA - timeB;
    });
  }, [process.processCheckIns]);

  const count = sortedCheckIns.length;

  // Cálculos estritamente determinísticos derivados dos dados reais
  const stats = useMemo(() => {
    if (count === 0) {
      return {
        avgGeneral: 0,
        avgVinculo: 0,
        avgSentido: 0,
        avgMetas: 0,
        avgTarefas: 0,
        deltaGeneral: 0,
        firstGeneral: 0,
        lastGeneral: 0,
        dimensionDeltas: {
          vinculo: 0,
          sentido: 0,
          metas: 0,
          tarefas: 0,
        },
        trendStatus: "sem_dados" as const,
        trendMessage: "Aguardando registros clínicos",
        dimensionAlert: null as string | null,
      };
    }

    const sumVinculo = sortedCheckIns.reduce((acc, c) => acc + c.feltHeardScore, 0);
    const sumSentido = sortedCheckIns.reduce((acc, c) => acc + c.sessionMadeSenseScore, 0);
    const sumMetas = sortedCheckIns.reduce((acc, c) => acc + c.understoodGoalsScore, 0);
    const sumTarefas = sortedCheckIns.reduce((acc, c) => acc + c.taskFeasibleScore, 0);

    const avgVinculo = Number((sumVinculo / count).toFixed(2));
    const avgSentido = Number((sumSentido / count).toFixed(2));
    const avgMetas = Number((sumMetas / count).toFixed(2));
    const avgTarefas = Number((sumTarefas / count).toFixed(2));

    const avgGeneral = Number(((avgVinculo + avgSentido + avgMetas + avgTarefas) / 4).toFixed(2));

    // Primeiro e último check-in para variação no período
    const first = sortedCheckIns[0];
    const last = sortedCheckIns[count - 1];

    const firstGeneral = Number(
      ((first.feltHeardScore + first.sessionMadeSenseScore + first.understoodGoalsScore + first.taskFeasibleScore) / 4).toFixed(2)
    );
    const lastGeneral = Number(
      ((last.feltHeardScore + last.sessionMadeSenseScore + last.understoodGoalsScore + last.taskFeasibleScore) / 4).toFixed(2)
    );

    const deltaGeneral = Number((lastGeneral - firstGeneral).toFixed(2));

    const dimensionDeltas = {
      vinculo: Number((last.feltHeardScore - first.feltHeardScore).toFixed(1)),
      sentido: Number((last.sessionMadeSenseScore - first.sessionMadeSenseScore).toFixed(1)),
      metas: Number((last.understoodGoalsScore - first.understoodGoalsScore).toFixed(1)),
      tarefas: Number((last.taskFeasibleScore - first.taskFeasibleScore).toFixed(1)),
    };

    // Classificação transparente e objetiva da tendência
    let trendStatus: "melhorando" | "estavel" | "queda_recente" = "estavel";
    let trendMessage = "Percepção estável ao longo do período acompanhado.";
    let dimensionAlert: string | null = null;

    if (count >= 2) {
      if (deltaGeneral >= 0.3) {
        trendStatus = "melhorando";
        trendMessage = `Evolução positiva com ganho de +${deltaGeneral} pontos entre o primeiro e o último registro.`;
      } else if (deltaGeneral <= -0.3) {
        trendStatus = "queda_recente";
        trendMessage = `Atenção para oscilação ou redução de ${Math.abs(deltaGeneral)} pontos na média geral.`;
      } else {
        trendStatus = "estavel";
        trendMessage = "Estabilidade na percepção geral da aliança terapêutica no período.";
      }

      // Detecção de oscilação específica por dimensão para alertar o profissional de forma descritiva
      if (dimensionDeltas.tarefas <= -0.6) {
        dimensionAlert = `Redução recente no indicador de Viabilidade das Tarefas (de ${first.taskFeasibleScore} para ${last.taskFeasibleScore}).`;
      } else if (dimensionDeltas.sentido <= -0.6) {
        dimensionAlert = `Redução recente no indicador de Sentido da Sessão (de ${first.sessionMadeSenseScore} para ${last.sessionMadeSenseScore}).`;
      } else if (dimensionDeltas.metas <= -0.6) {
        dimensionAlert = `Redução recente na Clareza e Concordância das Metas (de ${first.understoodGoalsScore} para ${last.understoodGoalsScore}).`;
      } else if (dimensionDeltas.vinculo <= -0.6) {
        dimensionAlert = `Redução recente no indicador de Vínculo/Escuta (de ${first.feltHeardScore} para ${last.feltHeardScore}).`;
      }
    }

    return {
      avgGeneral,
      avgVinculo,
      avgSentido,
      avgMetas,
      avgTarefas,
      deltaGeneral,
      firstGeneral,
      lastGeneral,
      dimensionDeltas,
      trendStatus,
      trendMessage,
      dimensionAlert,
    };
  }, [sortedCheckIns, count]);

  // Formatação de dados para o Recharts
  const chartData = useMemo(() => {
    return sortedCheckIns.map((chk, idx) => {
      const avg = Number(
        ((chk.feltHeardScore + chk.sessionMadeSenseScore + chk.understoodGoalsScore + chk.taskFeasibleScore) / 4).toFixed(2)
      );

      // Formatar rótulo com dia/mês ou número sequencial
      let label = `Sessão ${idx + 1}`;
      if (chk.date) {
        const parts = chk.date.split("-");
        if (parts.length === 3) {
          label = `${parts[2]}/${parts[1]}`;
        }
      }

      return {
        name: label,
        fullName: `Check-in ${idx + 1} (${chk.date || "sem data"})`,
        date: chk.date,
        vinculo: chk.feltHeardScore,
        sentido: chk.sessionMadeSenseScore,
        metas: chk.understoodGoalsScore,
        tarefas: chk.taskFeasibleScore,
        mediaGeral: avg,
      };
    });
  }, [sortedCheckIns]);

  return (
    <div className="space-y-6">
      {/* 1. Header do Dashboard Longitudinal */}
      <div
        className={`p-6 rounded-2xl border shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Aliança Terapêutica • Dimensões da TCC
              </span>
              <span className="text-xs text-slate-400">
                Paciente: <strong className="text-indigo-300">{patientDisplayName || process.patientName}</strong>
              </span>
            </div>
            <h3 className="text-lg font-black mt-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Evolução da Aliança Terapêutica
            </h3>
            <p className="text-xs text-slate-400">
              Acompanhamento longitudinal das 4 dimensões colaborativas do processo (escala estruturada de 1 a 5).
            </p>
          </div>

          {/* Badge de Tendência Transparente */}
          {count >= 2 && (
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                  stats.trendStatus === "melhorando"
                    ? "bg-emerald-950/60 border-emerald-800 text-emerald-400"
                    : stats.trendStatus === "queda_recente"
                    ? "bg-amber-950/60 border-amber-800 text-amber-400"
                    : "bg-slate-950 border-slate-800 text-slate-300"
                }`}
              >
                {stats.trendStatus === "melhorando" && <ArrowUpRight className="w-4 h-4" />}
                {stats.trendStatus === "queda_recente" && <ArrowDownRight className="w-4 h-4" />}
                {stats.trendStatus === "estavel" && <Minus className="w-4 h-4" />}
                <span>
                  {stats.trendStatus === "melhorando" && "Tendência Positiva"}
                  {stats.trendStatus === "queda_recente" && "Atenção: Queda Recente"}
                  {stats.trendStatus === "estavel" && "Aliança Estável"}
                </span>
              </span>
              <span className="text-[10px] text-slate-400">{stats.trendMessage}</span>
            </div>
          )}
        </div>

        {/* Alerta Específico de Dimensão se detectada oscilação pontual */}
        {stats.dimensionAlert && (
          <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl flex items-start gap-2 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Apontamento Objetivo:</strong> {stats.dimensionAlert}
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                Recomenda-se abrir espaço de diálogo na próxima sessão para revisar o ritmo e a clareza das tarefas combinadas.
              </p>
            </div>
          </div>
        )}

        {/* 2. Cards de Indicadores (6 métricas estruturadas) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5 text-xs">
          {/* Check-ins Realizados */}
          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-medium block text-[11px]">Check-ins Feitos</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-indigo-400">{count}</span>
              <span className="text-[10px] text-slate-500">registros</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {count >= 2 ? "Base longitudinal" : "Amostra inicial"}
            </span>
          </div>

          {/* Média Geral da Aliança */}
          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-medium block text-[11px]">Média Geral</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-rose-400">
                {count > 0 ? stats.avgGeneral.toFixed(1) : "—"}
              </span>
              <span className="text-[10px] text-slate-500">/ 5.0</span>
            </div>
            {count >= 2 && (
              <span
                className={`text-[10px] font-bold block mt-1 ${
                  stats.deltaGeneral > 0
                    ? "text-emerald-400"
                    : stats.deltaGeneral < 0
                    ? "text-amber-400"
                    : "text-slate-400"
                }`}
              >
                {stats.deltaGeneral > 0 ? `+${stats.deltaGeneral}` : stats.deltaGeneral} no período
              </span>
            )}
          </div>

          {/* 1. Vínculo / Escuta */}
          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-medium block text-[11px] truncate" title="Vínculo e Escuta">
              Vínculo / Escuta
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-indigo-400">
                {count > 0 ? stats.avgVinculo.toFixed(1) : "—"}
              </span>
              <span className="text-[10px] text-slate-500">/ 5.0</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Sentir-se ouvido</span>
          </div>

          {/* 2. Sentido da Sessão */}
          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-medium block text-[11px] truncate" title="Sentido da Sessão">
              Sentido da Sessão
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-cyan-400">
                {count > 0 ? stats.avgSentido.toFixed(1) : "—"}
              </span>
              <span className="text-[10px] text-slate-500">/ 5.0</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Relevância temática</span>
          </div>

          {/* 3. Metas / Objetivos */}
          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-medium block text-[11px] truncate" title="Metas e Objetivos">
              Metas & Objetivos
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-purple-400">
                {count > 0 ? stats.avgMetas.toFixed(1) : "—"}
              </span>
              <span className="text-[10px] text-slate-500">/ 5.0</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Clareza acordada</span>
          </div>

          {/* 4. Viabilidade das Tarefas */}
          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-medium block text-[11px] truncate" title="Viabilidade das Tarefas">
              Viabilidade Tarefas
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-emerald-400">
                {count > 0 ? stats.avgTarefas.toFixed(1) : "—"}
              </span>
              <span className="text-[10px] text-slate-500">/ 5.0</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Exequibilidade prática</span>
          </div>
        </div>
      </div>

      {/* 3. Área do Gráfico com Tratamento Rigoroso de Estados de Dados */}
      {count === 0 ? (
        <div className="p-10 bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-800 text-indigo-400 mx-auto flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">Nenhum check-in registrado para este paciente</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            A evolução longitudinal é construída a partir dos check-ins de processo realizados ao final das sessões com o paciente.
          </p>
          {onNavigateToCheckInTab && (
            <button
              type="button"
              onClick={onNavigateToCheckInTab}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Registrar Primeiro Check-in
            </button>
          )}
        </div>
      ) : count === 1 ? (
        <div className="p-8 bg-slate-900/80 border border-indigo-900/40 rounded-3xl space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 shrink-0 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">
                São necessários pelo menos 2 check-ins para visualizar a evolução longitudinal no gráfico
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Atualmente existe 1 registro clínico datado de{" "}
                <strong className="text-indigo-300">{sortedCheckIns[0].date}</strong>. O gráfico de linhas com as 4 dimensões
                e média geral será ativado automaticamente a partir do segundo registro.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300 block mb-2">Primeiro Registro Real ({sortedCheckIns[0].date}):</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Vínculo / Escuta</span>
                <strong className="text-indigo-400 text-sm">{sortedCheckIns[0].feltHeardScore}/5</strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Sentido da Sessão</span>
                <strong className="text-cyan-400 text-sm">{sortedCheckIns[0].sessionMadeSenseScore}/5</strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Metas Claras</span>
                <strong className="text-purple-400 text-sm">{sortedCheckIns[0].understoodGoalsScore}/5</strong>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Tarefas Viáveis</span>
                <strong className="text-emerald-400 text-sm">{sortedCheckIns[0].taskFeasibleScore}/5</strong>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Gráfico Longitudinal com 2+ check-ins reais */
        <div
          className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Curva Longitudinal das 4 Dimensões da Aliança
              </h4>
              <p className="text-[11px] text-slate-400">
                Eixo Y: Escala de 1 a 5 | Eixo X: Ordem cronológica das sessões avaliadas
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-xl border border-indigo-800">
              Escala de Likert (1-5)
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                <XAxis 
                  dataKey="name" 
                  stroke={isDark ? "#64748b" : "#94a3b8"} 
                  fontSize={11} 
                />
                <YAxis 
                  domain={[1, 5]} 
                  ticks={[1, 2, 3, 4, 5]} 
                  stroke={isDark ? "#64748b" : "#94a3b8"} 
                  fontSize={11} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? "#090d16" : "#ffffff", 
                    borderColor: isDark ? "#334155" : "#cbd5e1",
                    borderRadius: "16px",
                    fontSize: "12px",
                    color: isDark ? "#f8fafc" : "#0f172a"
                  }} 
                  formatter={(value: any, name: any) => [
                    `${value} / 5`,
                    name === "vinculo"
                      ? "1. Vínculo / Escuta"
                      : name === "sentido"
                      ? "2. Sentido da Sessão"
                      : name === "metas"
                      ? "3. Metas / Objetivos"
                      : name === "tarefas"
                      ? "4. Viabilidade Tarefas"
                      : "Média Geral da Aliança"
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]?.payload?.fullName) {
                      return payload[0].payload.fullName;
                    }
                    return label;
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} 
                  formatter={(val) => {
                    if (val === "vinculo") return "Vínculo / Escuta";
                    if (val === "sentido") return "Sentido da Sessão";
                    if (val === "metas") return "Metas / Objetivos";
                    if (val === "tarefas") return "Viabilidade Tarefas";
                    if (val === "mediaGeral") return "Média Geral da Aliança";
                    return val;
                  }}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="vinculo" 
                  stroke="#6366f1" 
                  strokeWidth={2.5} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                  name="vinculo"
                />
                <Line 
                  type="monotone" 
                  dataKey="sentido" 
                  stroke="#06b6d4" 
                  strokeWidth={2.5} 
                  dot={{ r: 4 }} 
                  name="sentido"
                />
                <Line 
                  type="monotone" 
                  dataKey="metas" 
                  stroke="#8b5cf6" 
                  strokeWidth={2.5} 
                  dot={{ r: 4 }} 
                  name="metas"
                />
                <Line 
                  type="monotone" 
                  dataKey="tarefas" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={{ r: 4 }} 
                  name="tarefas"
                />
                <Line 
                  type="monotone" 
                  dataKey="mediaGeral" 
                  stroke="#f43f5e" 
                  strokeWidth={3} 
                  strokeDasharray="4 4" 
                  dot={{ r: 5 }} 
                  name="mediaGeral"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>
              Dimensões fundamentadas no modelo de Bordin / TCC: Vínculo afetivo, acordo sobre objetivos e colaboração nas tarefas.
            </span>
            <span className="text-slate-500 font-mono">
              Fórmula: Média Geral = (Vínculo + Sentido + Metas + Tarefas) / 4
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
