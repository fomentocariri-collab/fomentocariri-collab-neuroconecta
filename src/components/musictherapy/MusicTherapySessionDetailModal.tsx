import React from "react";
import { 
  MusicTherapySession, 
  MusicTherapySessionGoal, 
  MusicTherapySessionIntervention, 
  MusicTherapySessionResponse 
} from "../../types";
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  User, 
  Award, 
  FileText, 
  CheckCircle2, 
  Radio, 
  HeartHandshake, 
  AlertTriangle 
} from "lucide-react";

interface MusicTherapySessionDetailModalProps {
  session: MusicTherapySession | null;
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const MusicTherapySessionDetailModal: React.FC<MusicTherapySessionDetailModalProps> = ({
  session,
  isOpen,
  onClose,
  isDark = true,
}) => {
  if (!isOpen || !session) return null;

  const handlePrint = () => {
    window.print();
  };

  const selectedGoals = (Object.values(session.goals) as MusicTherapySessionGoal[]).filter(g => g.selected);
  const appliedInterventions = (Object.values(session.interventions) as MusicTherapySessionIntervention[]).filter(i => i.applied);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 space-y-6 shadow-2xl relative ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Top Actions Bar */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-800/60 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-500">Prontuário de Musicoterapia</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Auditado
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
              title="Imprimir Prontuário"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">Imprimir / Salvar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Header */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-2">
                <span>Sessão Clínica #{session.sessionNumber}</span>
                <span className="text-sm font-normal text-slate-400">({session.contextSetting.toUpperCase()})</span>
              </h2>
              <p className="text-sm font-semibold text-teal-500">{session.patientName}</p>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-400">
              <p><strong>Data:</strong> {session.date} {session.time ? `às ${session.time}` : ""}</p>
              <p><strong>Duração:</strong> {session.durationMinutes} minutos</p>
            </div>
          </div>

          <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs ${
            isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <div>
              <p className="text-[11px] text-slate-400">Musicoterapeuta Responsável</p>
              <p className="font-bold text-slate-200">{session.therapistName} ({session.therapistRole})</p>
            </div>
            {session.therapistRegister && (
              <div className="text-left sm:text-right">
                <p className="text-[11px] text-slate-400">Registro Profissional</p>
                <p className="font-mono font-bold text-teal-400">{session.therapistRegister}</p>
              </div>
            )}
          </div>
        </div>

        {/* 1. Objetivos Terapêuticos Trabalhados */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> 1. Objetivos Terapêuticos Trabalhados
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedGoals.map((g) => (
              <div 
                key={g.key}
                className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                  isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <span className="font-bold text-teal-300">{g.label}</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">{g.targetFocus}</p>
                {g.notes && (
                  <p className="text-slate-300 text-[11px] italic pt-1 border-t border-slate-800">
                    Obs: {g.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. Intervenções Musicais Aplicadas */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" /> 2. Intervenções Musicais Aplicadas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {appliedInterventions.map((i) => (
              <div 
                key={i.key}
                className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                  isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300">{i.label}</span>
                  <span className="text-[10px] text-slate-400">{i.durationMinutes} min {i.bpm ? `• ${i.bpm} BPM` : ""}</span>
                </div>
                {i.techniquesUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {i.techniquesUsed.map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {i.details && (
                  <p className="text-slate-400 text-[11px]">{i.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Resposta Observada (Métricas Clínicas) */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> 3. Resposta Observada do Paciente
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.values(session.observedResponses) as MusicTherapySessionResponse[]).map((r) => (
              <div 
                key={r.key}
                className={`p-3 rounded-2xl border text-xs space-y-1 ${
                  isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">{r.label}</span>
                  <span className={`text-sm font-black ${
                    r.score >= 4 ? "text-emerald-400" : r.score === 3 ? "text-teal-300" : "text-amber-400"
                  }`}>
                    {r.score} / 5
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight truncate" title={r.descriptor}>
                  {r.descriptor}
                </p>
                {r.notes && (
                  <p className="text-[10px] text-slate-300 italic pt-1">
                    {r.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Parecer Clínico de Evolução */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> 4. Síntese de Evolução Clínica
          </h3>
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
            isDark ? "bg-slate-950/90 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
          }`}>
            {session.evolutionSummary || "Nenhum parecer descritivo registrado nesta sessão."}
          </div>
        </div>

        {/* Recomendações e Alertas */}
        {(session.interdisciplinaryAlignment || session.recommendationsForFamily || session.sensoryAlerts) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {session.interdisciplinaryAlignment && (
              <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <span className="font-bold text-slate-300 block mb-1">Alinhamento Multidisciplinar (PEI)</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">{session.interdisciplinaryAlignment}</p>
              </div>
            )}
            {session.recommendationsForFamily && (
              <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <span className="font-bold text-slate-300 block mb-1">Orientações para a Família</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">{session.recommendationsForFamily}</p>
              </div>
            )}
          </div>
        )}

        {/* Audit Footer */}
        <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] ${
          isDark ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
        }`}>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Trilha de Auditoria Clínica Idempotente (LGPD / Prontuário Eletrônico)</span>
          </div>
          <span className="font-mono text-[10px] text-teal-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            Hash: {session.audit.auditHash}
          </span>
        </div>
      </div>
    </div>
  );
};
