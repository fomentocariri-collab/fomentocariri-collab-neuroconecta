import React, { useState } from "react";
import { 
  Activity, 
  TrendingUp, 
  PlusCircle, 
  Calendar, 
  Sparkles, 
  Award, 
  CheckCircle2,
  Sliders,
  Filter
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
import { MusicotherapyCase, MusicotherapyIndicator } from "../../types/musicotherapy";

interface MusicTherapyIndicatorsViewProps {
  currentCase: MusicotherapyCase;
  isDark?: boolean;
}

export const MusicTherapyIndicatorsView: React.FC<MusicTherapyIndicatorsViewProps> = ({
  currentCase,
  isDark = true,
}) => {
  const [activeMetric, setActiveMetric] = useState<"todas" | "comunicacao" | "interacao" | "sensorial" | "autorregulacao">("todas");
  const [showAddModal, setShowAddModal] = useState(false);

  // Exemplo de dados longitudinais de evolução por sessão
  const timelineData = [
    { sessao: "Sessão 01", data: "12/02", engajamento: 2, tolerancia: 2, interacao: 1, comunicacao: 2, autorregulacao: 2 },
    { sessao: "Sessão 02", data: "19/02", engajamento: 3, tolerancia: 2, interacao: 2, comunicacao: 2, autorregulacao: 3 },
    { sessao: "Sessão 03", data: "26/02", engajamento: 3, tolerancia: 3, interacao: 3, comunicacao: 3, autorregulacao: 3 },
    { sessao: "Sessão 04", data: "05/03", engajamento: 4, tolerancia: 3, interacao: 3, comunicacao: 3, autorregulacao: 4 },
    { sessao: "Sessão 05", data: "12/03", engajamento: 4, tolerancia: 4, interacao: 4, comunicacao: 4, autorregulacao: 4 },
    { sessao: "Sessão 06", data: "19/03", engajamento: 5, tolerancia: 4, interacao: 4, comunicacao: 4, autorregulacao: 5 },
  ];

  // Dados para o Radar comparativo
  const radarData = [
    { domain: "Engajamento Sonoro", inicial: 2, atual: 5, fullMark: 5 },
    { domain: "Tolerância Acústica", inicial: 2, atual: 4, fullMark: 5 },
    { domain: "Interação / Turnos", inicial: 1, atual: 4, fullMark: 5 },
    { domain: "Comunicação Expressiva", inicial: 2, atual: 4, fullMark: 5 },
    { domain: "Autorregulação", inicial: 2, atual: 5, fullMark: 5 },
    { domain: "Sincronização Motora", inicial: 2, atual: 4, fullMark: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl border shadow-sm ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                Evolução Longitudinal • Indicadores Clínicos
              </span>
              <span className="text-xs text-slate-400">Pessoa Acompanhada: <strong>{currentCase.patient_name}</strong></span>
            </div>
            <h2 className="text-xl font-black mt-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Métricas & Curva de Desenvolvimento
            </h2>
            <p className="text-xs text-slate-400">
              Acompanhamento de desfechos clínicos e ganhos de desenvolvimento obtidos nas intervenções musico-terapêuticas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Ganho Médio Global: +83%
            </span>
          </div>
        </div>

        {/* Resumo dos 4 Principais Indicadores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-semibold block">Engajamento Sonoro:</span>
            <span className="text-lg font-black text-teal-400">Nível 5 <span className="text-[10px] text-slate-500 font-normal">/ 5</span></span>
            <span className="text-[10px] text-emerald-400 block font-bold">▲ +150% desde o início</span>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-semibold block">Tolerância Acústica:</span>
            <span className="text-lg font-black text-amber-400">65 dB <span className="text-[10px] text-slate-500 font-normal">(sem desconforto)</span></span>
            <span className="text-[10px] text-emerald-400 block font-bold">▲ Estabilidade atingida</span>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-semibold block">Turnos em Dueto:</span>
            <span className="text-lg font-black text-indigo-400">6 Turnos <span className="text-[10px] text-slate-500 font-normal">consecutivos</span></span>
            <span className="text-[10px] text-emerald-400 block font-bold">▲ Meta do PTS atingida</span>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 font-semibold block">Autorregulação:</span>
            <span className="text-lg font-black text-emerald-400">Regulado <span className="text-[10px] text-slate-500 font-normal">em 90% da sessão</span></span>
            <span className="text-[10px] text-emerald-400 block font-bold">▲ Acalento com ruído marrom</span>
          </div>
        </div>
      </div>

      {/* Gráficos Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Linhas: Evolução ao Longo das Sessões */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" /> Curva Temporal de Respostas Clínicas (Escala 1 a 5)
            </h3>
            <span className="text-[11px] text-slate-400">6 Sessões Registradas</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="sessao" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={11} />
                <YAxis domain={[0, 5]} stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={11} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    borderColor: isDark ? "#334155" : "#cbd5e1",
                    borderRadius: "0.75rem",
                    fontSize: "11px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="engajamento" name="Engajamento" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="tolerancia" name="Tolerância" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="interacao" name="Interação" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="autorregulacao" name="Autorregulação" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Radar: Linha de Base vs Atual */}
        <div className={`p-5 rounded-2xl border shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" /> Comparativo Multidimensional
            </h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />
                <PolarAngleAxis dataKey="domain" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={9} />
                <Radar name="Linha de Base (Inicial)" dataKey="inicial" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
                <Radar name="Avaliação Atual" dataKey="atual" stroke="#0d9488" fill="#0d9488" fillOpacity={0.5} />
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
    </div>
  );
};
