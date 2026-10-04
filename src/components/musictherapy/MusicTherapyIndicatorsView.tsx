import React, { useMemo } from "react";
import { 
  Activity, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Clock
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from "recharts";
import { MusicotherapyCase } from "../../types/musicotherapy";
import { MusicTherapySession, MusicTherapyResponseKey } from "../../types";

interface MusicTherapyIndicatorsViewProps {
  currentCase: MusicotherapyCase;
  sessions?: MusicTherapySession[];
  isDark?: boolean;
}

export const MusicTherapyIndicatorsView: React.FC<MusicTherapyIndicatorsViewProps> = ({
  currentCase,
  sessions: propSessions,
  isDark = true,
}) => {
  // Obter sessões reais vinculadas a este caso (das props ou do armazenamento)
  const caseSessions = useMemo(() => {
    let list: MusicTherapySession[] = [];
    if (propSessions && Array.isArray(propSessions)) {
      list = propSessions;
    } else {
      try {
        const stored = localStorage.getItem("neuroconecta_musictherapy_sessions");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) list = parsed;
        }
      } catch {}
    }

    // Filtrar sessões pertencentes a este paciente
    return list
      .filter((s) => {
        if (!s.patientName) return true;
        const sName = s.patientName.toLowerCase().trim();
        const cName = currentCase.patient_name.toLowerCase().trim();
        return sName === cName || sName.includes(cName) || cName.includes(sName);
      })
      .sort((a, b) => a.sessionNumber - b.sessionNumber);
  }, [propSessions, currentCase.patient_name]);

  const sessionCount = caseSessions.length;

  // Cálculos longitudinais determinísticos derivados das sessões reais
  const metrics = useMemo(() => {
    if (sessionCount === 0) {
      return {
        avgEngajamento: 0,
        avgTolerancia: 0,
        avgInteracao: 0,
        avgComunicacao: 0,
        avgAutorregulacao: 0,
        overallAvg: 0,
        gainLabel: "Sem registros",
        gainDelta: 0,
        timelineData: [],
        radarData: [],
      };
    }

    // Gerar série temporal com respostas reais
    const timelineData = caseSessions.map((s, idx) => {
      const eng = s.observedResponses?.engajamento?.score || 3;
      const tol = s.observedResponses?.tolerancia_sensorial?.score || 3;
      const inter = s.observedResponses?.interacao?.score || 3;
      const com = s.observedResponses?.comunicacao?.score || 3;
      const aut = s.observedResponses?.autorregulacao?.score || 3;
      const media = Number(((eng + tol + inter + com + aut) / 5).toFixed(1));

      let dataLabel = `Sessão ${s.sessionNumber || idx + 1}`;
      if (s.date) {
        const parts = s.date.split("-");
        if (parts.length === 3) dataLabel = `${parts[2]}/${parts[1]}`;
      }

      return {
        sessao: `S${s.sessionNumber || idx + 1}`,
        data: dataLabel,
        engajamento: eng,
        tolerancia: tol,
        interacao: inter,
        comunicacao: com,
        autorregulacao: aut,
        media,
      };
    });

    const sumEng = timelineData.reduce((acc, d) => acc + d.engajamento, 0);
    const sumTol = timelineData.reduce((acc, d) => acc + d.tolerancia, 0);
    const sumInter = timelineData.reduce((acc, d) => acc + d.interacao, 0);
    const sumCom = timelineData.reduce((acc, d) => acc + d.comunicacao, 0);
    const sumAut = timelineData.reduce((acc, d) => acc + d.autorregulacao, 0);

    const avgEngajamento = Number((sumEng / sessionCount).toFixed(1));
    const avgTolerancia = Number((sumTol / sessionCount).toFixed(1));
    const avgInteracao = Number((sumInter / sessionCount).toFixed(1));
    const avgComunicacao = Number((sumCom / sessionCount).toFixed(1));
    const avgAutorregulacao = Number((sumAut / sessionCount).toFixed(1));
    const overallAvg = Number(((avgEngajamento + avgTolerancia + avgInteracao + avgComunicacao + avgAutorregulacao) / 5).toFixed(1));

    // Comparativo entre Primeira e Última sessão para o Radar e Ganho Real
    const first = timelineData[0];
    const last = timelineData[sessionCount - 1];
    const gainDelta = Number((last.media - first.media).toFixed(1));

    let gainLabel = "Linha de Base Inicial";
    if (sessionCount >= 2) {
      if (gainDelta > 0) gainLabel = `Ganho no Período: +${gainDelta} pts`;
      else if (gainDelta < 0) gainLabel = `Variação no Período: ${gainDelta} pts`;
      else gainLabel = "Desfecho Estável (0.0 pts)";
    }

    const radarData = [
      { domain: "Engajamento Sonoro", inicial: first.engajamento, atual: last.engajamento, fullMark: 5 },
      { domain: "Tolerância Acústica", inicial: first.tolerancia, atual: last.tolerancia, fullMark: 5 },
      { domain: "Interação / Turnos", inicial: first.interacao, atual: last.interacao, fullMark: 5 },
      { domain: "Comunicação Expressiva", inicial: first.comunicacao, atual: last.comunicacao, fullMark: 5 },
      { domain: "Autorregulação", inicial: first.autorregulacao, atual: last.autorregulacao, fullMark: 5 },
    ];

    return {
      avgEngajamento,
      avgTolerancia,
      avgInteracao,
      avgComunicacao,
      avgAutorregulacao,
      overallAvg,
      gainLabel,
      gainDelta,
      timelineData,
      radarData,
    };
  }, [caseSessions, sessionCount]);

  return (
    <div className="space-y-6">
      {/* Header com Indicadores Reais */}
      <div
        className={`p-6 rounded-2xl border shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                Evolução Longitudinal • Indicadores Clínicos
              </span>
              <span className="text-xs text-slate-400">
                Pessoa Acompanhada: <strong>{currentCase.patient_name}</strong>
              </span>
            </div>
            <h2 className="text-xl font-black mt-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Métricas & Curva de Desenvolvimento
            </h2>
            <p className="text-xs text-slate-400">
              Acompanhamento de desfechos clínicos e respostas sonoro-musicais registradas nas sessões.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {sessionCount > 0 ? (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-4 h-4" /> {metrics.gainLabel}
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Aguardando sessões
              </span>
            )}
          </div>
        </div>

        {/* Resumo dos 4 Principais Indicadores Calculados */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-semibold block text-[11px]">Engajamento Sonoro</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-teal-400">
                {sessionCount > 0 ? `${metrics.avgEngajamento}` : "—"}
              </span>
              <span className="text-[10px] text-slate-500">/ 5.0</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {sessionCount > 0 ? `Média de ${sessionCount} sessões` : "Sem registros"}
            </span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-semibold block text-[11px]">Tolerância Acústica</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-amber-400">
                {sessionCount > 0 ? `${metrics.avgTolerancia}` : "—"}
              </span>
              <span className="text-[10px] text-slate-500">/ 5.0</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {sessionCount > 0 ? "Acomodação sensorial" : "Sem registros"}
            </span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-semibold block text-[11px]">Interação & Turnos</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-indigo-400">
                {sessionCount > 0 ? `${metrics.avgInteracao}` : "—"}
              </span>
              <span className="text-[10px] text-slate-500">/ 5.0</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {sessionCount > 0 ? "Reciprocidade no dueto" : "Sem registros"}
            </span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-semibold block text-[11px]">Autorregulação</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-emerald-400">
                {sessionCount > 0 ? `${metrics.avgAutorregulacao}` : "—"}
              </span>
              <span className="text-[10px] text-slate-500">/ 5.0</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {sessionCount > 0 ? "Estabilidade pós-intervenção" : "Sem registros"}
            </span>
          </div>
        </div>
      </div>

      {/* Estados de Exibição dos Gráficos Recharts */}
      {sessionCount === 0 ? (
        <div className="p-10 bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-950 border border-teal-800 text-teal-400 mx-auto flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">Nenhuma sessão registrada para este caso clínico</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Os gráficos de curva temporal e radar multidimensional são calculados a partir dos registros estruturados de sessão.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de Linhas: Curva Temporal Real */}
          <div
            className={`lg:col-span-2 p-5 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" /> Curva Temporal de Respostas Clínicas (1 a 5)
              </h3>
              <span className="text-[11px] text-slate-400">
                {sessionCount} {sessionCount === 1 ? "Sessão Registrada" : "Sessões Registradas"}
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                  <XAxis dataKey="sessao" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={11} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={11} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                      borderRadius: "0.75rem",
                      fontSize: "11px",
                      color: isDark ? "#f8fafc" : "#0f172a"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="engajamento" name="Engajamento" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="tolerancia" name="Tolerância" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="interacao" name="Interação" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="autorregulacao" name="Autorregulação" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="media" name="Média Geral" stroke="#ec4899" strokeWidth={2.5} strokeDasharray="3 3" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico Radar Comparativo Real */}
          <div
            className={`p-5 rounded-2xl border shadow-sm ${
              isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" /> Comparativo Multidimensional
              </h3>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={metrics.radarData}>
                  <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />
                  <PolarAngleAxis dataKey="domain" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[1, 5]} stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={9} />
                  <Radar name="Sessão Inicial (Base)" dataKey="inicial" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.25} />
                  <Radar name="Sessão Mais Recente" dataKey="atual" stroke="#0d9488" fill="#0d9488" fillOpacity={0.5} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                      borderRadius: "0.75rem",
                      fontSize: "11px"
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
