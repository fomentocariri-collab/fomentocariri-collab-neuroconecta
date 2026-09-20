import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, CheckCircle2, Zap, Wind, Activity, Clock, Headphones } from "lucide-react";
import { SoundPreset } from "../MusicotherapyHub";

interface GuidedExperienceProps {
  mode: "preparar_tarefa" | "descompressao" | "som_movimento";
  presets: SoundPreset[];
  isPlaying: boolean;
  onStartAudio: (preset: SoundPreset) => void;
  onStopAudio: () => void;
  isDark?: boolean;
}

interface ExperienceConfig {
  title: string;
  badge: string;
  description: string;
  defaultDurationSeconds: number;
  recommendedPresetId: string;
  steps: string[];
  tips: string;
}

const EXPERIENCES_MAP: Record<string, ExperienceConfig> = {
  preparar_tarefa: {
    title: "Preparar para uma Tarefa (Transição & Foco)",
    badge: "Foco & Transição Suave",
    description: "Um protocolo de 3 minutos para transicionar a mente sem ansiedade: organizar o espaço, colocar fones e dar a primeira micro-partida.",
    defaultDurationSeconds: 180, // 3 minutes
    recommendedPresetId: "preset-alpha",
    steps: [
      "Coloque seus fones ou ajuste o volume num tom confortável.",
      "Feche todas as abas que não têm relação com a tarefa de agora.",
      "Defina apenas a primeira ação ridícula de tão simples (ex: abrir o documento).",
      "Respire fundo uma vez e permita que o som rítmico embale seu início."
    ],
    tips: "Não se preocupe com o final da tarefa. Foque apenas em começar os primeiros 5 minutos."
  },
  descompressao: {
    title: "Descompressão Pós-Atividade (Descarga Sensorial)",
    badge: "Alívio & Recomposição",
    description: "Um momento de 4 minutos após uma reunião exaustiva, prova, aula ou estímulo intenso para liberar a sobrecarga somática.",
    defaultDurationSeconds: 240, // 4 minutes
    recommendedPresetId: "preset-brown",
    steps: [
      "Afaste-se das telas ou feche os olhos.",
      "Deixe os ombros caírem e destrave os dentes da mandíbula.",
      "Sinta o som contínuo acolher seu campo auditivo, sem cobrança.",
      "Faça respirações soltando o ar pela boca devagar."
    ],
    tips: "Descompressão não é preguiça: é necessidade fisiológica do sistema nervoso neurodivergente."
  },
  som_movimento: {
    title: "Som & Movimento Proprioceptivo (Regulação Ativa)",
    badge: "Stimming & Propriocepção",
    description: "Autorregulação ativa de 3 minutos: estimule o corpo com balanço suave, alongamento das mãos ou caminhada no ritmo do som.",
    defaultDurationSeconds: 180, // 3 minutes
    recommendedPresetId: "preset-432",
    steps: [
      "Fique de pé ou sente-se com a coluna livre.",
      "Balanço suave de tronco, balance os pés ou aperte e solte uma bolinha antiestresse.",
      "Gire os pulsos e estique os braços para cima no seu próprio tempo.",
      "Permita que seu corpo expresse o movimento que ele estiver pedindo (stimming livre)."
    ],
    tips: "O movimento proprioceptivo acalma os circuitos de sobrecarga motora e reequilibra a atenção."
  }
};

export const GuidedSoundExperiences: React.FC<GuidedExperienceProps> = ({
  mode,
  presets,
  isPlaying,
  onStartAudio,
  onStopAudio,
  isDark = true,
}) => {
  const config = EXPERIENCES_MAP[mode] || EXPERIENCES_MAP.preparar_tarefa;
  const targetPreset = presets.find(p => p.id === config.recommendedPresetId) || presets[0];

  const [secondsLeft, setSecondsLeft] = useState<number>(config.defaultDurationSeconds);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Reset when mode changes
  useEffect(() => {
    setIsActive(false);
    setCompleted(false);
    setSecondsLeft(config.defaultDurationSeconds);
    setCurrentStepIndex(0);
    onStopAudio();
  }, [mode]);

  // Timer countdown
  useEffect(() => {
    if (!isActive) return;

    if (secondsLeft <= 0) {
      setIsActive(false);
      setCompleted(true);
      onStopAudio();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  // Advance guided steps automatically across the session
  useEffect(() => {
    if (!isActive) return;
    const totalSteps = config.steps.length;
    const timePerStep = config.defaultDurationSeconds / totalSteps;
    const elapsed = config.defaultDurationSeconds - secondsLeft;
    const stepIdx = Math.min(totalSteps - 1, Math.floor(elapsed / timePerStep));
    setCurrentStepIndex(stepIdx);
  }, [isActive, secondsLeft]);

  const handleStart = () => {
    setCompleted(false);
    setIsActive(true);
    onStartAudio(targetPreset);
  };

  const handlePause = () => {
    setIsActive(false);
    onStopAudio();
  };

  const handleReset = () => {
    setIsActive(false);
    setCompleted(false);
    setSecondsLeft(config.defaultDurationSeconds);
    setCurrentStepIndex(0);
    onStopAudio();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Banner */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-sm"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Headphones className="w-3.5 h-3.5" />
              {config.badge}
            </div>
            <h2 className="text-xl font-bold">{config.title}</h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              {config.description}
            </p>
          </div>

          <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-xl text-slate-300 border border-slate-700">
            Frequência Otimizada: <span className="font-bold text-teal-400">{targetPreset.title}</span>
          </div>
        </div>
      </div>

      {/* Main Experience Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Timer and Controls */}
        <div className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col items-center justify-center text-center space-y-6 shadow-xl ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="relative w-48 h-48 rounded-full border border-slate-800 bg-slate-950 flex flex-col items-center justify-center p-4 shadow-inner">
            <div className="text-3xl font-mono font-bold text-slate-100">
              {formatTime(secondsLeft)}
            </div>
            <div className="text-xs font-semibold text-teal-400 mt-1">
              {isActive ? "Sessão Ativa..." : completed ? "Concluído!" : "Pronto para iniciar"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isActive ? (
              <button
                type="button"
                onClick={handleStart}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-sm shadow-md transition flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{secondsLeft === config.defaultDurationSeconds ? "Iniciar Experiência" : "Continuar"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-sm shadow-md transition flex items-center gap-2"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>Pausar</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition"
              title="Reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {completed && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Experiência concluída com sucesso!</span>
            </div>
          )}
        </div>

        {/* Right: Step-by-Step Guided Steps */}
        <div className={`lg:col-span-7 p-6 rounded-3xl border space-y-5 ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Passo a Passo Guiado em Tempo Real</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Acompanhe as orientações conforme o cronômetro avança:</p>
          </div>

          <div className="space-y-3">
            {config.steps.map((step, idx) => {
              const isCurrent = isActive && currentStepIndex === idx;
              const isPast = (isActive && currentStepIndex > idx) || completed;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                    isCurrent
                      ? "bg-teal-950/50 border-teal-500 ring-2 ring-teal-500/20 text-slate-100 font-semibold"
                      : isPast
                      ? "bg-slate-800/30 border-slate-800/80 text-slate-400"
                      : "bg-slate-800/50 border-slate-700/60 text-slate-300"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    isCurrent
                      ? "bg-teal-500 text-slate-950"
                      : isPast
                      ? "bg-emerald-900 text-emerald-300"
                      : "bg-slate-700 text-slate-300"
                  }`}>
                    {isPast ? "✓" : idx + 1}
                  </div>
                  <div className="flex-1 pt-0.5 leading-relaxed">
                    {step}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 text-xs text-slate-300 flex items-start gap-2">
            <span className="text-teal-400 font-bold">💡 Dica:</span>
            <span>{config.tips}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
