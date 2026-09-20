import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, Sparkles, Music, Activity, Piano } from "lucide-react";
import { PentatonicPianoAm } from "./PentatonicPianoAm";

interface SessionToolsBarProps {
  isDark?: boolean;
  onSelectBpm?: (bpm: number) => void;
}

const PENTATONIC_NOTES = [
  { name: "Dó (C4)", freq: 261.63, color: "bg-teal-600 hover:bg-teal-500", keyLabel: "1" },
  { name: "Ré (D4)", freq: 293.66, color: "bg-emerald-600 hover:bg-emerald-500", keyLabel: "2" },
  { name: "Mi (E4)", freq: 329.63, color: "bg-cyan-600 hover:bg-cyan-500", keyLabel: "3" },
  { name: "Sol (G4)", freq: 392.00, color: "bg-indigo-600 hover:bg-indigo-500", keyLabel: "4" },
  { name: "Lá (A4)", freq: 440.00, color: "bg-violet-600 hover:bg-violet-500", keyLabel: "5" },
  { name: "Dó (C5)", freq: 523.25, color: "bg-pink-600 hover:bg-pink-500", keyLabel: "6" },
];

export const SessionToolsBar: React.FC<SessionToolsBarProps> = ({ isDark = true, onSelectBpm }) => {
  // Instrument selection
  const [activeInstrument, setActiveInstrument] = useState<"piano432" | "xilofone">("piano432");

  // Metronome State
  const [bpm, setBpm] = useState<number>(72);
  const [isMetronomeActive, setIsMetronomeActive] = useState<boolean>(false);
  const [beatPulse, setBeatPulse] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playClick = (isStrong = false) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(isStrong ? 880 : 580, ctx.currentTime);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);

      setBeatPulse(true);
      setTimeout(() => setBeatPulse(false), 90);
    } catch (e) {
      console.warn("Metrônomo áudio:", e);
    }
  };

  // Metronome loop
  useEffect(() => {
    if (isMetronomeActive) {
      const intervalMs = (60 / bpm) * 1000;
      playClick(true);
      timerRef.current = window.setInterval(() => {
        playClick(false);
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isMetronomeActive, bpm]);

  // Pentatonic Note Player
  const playNote = (freq: number) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Warm harmonic overtone
      const subOsc = ctx.createOscillator();
      subOsc.type = "triangle";
      subOsc.frequency.setValueAtTime(freq / 2, ctx.currentTime);
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.06, ctx.currentTime);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      subOsc.connect(subGain);
      gain.connect(ctx.destination);
      subGain.connect(ctx.destination);

      osc.start();
      subOsc.start();
      osc.stop(ctx.currentTime + 1.25);
      subOsc.stop(ctx.currentTime + 1.25);
    } catch (e) {
      console.warn("Nota sonoro:", e);
    }
  };

  const handleBpmChange = (newBpm: number) => {
    const val = Math.min(180, Math.max(40, newBpm));
    setBpm(val);
    if (onSelectBpm) onSelectBpm(val);
  };

  return (
    <div className={`p-4 rounded-3xl border space-y-4 shadow-sm ${
      isDark ? "bg-slate-900/90 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2">
              <span>Recursos Musicais da Sala Clínica</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-semibold border border-teal-500/20">
                Apoio em Tempo Real
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Metrônomo auditivo-motor (RAS) e xilofone harmônico pentatônico seguro (sem notas de tensão).
            </p>
          </div>
        </div>

        {/* Metronome controller */}
        <div className="flex items-center gap-3 bg-slate-950/70 px-3 py-2 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsMetronomeActive(!isMetronomeActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              isMetronomeActive
                ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                : "bg-teal-600 hover:bg-teal-500 text-white"
            }`}
          >
            {isMetronomeActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isMetronomeActive ? "Pausar Pulso" : "Ativar Pulso (RAS)"}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full transition-all duration-75 ${
              beatPulse ? "bg-amber-400 scale-125 shadow-lg shadow-amber-400/50" : "bg-slate-700"
            }`} />
            <input
              type="number"
              min={40}
              max={180}
              value={bpm}
              onChange={(e) => handleBpmChange(Number(e.target.value))}
              className="w-14 px-1.5 py-0.5 text-xs text-center font-bold bg-slate-900 border border-slate-700 rounded-lg text-teal-300"
            />
            <span className="text-[11px] font-bold text-slate-400">BPM</span>
          </div>

          <div className="hidden sm:flex gap-1">
            {[60, 72, 80, 100].map((presetBpm) => (
              <button
                key={presetBpm}
                type="button"
                onClick={() => handleBpmChange(presetBpm)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition ${
                  bpm === presetBpm
                    ? "bg-teal-500/30 border-teal-400 text-teal-200"
                    : "border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                {presetBpm}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instrument Selector Tabs */}
      <div className="flex items-center justify-between border-b pb-2 border-slate-800/40">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveInstrument("piano432")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeInstrument === "piano432"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Piano className="w-3.5 h-3.5" />
            <span>Teclado Piano Am (432 Hz)</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-semibold">Novo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInstrument("xilofone")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeInstrument === "xilofone"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Xilofone Pentatônico (C)</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden md:inline">
          {activeInstrument === "piano432" ? "Afinação harmônica natural 432 Hz · Teclas 1 a 9" : "Escala maior segura"}
        </span>
      </div>

      {/* Recurso Musical Ativo */}
      {activeInstrument === "piano432" ? (
        <PentatonicPianoAm isDark={isDark} />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Xilofone Pentatônico Afinado (Toque para improvisação, acolhimento ou resposta imediata):
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">Harmonia modal segura (C Maior Pentatônica)</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PENTATONIC_NOTES.map((note) => (
              <button
                key={note.name}
                type="button"
                onClick={() => playNote(note.freq)}
                className={`p-3 rounded-2xl text-white font-bold transition transform active:scale-95 shadow-sm flex flex-col items-center justify-center gap-1 ${note.color}`}
              >
                <span className="text-xs">{note.name}</span>
                <span className="text-[10px] opacity-80">{note.freq.toFixed(0)} Hz</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
