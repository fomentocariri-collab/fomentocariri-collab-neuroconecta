import React, { useState } from "react";
import { 
  MusicTherapySession, 
  MusicTherapyGoalKey, 
  MusicTherapyInterventionKey, 
  MusicTherapyResponseKey,
  MusicTherapySessionGoal,
  MusicTherapySessionIntervention,
  MusicTherapySessionResponse
} from "../../types";
import { 
  MUSIC_THERAPY_GOAL_DEFINITIONS, 
  MUSIC_THERAPY_INTERVENTIONS, 
  MUSIC_THERAPY_RESPONSE_DOMAINS,
  createBlankSession,
  generateAuditHash
} from "../../data/musicTherapyData";
import { SessionToolsBar } from "./SessionToolsBar";
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  Clock, 
  Calendar, 
  User, 
  FileText, 
  Award, 
  Headphones, 
  Mic, 
  Radio, 
  HeartHandshake, 
  Ear, 
  Footprints,
  Activity,
  AlertTriangle,
  ChevronRight,
  Info
} from "lucide-react";
import { auditService } from "../../services/auditService";

interface MusicTherapySessionFlowProps {
  currentSessionNumber: number;
  defaultPatientName?: string;
  onSaveSession: (session: MusicTherapySession) => void;
  onCancel?: () => void;
  isDark?: boolean;
}

export const MusicTherapySessionFlow: React.FC<MusicTherapySessionFlowProps> = ({
  currentSessionNumber,
  defaultPatientName = "Paciente em Acompanhamento",
  onSaveSession,
  onCancel,
  isDark = true,
}) => {
  const [session, setSession] = useState<MusicTherapySession>(() => 
    createBlankSession(currentSessionNumber, defaultPatientName)
  );

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Helper icons for interventions
  const interventionIcons: Record<MusicTherapyInterventionKey, React.ElementType> = {
    canto: Mic,
    instrumento: Radio,
    ritmo: Activity,
    improvisacao: HeartHandshake,
    escuta: Ear,
    movimento: Footprints,
  };

  // Toggle Goal selection
  const handleToggleGoal = (key: MusicTherapyGoalKey) => {
    setSession(prev => {
      const current = prev.goals[key];
      const updated = {
        ...prev,
        goals: {
          ...prev.goals,
          [key]: {
            ...current,
            selected: !current.selected
          }
        }
      };
      updated.audit.auditHash = generateAuditHash(updated);
      return updated;
    });
  };

  const handleGoalNoteChange = (key: MusicTherapyGoalKey, notes: string) => {
    setSession(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        [key]: {
          ...prev.goals[key],
          notes
        }
      }
    }));
  };

  // Toggle Intervention
  const handleToggleIntervention = (key: MusicTherapyInterventionKey) => {
    setSession(prev => {
      const current = prev.interventions[key];
      const updated = {
        ...prev,
        interventions: {
          ...prev.interventions,
          [key]: {
            ...current,
            applied: !current.applied
          }
        }
      };
      updated.audit.auditHash = generateAuditHash(updated);
      return updated;
    });
  };

  const handleInterventionChange = (
    key: MusicTherapyInterventionKey, 
    field: "details" | "bpm" | "durationMinutes", 
    value: any
  ) => {
    setSession(prev => ({
      ...prev,
      interventions: {
        ...prev.interventions,
        [key]: {
          ...prev.interventions[key],
          [field]: value
        }
      }
    }));
  };

  const handleToggleTechnique = (key: MusicTherapyInterventionKey, tech: string) => {
    setSession(prev => {
      const current = prev.interventions[key];
      const exists = current.techniquesUsed.includes(tech);
      const nextTechs = exists 
        ? current.techniquesUsed.filter(t => t !== tech)
        : [...current.techniquesUsed, tech];
      return {
        ...prev,
        interventions: {
          ...prev.interventions,
          [key]: {
            ...current,
            techniquesUsed: nextTechs
          }
        }
      };
    });
  };

  // Update Observed Response score
  const handleResponseScoreChange = (key: MusicTherapyResponseKey, score: number) => {
    const domainDef = MUSIC_THERAPY_RESPONSE_DOMAINS.find(d => d.key === key);
    const descriptor = domainDef?.descriptors[score] || "";

    setSession(prev => {
      const updated = {
        ...prev,
        observedResponses: {
          ...prev.observedResponses,
          [key]: {
            ...prev.observedResponses[key],
            score,
            descriptor
          }
        }
      };
      updated.audit.auditHash = generateAuditHash(updated);
      return updated;
    });
  };

  const handleResponseNoteChange = (key: MusicTherapyResponseKey, notes: string) => {
    setSession(prev => ({
      ...prev,
      observedResponses: {
        ...prev.observedResponses,
        [key]: {
          ...prev.observedResponses[key],
          notes
        }
      }
    }));
  };

  // Calculate session average observed score
  const responseScores = (Object.values(session.observedResponses) as MusicTherapySessionResponse[]).map(r => r.score);
  const averageScore = responseScores.length 
    ? (responseScores.reduce((a, b) => a + b, 0) / responseScores.length).toFixed(1)
    : "3.0";

  // Handle finalize and save
  const handleSave = async () => {
    const finalSession: MusicTherapySession = {
      ...session,
      audit: {
        ...session.audit,
        createdAt: new Date().toISOString(),
        auditHash: generateAuditHash(session),
        verifiedAuditable: true,
      }
    };

    // Log to system audit trail
    try {
      await auditService.log({
        action: "RECORD_CREATED",
        entityType: "musicotherapy_session",
        entityId: finalSession.id,
        afterData: {
          sessionNumber: finalSession.sessionNumber,
          patientName: finalSession.patientName,
          date: finalSession.date,
          averageScore,
          auditHash: finalSession.audit.auditHash
        },
        source: "MusicTherapySessionFlow"
      });
    } catch (e) {
      console.warn("Auditoria MT:", e);
    }

    onSaveSession(finalSession);
    setSaveSuccess(true);
  };

  const steps = [
    { num: 1, label: "1. Objetivos Terapêuticos", desc: "Comunicação, Interação, Sensorial..." },
    { num: 2, label: "2. Intervenção Musical", desc: "Canto, Ritmo, Instrumentos, Improvisação..." },
    { num: 3, label: "3. Resposta Observada", desc: "Escala clínica de 1 a 5 por domínio" },
    { num: 4, label: "4. Evolução & Auditoria", desc: "Parecer, Alinhamento PEI e Hash Seguro" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Session Metadata Header */}
      <div className={`p-5 rounded-3xl border shadow-sm ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-teal-500/20">
              #{session.sessionNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-500">Prontuário Clínico de Musicoterapia</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Auditável
                </span>
              </div>
              <h2 className="text-xl font-black">Registro de Sessão Estruturada</h2>
            </div>
          </div>

          {/* Quick Details Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className={`p-2 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <label className="text-[10px] text-slate-400 block font-semibold">Paciente</label>
              <input
                type="text"
                value={session.patientName}
                onChange={(e) => setSession({ ...session, patientName: e.target.value })}
                className="w-full bg-transparent font-bold focus:outline-none truncate"
              />
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <label className="text-[10px] text-slate-400 block font-semibold">Data da Sessão</label>
              <input
                type="date"
                value={session.date}
                onChange={(e) => setSession({ ...session, date: e.target.value })}
                className="w-full bg-transparent font-bold focus:outline-none"
              />
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <label className="text-[10px] text-slate-400 block font-semibold">Duração</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={15}
                  max={120}
                  value={session.durationMinutes}
                  onChange={(e) => setSession({ ...session, durationMinutes: Number(e.target.value) })}
                  className="w-12 bg-transparent font-bold focus:outline-none"
                />
                <span className="text-slate-400">min</span>
              </div>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <label className="text-[10px] text-slate-400 block font-semibold">Contexto</label>
              <select
                value={session.contextSetting}
                onChange={(e) => setSession({ ...session, contextSetting: e.target.value as any })}
                className="w-full bg-transparent font-bold focus:outline-none text-[11px]"
              >
                <option value="clinica" className="bg-slate-900 text-white">Clínica</option>
                <option value="escola_aee" className="bg-slate-900 text-white">Escola (AEE)</option>
                <option value="caps" className="bg-slate-900 text-white">CAPS / Saúde</option>
                <option value="domicilio" className="bg-slate-900 text-white">Domicílio</option>
                <option value="neuroconecta_sala" className="bg-slate-900 text-white">Sala NeuroConecta</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5 pt-4 border-t border-slate-800/60">
          {steps.map((step) => {
            const isCurrent = activeStep === step.num;
            const isCompleted = activeStep > step.num;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveStep(step.num as any)}
                className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                  isCurrent
                    ? "bg-teal-600/20 border-teal-500 text-teal-300 shadow-sm"
                    : isCompleted
                    ? "bg-emerald-950/30 border-emerald-800 text-emerald-300"
                    : isDark ? "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700" : "bg-slate-50 border-slate-200 text-slate-500"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  isCurrent
                    ? "bg-teal-500 text-white"
                    : isCompleted
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold truncate">{step.label}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{step.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Embedded Live Musical Accompaniment Bar */}
      <SessionToolsBar isDark={isDark} />

      {/* ============================================================== */}
      {/* ETAPA 1: OBJETIVOS TERAPÊUTICOS                                 */}
      {/* ============================================================== */}
      {activeStep === 1 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black flex items-center gap-2">
                <span>Objetivos Terapêuticos da Sessão</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-bold">
                  {(Object.values(session.goals) as MusicTherapySessionGoal[]).filter(g => g.selected).length} selecionados
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Selecione as metas clínicas que orientam o plano sonoro e justifique as abordagens prioritárias.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <span>Avançar para Intervenção</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MUSIC_THERAPY_GOAL_DEFINITIONS.map((def) => {
              const goal = session.goals[def.key];
              const isSelected = goal?.selected;

              return (
                <div
                  key={def.key}
                  className={`p-4 rounded-3xl border transition space-y-3 ${
                    isSelected
                      ? isDark 
                        ? "bg-teal-950/30 border-teal-600/70 text-slate-100 shadow-sm" 
                        : "bg-teal-50/70 border-teal-300 text-slate-900 shadow-sm"
                      : isDark ? "bg-slate-900/60 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleGoal(def.key)}
                      className="flex items-start gap-2.5 text-left flex-1"
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center mt-0.5 transition ${
                        isSelected ? "bg-teal-500 text-white" : "border border-slate-700 bg-slate-800"
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold ${isSelected ? "text-teal-400" : ""}`}>
                            {def.label}
                          </h4>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400">
                            {def.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {def.defaultFocus}
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Clinical Rationale Box */}
                  <div className={`p-2.5 rounded-2xl text-[11px] leading-relaxed flex items-start gap-2 ${
                    isDark ? "bg-slate-950/80 text-slate-400 border border-slate-800/60" : "bg-white text-slate-600 border border-slate-200"
                  }`}>
                    <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span><strong>Fundamento Neurobiológico:</strong> {def.clinicalRationale}</span>
                  </div>

                  {/* Notes if selected */}
                  {isSelected && (
                    <div className="pt-1">
                      <input
                        type="text"
                        placeholder="Observações clínicas ou sub-meta específica desta sessão..."
                        value={goal?.notes || ""}
                        onChange={(e) => handleGoalNoteChange(def.key, e.target.value)}
                        className={`w-full px-3 py-1.5 text-xs rounded-xl border ${
                          isDark 
                            ? "bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600" 
                            : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ETAPA 2: INTERVENÇÃO MUSICAL                                    */}
      {/* ============================================================== */}
      {activeStep === 2 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black flex items-center gap-2">
                <span>Intervenção Musical Aplicada</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  {(Object.values(session.interventions) as MusicTherapySessionIntervention[]).filter(i => i.applied).length} ativas
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Selecione as técnicas e instrumentos utilizados em cada eixo sonoro da intervenção.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-3 py-2 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
              >
                <span>Avançar para Resposta</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MUSIC_THERAPY_INTERVENTIONS.map((def) => {
              const intervention = session.interventions[def.key];
              const isApplied = intervention?.applied;
              const Icon = interventionIcons[def.key] || Radio;

              return (
                <div
                  key={def.key}
                  className={`p-5 rounded-3xl border transition space-y-3 ${
                    isApplied
                      ? isDark 
                        ? "bg-emerald-950/20 border-emerald-600/60 text-slate-100 shadow-sm" 
                        : "bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-sm"
                      : isDark ? "bg-slate-900/60 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleIntervention(def.key)}
                      className="flex items-center gap-2.5 text-left flex-1"
                    >
                      <div className={`p-2 rounded-xl ${
                        isApplied ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <span>{def.label}</span>
                          {isApplied && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                              Aplicado
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-400">{def.description}</p>
                      </div>
                    </button>
                  </div>

                  {isApplied && (
                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                      {/* Techniques Selection Chips */}
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                          Técnicas Clínicas Utilizadas
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {def.suggestedTechniques.map((tech) => {
                            const isChosen = intervention.techniquesUsed.includes(tech);
                            return (
                              <button
                                key={tech}
                                type="button"
                                onClick={() => handleToggleTechnique(def.key, tech)}
                                className={`text-[11px] px-2.5 py-1 rounded-xl font-semibold border transition ${
                                  isChosen
                                    ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                                }`}
                              >
                                {tech}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Instruments / Parameters */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 block font-semibold">Tempo Dedicado</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={1}
                              max={60}
                              value={intervention.durationMinutes}
                              onChange={(e) => handleInterventionChange(def.key, "durationMinutes", Number(e.target.value))}
                              className="w-14 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-center font-bold"
                            />
                            <span className="text-slate-400 text-[11px]">minutos</span>
                          </div>
                        </div>

                        {def.key === "ritmo" && (
                          <div>
                            <label className="text-[10px] text-slate-400 block font-semibold">Andamento (BPM)</label>
                            <input
                              type="number"
                              min={40}
                              max={180}
                              value={intervention.bpm || 72}
                              onChange={(e) => handleInterventionChange(def.key, "bpm", Number(e.target.value))}
                              className="w-16 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-center font-bold text-teal-400"
                            />
                          </div>
                        )}
                      </div>

                      {/* Additional Details */}
                      <div>
                        <input
                          type="text"
                          placeholder="Instrumentos específicos (ex.: Ocean drum, Xilofone C maior, baquetas de lã)..."
                          value={intervention.details}
                          onChange={(e) => handleInterventionChange(def.key, "details", e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs rounded-xl border ${
                            isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-300 text-slate-900"
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ETAPA 3: RESPOSTA OBSERVADA                                     */}
      {/* ============================================================== */}
      {activeStep === 3 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black">Resposta Observada do Paciente</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-black border border-teal-500/30">
                  Média: {averageScore} / 5.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pontuação clínica ancorada (1 a 5) nos 6 domínios de engajamento, tolerância e interação.
              </p>
            </div>
            <div className="flex gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-3 py-2 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
              >
                <span>Avançar para Evolução</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MUSIC_THERAPY_RESPONSE_DOMAINS.map((domain) => {
              const resp = session.observedResponses[domain.key];
              const score = resp?.score || 3;

              return (
                <div
                  key={domain.key}
                  className={`p-5 rounded-3xl border space-y-3 transition ${
                    isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-teal-400">{domain.label}</h4>
                      <p className="text-[11px] text-slate-400">{domain.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-teal-300">{score}</span>
                      <span className="text-xs text-slate-500"> / 5</span>
                    </div>
                  </div>

                  {/* 1-5 Radio Scale */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleResponseScoreChange(domain.key, val)}
                        className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 border ${
                          score === val
                            ? val >= 4 
                              ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-700/30"
                              : val === 3
                              ? "bg-teal-600 text-white border-teal-500"
                              : "bg-amber-600 text-white border-amber-500"
                            : isDark ? "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span>{val}</span>
                        <span className="text-[9px] font-normal opacity-80">
                          {val === 1 ? "Mínimo" : val === 3 ? "Médio" : val === 5 ? "Pleno" : ""}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Descriptive text for active score */}
                  <div className={`p-2.5 rounded-2xl text-[11px] leading-relaxed border ${
                    isDark ? "bg-slate-950/80 border-slate-800 text-teal-300/90" : "bg-teal-50/70 border-teal-200 text-teal-900"
                  }`}>
                    {domain.descriptors[score]}
                  </div>

                  {/* Domain Notes */}
                  <input
                    type="text"
                    placeholder={`Comportamento observado em ${domain.label.toLowerCase()}...`}
                    value={resp?.notes || ""}
                    onChange={(e) => handleResponseNoteChange(domain.key, e.target.value)}
                    className={`w-full px-3 py-1.5 text-xs rounded-xl border ${
                      isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ETAPA 4: EVOLUÇÃO CLÍNICA & AUDITORIA LONGITUDINAL               */}
      {/* ============================================================== */}
      {activeStep === 4 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black flex items-center gap-2">
                <span>Evolução Clínica & Histórico Auditável</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-bold border border-teal-500/30">
                  Idempotente & Rastreável
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Gere a síntese clínica estruturada, recomendações para o PEI/PTS e registre o hash de integridade.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="px-3 py-2 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
            >
              Voltar
            </button>
          </div>

          <div className={`p-6 rounded-3xl border space-y-5 ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}>
            {/* Evolution Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Síntese de Evolução da Sessão (Parecer Clínico da Musicoterapia)</span>
              </label>
              <textarea
                rows={4}
                value={session.evolutionSummary}
                onChange={(e) => setSession({ ...session, evolutionSummary: e.target.value })}
                placeholder="Exemplo: Paciente apresentou acolhimento progressivo à canção de abertura. Sustentou 4 turnos rítmicos com o xilofone sem sinais de sobrecarga auditiva. Houve emissão de vocalizações melódicas espontâneas no fechamento..."
                className={`w-full p-3 text-xs rounded-2xl border leading-relaxed ${
                  isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interdisciplinary Alignment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Alinhamento Multidisciplinar (Fono, T.O., PEI)</span>
                </label>
                <textarea
                  rows={3}
                  value={session.interdisciplinaryAlignment || ""}
                  onChange={(e) => setSession({ ...session, interdisciplinaryAlignment: e.target.value })}
                  placeholder="Orientações e cruzamento de metas com Fonoaudiologia e Terapia Ocupacional..."
                  className={`w-full p-3 text-xs rounded-2xl border leading-relaxed ${
                    isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              {/* Family / Caregiver Recommendations */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-cyan-400" />
                  <span>Orientações para a Família & Casa</span>
                </label>
                <textarea
                  rows={3}
                  value={session.recommendationsForFamily || ""}
                  onChange={(e) => setSession({ ...session, recommendationsForFamily: e.target.value })}
                  placeholder="Sugestões práticas de escuta musical e transição sonora em casa..."
                  className={`w-full p-3 text-xs rounded-2xl border leading-relaxed ${
                    isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
            </div>

            {/* Sensory Alerts */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Alertas Sensoriais & Recomendações para a Próxima Sessão</span>
              </label>
              <input
                type="text"
                value={session.sensoryAlerts || ""}
                onChange={(e) => setSession({ ...session, sensoryAlerts: e.target.value })}
                placeholder="Exemplo: Evitar percussão metálica estridente no início; manter pulso estável a 70 BPM..."
                className={`w-full px-3 py-2 text-xs rounded-xl border ${
                  isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>

            {/* Professional Signature & Audit Trail Metadata */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <div>
                    <span className="font-bold text-slate-200">Trilha de Auditoria Clínica Ativa</span>
                    <p className="text-[10px] text-slate-400">Garante idoneidade, não-repúdio e rastreabilidade temporal</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Hash Criptográfico de Auditoria</span>
                  <span className="font-mono text-xs font-bold text-teal-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {session.audit.auditHash || generateAuditHash(session)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block font-semibold">Profissional Responsável</label>
                  <input
                    type="text"
                    value={session.therapistName}
                    onChange={(e) => setSession({ ...session, therapistName: e.target.value })}
                    className="w-full bg-transparent font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block font-semibold">Função / Especialidade</label>
                  <input
                    type="text"
                    value={session.therapistRole}
                    onChange={(e) => setSession({ ...session, therapistRole: e.target.value })}
                    className="w-full bg-transparent font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block font-semibold">Registro Profissional (UBAM/Conselho)</label>
                  <input
                    type="text"
                    value={session.therapistRegister || ""}
                    onChange={(e) => setSession({ ...session, therapistRegister: e.target.value })}
                    placeholder="UBAM 0000 / CRM / CRP"
                    className="w-full bg-transparent font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Save & Cancel Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full sm:w-auto px-5 py-2.5 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-2xl transition"
                >
                  Cancelar
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-teal-700/30 flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5 active:translate-y-0 ml-auto"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Sessão no Histórico Longitudinal Auditável</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
