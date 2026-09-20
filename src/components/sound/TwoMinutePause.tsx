import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, CheckCircle2, Sparkles, Volume2, Clock, Headphones } from "lucide-react";
import { SoundPreset } from "../MusicotherapyHub";

interface TwoMinutePauseProps {
  presets: SoundPreset[];
  activePreset: SoundPreset;
  isPlaying: boolean;
  onSelectPreset: (preset: SoundPreset) => void;
  onStartAudio: (preset: SoundPreset) => void;
  onStopAudio: () => void;
  isDark?: boolean;
}

export const TwoMinutePause: React.FC<TwoMinutePauseProps> = ({
  presets,
  activePreset,
  isPlaying,
  onSelectPreset,
  onStartAudio,
  onStopAudio,
  isDark = true,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<"inspire" | "segure" | "expire">("inspire");

  // Timer countdown
  useEffect(() => {
    if (!isSessionActive) return;

    if (secondsRemaining <= 0) {
      setIsSessionActive(false);
      onStopAudio();
      setHasCompleted(true);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionActive, secondsRemaining]);

  // Breathing Visualizer Loop
  useEffect(() => {
    if (!isSessionActive) return;

    let timeoutId: NodeJS.Timeout;

    const runCycle = () => {
      setBreathingPhase("inspire");
      timeoutId = setTimeout(() => {
        setBreathingPhase("segure");
        timeoutId = setTimeout(() => {
          setBreathingPhase("expire");
          timeoutId = setTimeout(() => {
            runCycle();
          }, 6000);
        }, 4000);
      }, 4000);
    };

    runCycle();
    return () => clearTimeout(timeoutId);
  }, [isSessionActive]);

  const handleStart = () => {
    setHasCompleted(false);
    setIsSessionActive(true);
    if (!isPlaying) {
      onStartAudio(activePreset);
    }
  };

  const handlePause = () => {
    setIsSessionActive(false);
    onStopAudio();
  };

  const handleReset = () => {
    setIsSessionActive(false);
    setSecondsRemaining(120);
    setHasCompleted(false);
    onStopAudio();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  const progressPercent = Math.round(((120 - secondsRemaining) / 120) * 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Banner */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-sm"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Clock className="w-3.5 h-3.5" />
              Pausa Curta & Eficaz
            </div>
            <h2 className="text-xl font-bold">Pausa de 2 Minutos para Autorregulação</h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Dois minutos são suficientes para diminuir a sobrecarga sensorial, desacelerar a respiração e reiniciar sua energia de foco sem sair da rotina.
            </p>
          </div>
          <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-xl text-slate-300 border border-slate-700">
            Tempo: 120 segundos
          </div>
        </div>
      </div>

      {/* Main Interactive Card */}
      <div className={`p-8 rounded-3xl border text-center space-y-8 max-w-2xl mx-auto shadow-xl ${
        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
      }`}>
        
        {/* Sound Selection Dropdown/Pills */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 flex items-center justify-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-teal-400" />
            <span>Escolha o som da sua pausa:</span>
          </label>
          <div className="flex flex-wrap justify-center gap-2">
            {presets.map((preset) => {
              const isSelected = activePreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onSelectPreset(preset);
                    if (isSessionActive) {
                      onStartAudio(preset);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    isSelected
                      ? "bg-teal-600 text-white border-teal-500 shadow-sm"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/60"
                  }`}
                >
                  {preset.title.split(" (")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Breathing Circle and Timer Display */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
          
          {/* Animated pulsing outer halo */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-1000 ${
              isSessionActive
                ? breathingPhase === "inspire"
                  ? "scale-110 bg-teal-500/20 ring-4 ring-teal-500/30"
                  : breathingPhase === "segure"
                  ? "scale-110 bg-indigo-500/25 ring-4 ring-indigo-500/40"
                  : "scale-90 bg-teal-500/10 ring-2 ring-teal-500/10"
                : "bg-slate-800/40 border border-slate-700"
            }`}
          />

          {/* Inner timer circle */}
          <div className="relative z-10 space-y-1">
            <div className="text-4xl font-mono font-bold tracking-tight text-slate-100">
              {formatTime(secondsRemaining)}
            </div>
            
            <div className="text-xs font-bold text-teal-400 h-5">
              {isSessionActive ? (
                breathingPhase === "inspire" ? "Inspire suavemente..." :
                breathingPhase === "segure" ? "Mantenha o ar..." : "Solte devagar..."
              ) : hasCompleted ? (
                "Pausa Concluída!"
              ) : (
                "Pronto para começar"
              )}
            </div>

            <div className="text-[11px] text-slate-400">
              {progressPercent}% completado
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {hasCompleted && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs space-y-1 animate-fadeIn">
            <div className="font-bold flex items-center justify-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Parabéns pela sua pausa de 2 minutos!
            </div>
            <p className="text-slate-300 text-[11px]">
              Seu corpo e mente receberam um momento de descompressão. Beba um gole d'água antes de retomar sua tarefa.
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isSessionActive ? (
            <button
              type="button"
              onClick={handleStart}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-sm shadow-md transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{secondsRemaining === 120 ? "Iniciar Pausa (2 min)" : "Continuar Pausa"}</span>
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
            title="Reiniciar 2 minutos"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
