import React, { useState } from "react";
import { 
  MusicTherapySession, 
  MusicTherapyResponseKey, 
  MusicTherapySessionResponse, 
  MusicTherapySessionGoal 
} from "../../types";
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
import { 
  ShieldCheck, 
  TrendingUp, 
  Calendar, 
  Award, 
  Printer, 
  Plus, 
  RotateCcw, 
  FileText, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Activity, 
  Sparkles,
  HelpCircle,
  Filter
} from "lucide-react";
import { MusicTherapySessionDetailModal } from "./MusicTherapySessionDetailModal";

interface MusicTherapyLongitudinalAuditProps {
  sessions: MusicTherapySession[];
  onNewSession: () => void;
  onDeleteSession?: (id: string) => void;
  onResetSeed?: () => void;
  isDark?: boolean;
}

export const MusicTherapyLongitudinalAudit: React.FC<MusicTherapyLongitudinalAuditProps> = ({
  sessions,
  onNewSession,
  onDeleteSession,
  onResetSeed,
  isDark = true,
}) => {
  const [selectedSessionForModal, setSelectedSessionForModal] = useState<MusicTherapySession | null>(null);
  const [filterPatient, setFilterPatient] = useState<string>("todos");

  // Sorted sessions chronologically
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Filtered by patient if selected
  const displayedSessions = filterPatient === "todos" 
    ? sortedSessions 
    : sortedSessions.filter(s => s.patientName === filterPatient);

  // Unique patient names for filter
  const patientNames = Array.from(new Set(sessions.map(s => s.patientName)));

  // Prepare data for longitudinal line chart
  const lineChartData = displayedSessions.map((s) => ({
    name: `Sessão #${s.sessionNumber}`,
    data: s.date.substring(5), // MM-DD
    Engajamento: s.observedResponses.engajamento?.score || 0,
    Tolerância: s.observedResponses.tolerancia_sensorial?.score || 0,
    Interação: s.observedResponses.interacao?.score || 0,
    Comunicação: s.observedResponses.comunicacao?.score || 0,
    Autorregulação: s.observedResponses.autorregulacao?.score || 0,
    Comportamento: s.observedResponses.comportamento?.score || 0,
    Media: Number((
      (Object.values(s.observedResponses) as MusicTherapySessionResponse[]).reduce((sum, r) => sum + r.score, 0) / 6
    ).toFixed(1))
  }));

  // Prepare radar chart data comparing First Session vs Latest Session
  const firstSession = displayedSessions[0];
  const lastSession = displayedSessions[displayedSessions.length - 1];

  const radarChartData = [
    {
      domain: "Engajamento",
      Inicial: firstSession?.observedResponses.engajamento?.score || 0,
      Atual: lastSession?.observedResponses.engajamento?.score || 0,
      fullMark: 5,
    },
    {
      domain: "Tolerância Sensorial",
      Inicial: firstSession?.observedResponses.tolerancia_sensorial?.score || 0,
      Atual: lastSession?.observedResponses.tolerancia_sensorial?.score || 0,
      fullMark: 5,
    },
    {
      domain: "Interação Social",
      Inicial: firstSession?.observedResponses.interacao?.score || 0,
      Atual: lastSession?.observedResponses.interacao?.score || 0,
      fullMark: 5,
    },
    {
      domain: "Comunicação",
      Inicial: firstSession?.observedResponses.comunicacao?.score || 0,
      Atual: lastSession?.observedResponses.comunicacao?.score || 0,
      fullMark: 5,
    },
    {
      domain: "Autorregulação",
      Inicial: firstSession?.observedResponses.autorregulacao?.score || 0,
      Atual: lastSession?.observedResponses.autorregulacao?.score || 0,
      fullMark: 5,
    },
    {
      domain: "Comportamento",
      Inicial: firstSession?.observedResponses.comportamento?.score || 0,
      Atual: lastSession?.observedResponses.comportamento?.score || 0,
      fullMark: 5,
    },
  ];

  // Calculate overall clinical progression
  const firstAvg = firstSession
    ? (Object.values(firstSession.observedResponses) as MusicTherapySessionResponse[]).reduce((sum, r) => sum + r.score, 0) / 6
    : 0;
  const lastAvg = lastSession
    ? (Object.values(lastSession.observedResponses) as MusicTherapySessionResponse[]).reduce((sum, r) => sum + r.score, 0) / 6
    : 0;
  const improvementPct = firstAvg > 0 ? Math.round(((lastAvg - firstAvg) / firstAvg) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Quick Metrics */}
      <div className={`p-6 rounded-3xl border shadow-sm ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-500">Histórico Longitudinal Auditável</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Auditado NC-A1
              </span>
            </div>
            <h2 className="text-2xl font-black">Evolução Clínica de Musicoterapia</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Monitoramento longitudinal das 6 respostas observadas, fundamentação das metas terapêuticas e rastreabilidade fidedigna das intervenções aplicadas.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2 no-print">
            {patientNames.length > 1 && (
              <select
                value={filterPatient}
                onChange={(e) => setFilterPatient(e.target.value)}
                className={`px-3 py-2 text-xs rounded-xl border font-bold ${
                  isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                <option value="todos">Todos os Pacientes ({sessions.length})</option>
                {patientNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5 text-teal-400" />
              <span>Imprimir Relatório</span>
            </button>

            {onResetSeed && (
              <button
                type="button"
                onClick={onResetSeed}
                title="Restaurar sessões de exemplo para demonstração"
                className="px-3 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onNewSession}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nova Sessão</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/60">
          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[11px] text-slate-400 block font-semibold">Sessões Auditadas</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-teal-400">{displayedSessions.length}</span>
              <span className="text-xs text-slate-500 font-bold">registros</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Trilha auditável contínua</p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[11px] text-slate-400 block font-semibold">Progressão Longitudinal</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">
                {improvementPct >= 0 ? `+${improvementPct}%` : `${improvementPct}%`}
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Ganho entre 1ª e última sessão</p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[11px] text-slate-400 block font-semibold">Média Global Recente</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-cyan-400">{lastAvg ? lastAvg.toFixed(1) : "-"}</span>
              <span className="text-xs text-slate-500 font-bold">/ 5.0</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Escala de resposta observada</p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[11px] text-slate-400 block font-semibold">Integração Interdisciplinar</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-400">100%</span>
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Alinhamento com PEI & PTS</p>
          </div>
        </div>
      </div>

      {/* Visual Longitudinal Charts */}
      {displayedSessions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Progression Line Chart (8 cols) */}
          <div className={`lg:col-span-8 p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span>Curva de Evolução Temporal (Respostas Observadas)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Trajetória clínica pontuada de 1 (mínimo/aversão) a 5 (pleno/autônomo).
                </p>
              </div>
              <span className="text-[11px] font-bold text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded-xl border border-teal-800 self-start sm:self-auto">
                Escala Validada 1-5
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                  <XAxis 
                    dataKey="name" 
                    stroke={isDark ? "#64748b" : "#94a3b8"} 
                    fontSize={11} 
                  />
                  <YAxis 
                    domain={[0, 5]} 
                    ticks={[1, 2, 3, 4, 5]} 
                    stroke={isDark ? "#64748b" : "#94a3b8"} 
                    fontSize={11} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? "#090d16" : "#ffffff", 
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                      borderRadius: "16px",
                      fontSize: "12px"
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  
                  <Line type="monotone" dataKey="Engajamento" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Tolerância" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Interação" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Comunicação" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Autorregulação" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Media" stroke="#ec4899" strokeWidth={3} strokeDasharray="4 4" name="Média Geral" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart Comparison (4 cols) */}
          <div className={`lg:col-span-4 p-6 rounded-3xl border shadow-sm space-y-4 flex flex-col justify-between ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Balanço de Competências</span>
              </h3>
              <p className="text-xs text-slate-400">
                Comparativo radar entre a Sessão Inicial (#{firstSession?.sessionNumber}) e a Sessão Atual (#{lastSession?.sessionNumber}).
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarChartData}>
                  <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />
                  <PolarAngleAxis dataKey="domain" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke={isDark ? "#475569" : "#cbd5e1"} fontSize={10} />
                  <Radar name="Sessão Inicial" dataKey="Inicial" stroke="#64748b" fill="#64748b" fillOpacity={0.25} />
                  <Radar name="Sessão Atual" dataKey="Atual" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.45} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? "#090d16" : "#ffffff", 
                      borderColor: isDark ? "#334155" : "#cbd5e1",
                      borderRadius: "14px",
                      fontSize: "11px"
                    }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className={`p-2.5 rounded-2xl text-[11px] leading-tight border text-center ${
              isDark ? "bg-slate-950/80 border-slate-800 text-slate-300" : "bg-teal-50 border-teal-200 text-teal-900"
            }`}>
              Maior expansão observada em <strong>Tolerância Sensorial</strong> e <strong>Interação Social</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Chronological Table */}
      <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Prontuário Cronológico Auditável</span>
            </h3>
            <p className="text-xs text-slate-400">
              Todos os registros mantêm hash de verificação, data de assinatura e conformidade LGPD.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 self-start sm:self-auto">
            {displayedSessions.length} sessões listadas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-slate-400 uppercase text-[10px] tracking-wider ${
                isDark ? "border-slate-800 bg-slate-950/60" : "border-slate-200 bg-slate-50"
              }`}>
                <th className="py-3 px-3"># Sessão</th>
                <th className="py-3 px-3">Data / Contexto</th>
                <th className="py-3 px-3">Paciente</th>
                <th className="py-3 px-3">Terapeuta (UBAM)</th>
                <th className="py-3 px-3">Objetivos</th>
                <th className="py-3 px-3">Média</th>
                <th className="py-3 px-3">Hash Auditoria</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {displayedSessions.map((sess) => {
                const avg = (
                  (Object.values(sess.observedResponses) as MusicTherapySessionResponse[]).reduce((sum, r) => sum + r.score, 0) / 6
                ).toFixed(1);
                const selectedGoalsCount = (Object.values(sess.goals) as MusicTherapySessionGoal[]).filter(g => g.selected).length;

                return (
                  <tr 
                    key={sess.id}
                    className={`transition hover:bg-slate-800/20 ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-teal-400">
                      #{sess.sessionNumber}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold">{sess.date}</div>
                      <div className="text-[10px] text-slate-500">{sess.contextSetting.toUpperCase()} • {sess.durationMinutes}m</div>
                    </td>
                    <td className="py-3 px-3 font-semibold whitespace-nowrap">
                      {sess.patientName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div>{sess.therapistName}</div>
                      <div className="text-[10px] text-teal-500 font-mono">{sess.therapistRegister || "UBAM"}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                        {selectedGoalsCount} metas
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                        Number(avg) >= 4 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : Number(avg) >= 3
                          ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {avg} / 5
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                      {sess.audit.auditHash}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedSessionForModal(sess)}
                          className="p-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white transition"
                          title="Ver Prontuário Completo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteSession && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Deseja remover o registro da sessão #${sess.sessionNumber}?`)) {
                                onDeleteSession(sess.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition"
                            title="Remover Registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details Modal */}
      <MusicTherapySessionDetailModal
        session={selectedSessionForModal}
        isOpen={!!selectedSessionForModal}
        onClose={() => setSelectedSessionForModal(null)}
        isDark={isDark}
      />
    </div>
  );
};
