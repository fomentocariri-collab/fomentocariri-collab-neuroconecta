import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Headphones, 
  Sparkles, 
  Clock, 
  Sliders, 
  Heart, 
  Moon, 
  Zap, 
  Wind, 
  Feather, 
  Info, 
  RotateCcw,
  Star,
  StarOff,
  Activity,
  Smile,
  FileText,
  PlusCircle,
  ShieldCheck,
  Award,
  UserCheck,
  ClipboardCheck,
  Target,
  TrendingUp,
  FolderLock,
  Piano
} from "lucide-react";
import { TwoMinutePause } from "./sound/TwoMinutePause";
import { ExploreSounds } from "./sound/ExploreSounds";
import { SoundEnvironment } from "./sound/SoundEnvironment";
import { GuidedSoundExperiences } from "./sound/GuidedSoundExperiences";
import { PentatonicPianoAm } from "./musictherapy/PentatonicPianoAm";
import { MusicTherapySession } from "../types";
import { INITIAL_LONGITUDINAL_SESSIONS } from "../data/musicTherapyData";
import { MusicTherapySessionFlow } from "./musictherapy/MusicTherapySessionFlow";
import { MusicTherapyLongitudinalAudit } from "./musictherapy/MusicTherapyLongitudinalAudit";
import { MusicTherapyCaseManagement } from "./musictherapy/MusicTherapyCaseManagement";
import { MusicTherapyAssessmentForm } from "./musictherapy/MusicTherapyAssessmentForm";
import { MusicTherapyPlanManagement } from "./musictherapy/MusicTherapyPlanManagement";
import { MusicTherapyIndicatorsView } from "./musictherapy/MusicTherapyIndicatorsView";
import { MusicTherapyReportGenerator } from "./musictherapy/MusicTherapyReportGenerator";
import { MusicTherapyDocumentsView } from "./musictherapy/MusicTherapyDocumentsView";
import { MusicotherapyCase } from "../types/musicotherapy";
import { auditService } from "../services/auditService";

interface MusicotherapyHubProps {
  isDark?: boolean;
}

export interface SoundPreset {
  id: string;
  title: string;
  category: "descompressao" | "foco" | "grounding" | "sono" | "ansiedade";
  icon: any;
  color: string;
  description: string;
  benefits: string;
  type: "brown_noise" | "binaural_432" | "binaural_528" | "alpha_waves" | "rain_sim" | "calm_chord";
  baseFreq: number;
  binauralBeat?: number;
}

const SOUND_PRESETS: SoundPreset[] = [
  {
    id: "preset-brown",
    title: "Ruído Marrom Contínuo",
    category: "descompressao",
    icon: Wind,
    color: "from-amber-600 to-orange-700",
    description: "Som contínuo de baixa frequência que algumas pessoas utilizam para mascarar ruídos ambientais ou criar sensação de constância sonora.",
    benefits: "Use em volume confortável e interrompa se causar incômodo auditivo.",
    type: "brown_noise",
    baseFreq: 120,
  },
  {
    id: "preset-432",
    title: "Faixa Sonora 432 Hz",
    category: "grounding",
    icon: Feather,
    color: "from-emerald-600 to-teal-700",
    description: "Faixa sonora suave disponível para experimentação pessoal durante momentos de pausa ou ancoragem.",
    benefits: "Algumas pessoas relatam preferência por esse tipo de som, mas seus efeitos variam individualmente.",
    type: "binaural_432",
    baseFreq: 432,
    binauralBeat: 5,
  },
  {
    id: "preset-528",
    title: "Tom Suave 528 Hz",
    category: "ansiedade",
    icon: Heart,
    color: "from-rose-500 to-pink-700",
    description: "Opção sonora para escuta relaxante conforme preferência pessoal durante períodos de descanso.",
    benefits: "Uso de conforto pessoal. Não substitui intervenção clínica, terapêutica ou tratamento médico.",
    type: "binaural_528",
    baseFreq: 528,
    binauralBeat: 7,
  },
  {
    id: "preset-alpha",
    title: "Padrão Auditivo Alfa (10 Hz)",
    category: "foco",
    icon: Zap,
    color: "from-cyan-600 to-blue-700",
    description: "Padrão sonoro rítmico utilizado por algumas pessoas durante momentos de concentração ou estudo.",
    benefits: "A resposta a estímulos rítmicos varia de pessoa para pessoa. Ajuste a duração ao seu bem-estar.",
    type: "alpha_waves",
    baseFreq: 220,
    binauralBeat: 10,
  },
  {
    id: "preset-rain",
    title: "Simulação de Chuva Suave",
    category: "grounding",
    icon: Sparkles,
    color: "from-teal-500 to-emerald-700",
    description: "Sons contínuos simulando chuva suave para atenuar ruídos externos imprevisíveis e promover conforto acústico.",
    benefits: "Ajuda a criar uma camada sonora previsível no ambiente para quem prefere sons da natureza.",
    type: "rain_sim",
    baseFreq: 180,
  },
  {
    id: "preset-sleep",
    title: "Baixa Frequência de Desaceleração (Delta)",
    category: "sono",
    icon: Moon,
    color: "from-indigo-600 to-purple-800",
    description: "Som de baixa frequência destinado à experimentação durante momentos de relaxamento ou preparação para o descanso.",
    benefits: "Auxílio sonoro de conforto pessoal. Não garante indução do sono nem efeito neurológico específico.",
    type: "calm_chord",
    baseFreq: 136.1, // Ohm tone
    binauralBeat: 2,
  },
];

export const MusicotherapyHub: React.FC<MusicotherapyHubProps> = ({ isDark = false }) => {
  const [mainSection, setMainSection] = useState<
    | "historico"
    | "nova_sessao"
    | "laboratorio_sons"
    | "painel_caso"
    | "avaliacao"
    | "plano_metas"
    | "indicadores"
    | "relatorios"
    | "documentos"
  >("historico");

  const [currentCase, setCurrentCase] = useState<MusicotherapyCase>(() => {
    try {
      const saved = localStorage.getItem("neuroconecta_active_mt_case");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: "case-lucas-01",
      patient_id: "pat-lucas-01",
      patient_name: "Lucas Mendes Silva",
      patient_birth_date: "2018-04-12",
      patient_pronouns: "ele/dele",
      patient_ciptea: "CIPTEA-CE 2026/089",
      patient_diagnosis_status: "laudo_formal",
      professional_id: "prof-mt-01",
      professional_name: "Dra. Mariana Vasconcelos",
      professional_register: "CBO 2263-05 / UBAM 0341",
      start_date: "2026-02-10",
      status: "active",
      created_at: new Date().toISOString(),
      created_by: "prof-mt-01",
      updated_at: new Date().toISOString(),
      updated_by: "prof-mt-01",
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem("neuroconecta_active_mt_case", JSON.stringify(currentCase));
    } catch {}
  }, [currentCase]);

  const [sessions, setSessions] = useState<MusicTherapySession[]>(() => {
    try {
      const saved = localStorage.getItem("neuroconecta_musictherapy_sessions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Erro ao carregar sessões de musicoterapia:", e);
    }
    return INITIAL_LONGITUDINAL_SESSIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("neuroconecta_musictherapy_sessions", JSON.stringify(sessions));
    } catch (e) {
      console.warn("Erro ao persistir sessões de musicoterapia:", e);
    }
  }, [sessions]);

  const handleSaveSession = (newSession: MusicTherapySession) => {
    setSessions((prev) => {
      const existingIdx = prev.findIndex((s) => s.id === newSession.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = newSession;
        return next;
      }
      return [...prev, newSession];
    });
    setMainSection("historico");
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    auditService.log({
      action: "RECORD_DELETED",
      entityType: "musicotherapy_session",
      entityId: sessionId,
      source: "MusicotherapyHub",
    });
  };

  const handleResetSeed = () => {
    if (confirm("Deseja restaurar as sessões de exemplo do histórico longitudinal?")) {
      setSessions(INITIAL_LONGITUDINAL_SESSIONS);
      try {
        localStorage.setItem("neuroconecta_musictherapy_sessions", JSON.stringify(INITIAL_LONGITUDINAL_SESSIONS));
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const nextSessionNumber = sessions.length > 0 ? Math.max(...sessions.map((s) => s.sessionNumber)) + 1 : 1;

  const [activeMode, setActiveMode] = useState<
    "player" | "teclado_432" | "pausa_2min" | "explorar" | "ambiente" | "preparar_tarefa" | "descompressao" | "som_movimento" | "favoritos"
  >("player");

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("neuroconecta_sound_favorites");
      return stored ? JSON.parse(stored) : ["preset-brown", "preset-rain"];
    } catch {
      return ["preset-brown", "preset-rain"];
    }
  });

  const toggleFavorite = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(presetId)
        ? prev.filter((id) => id !== presetId)
        : [...prev, presetId];
      try {
        localStorage.setItem("neuroconecta_sound_favorites", JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
  };

  const [activePreset, setActivePreset] = useState<SoundPreset>(SOUND_PRESETS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Timer state
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);

  // Web Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeNodesRef = useRef<any[]>([]);

  // Breathing Visualizer state
  const [breathingPhase, setBreathingPhase] = useState<"inspire" | "segure" | "expire">("inspire");
  const [breathingText, setBreathingText] = useState("Inspire suavemente...");

  // Timer Countdown Effect
  useEffect(() => {
    if (!isPlaying || timeLeftSeconds === null) return;

    if (timeLeftSeconds <= 0) {
      stopAudio();
      setTimerMinutes(null);
      setTimeLeftSeconds(null);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, timeLeftSeconds]);

  // Breathing Rhythm Loop Effect for Visual Stimming
  useEffect(() => {
    if (!isPlaying) return;

    let timeoutId: NodeJS.Timeout;

    const runBreathingCycle = () => {
      setBreathingPhase("inspire");
      setBreathingText("Inspire suavemente (4s)");

      timeoutId = setTimeout(() => {
        setBreathingPhase("segure");
        setBreathingText("Mantenha o ar (4s)");

        timeoutId = setTimeout(() => {
          setBreathingPhase("expire");
          setBreathingText("Solte bem devagar (6s)");

          timeoutId = setTimeout(() => {
            runBreathingCycle();
          }, 6000);
        }, 4000);
      }, 4000);
    };

    runBreathingCycle();

    return () => clearTimeout(timeoutId);
  }, [isPlaying]);

  // Stop & Clean Audio Nodes
  const stopAudio = () => {
    activeNodesRef.current.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        console.warn(e);
      }
    });
    activeNodesRef.current = [];
    setIsPlaying(false);
  };

  // Start Audio Synthesizer
  const startAudio = (preset: SoundPreset) => {
    stopAudio();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      } else if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      if (preset.type === "brown_noise" || preset.type === "rain_sim") {
        // Brown noise generation via buffer
        const bufferSize = ctx.sampleRate * 3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // Boost brown noise warmth
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;
        noiseNode.loop = true;

        // Lowpass filter for cozy sound
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = preset.type === "rain_sim" ? 800 : 400;

        noiseNode.connect(filter);
        filter.connect(masterGain);

        noiseNode.start();
        activeNodesRef.current.push(noiseNode, filter);

      } else {
        // Sine Oscillators for Binaural Beats or Harmonic Chords
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();

        const merger = ctx.createChannelMerger(2);

        oscLeft.type = "sine";
        oscRight.type = "sine";

        const freq = preset.baseFreq;
        const beat = preset.binauralBeat || 5;

        oscLeft.frequency.value = freq;
        oscRight.frequency.value = freq + beat;

        // Soft Gain Envelope
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.3, ctx.currentTime);

        oscLeft.connect(merger, 0, 0); // Left channel
        oscRight.connect(merger, 0, 1); // Right channel

        merger.connect(oscGain);
        oscGain.connect(masterGain);

        // Add a gentle sub-harmonic background drone
        const subOsc = ctx.createOscillator();
        subOsc.type = "triangle";
        subOsc.frequency.value = freq / 2;
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.08, ctx.currentTime);

        subOsc.connect(subGain);
        subGain.connect(masterGain);

        oscLeft.start();
        oscRight.start();
        subOsc.start();

        activeNodesRef.current.push(oscLeft, oscRight, subOsc, oscGain, subGain, merger);
      }

      setIsPlaying(true);
    } catch (e) {
      console.error("Erro ao iniciar gerador de áudio:", e);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio(activePreset);
    }
  };

  const handleSelectPreset = (preset: SoundPreset) => {
    setActivePreset(preset);
    if (isPlaying) {
      startAudio(preset);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : newVol, audioCtxRef.current.currentTime);
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(nextMute ? 0 : volume, audioCtxRef.current.currentTime);
    }
  };

  const handleSetTimer = (minutes: number) => {
    if (timerMinutes === minutes) {
      setTimerMinutes(null);
      setTimeLeftSeconds(null);
    } else {
      setTimerMinutes(minutes);
      setTimeLeftSeconds(minutes * 60);
      if (!isPlaying) {
        startAudio(activePreset);
      }
    }
  };

  const formatSeconds = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn">
      
      {/* Primary Clinical Section Switcher */}
      <div className={`p-3 rounded-3xl border space-y-3 shadow-sm ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        {/* NAVEGAÇÃO PRINCIPAL (3 MODOS ORIGINAIS) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <button
              type="button"
              onClick={() => setMainSection("historico")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                mainSection === "historico"
                  ? "bg-teal-600 text-white shadow-teal-600/30 ring-2 ring-teal-400/20"
                  : isDark ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <Activity className="w-4 h-4 text-teal-300" />
              <span>Histórico Longitudinal Auditável</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/40 text-teal-200 font-black">
                {sessions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMainSection("nova_sessao")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                mainSection === "nova_sessao"
                  ? "bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/20"
                  : "bg-emerald-600/90 hover:bg-emerald-500 text-white"
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-100" />
              <span>Registrar Sessão de Musicoterapia</span>
            </button>

            <button
              type="button"
              onClick={() => setMainSection("laboratorio_sons")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                mainSection === "laboratorio_sons"
                  ? "bg-teal-600 text-white shadow-teal-600/30 ring-2 ring-teal-400/20"
                  : isDark ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <Sliders className="w-4 h-4 text-cyan-300" />
              <span>Biblioteca & Recursos Sonoros</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 pr-2 text-[11px] text-slate-400 shrink-0">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Estrutura Clínica Auditável • Protocolo NC-MT1</span>
          </div>
        </div>

        {/* SUB-BARRA: GESTÃO DO PRONTUÁRIO & CASO */}
        <div className={`p-2 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
          isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
              Prontuário & PTS-MT:
            </span>

            <button
              type="button"
              onClick={() => setMainSection("painel_caso")}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition flex items-center gap-1.5 ${
                mainSection === "painel_caso"
                  ? "bg-teal-600 text-white"
                  : isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Identificação & Caso</span>
            </button>

            <button
              type="button"
              onClick={() => setMainSection("avaliacao")}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition flex items-center gap-1.5 ${
                mainSection === "avaliacao"
                  ? "bg-teal-600 text-white"
                  : isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Avaliação 8 Domínios</span>
            </button>

            <button
              type="button"
              onClick={() => setMainSection("plano_metas")}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition flex items-center gap-1.5 ${
                mainSection === "plano_metas"
                  ? "bg-teal-600 text-white"
                  : isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Plano Terapêutico (PTS-MT)</span>
            </button>

            <button
              type="button"
              onClick={() => setMainSection("indicadores")}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition flex items-center gap-1.5 ${
                mainSection === "indicadores"
                  ? "bg-teal-600 text-white"
                  : isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Indicadores & Curva</span>
            </button>

            <button
              type="button"
              onClick={() => setMainSection("relatorios")}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition flex items-center gap-1.5 ${
                mainSection === "relatorios"
                  ? "bg-teal-600 text-white"
                  : isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Relatório Pericial</span>
            </button>

            <button
              type="button"
              onClick={() => setMainSection("documentos")}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition flex items-center gap-1.5 ${
                mainSection === "documentos"
                  ? "bg-teal-600 text-white"
                  : isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FolderLock className="w-3.5 h-3.5 text-rose-400" />
              <span>Documentos & Guias</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-2 text-[11px]">
            <span className="text-slate-400 font-medium">Paciente:</span>
            <span className="text-teal-400 font-bold">{currentCase.patient_name}</span>
          </div>
        </div>
      </div>

      {/* VIEW 0: Painel de Gestão de Casos Clínicos & Prontuários */}
      {mainSection === "painel_caso" && (
        <MusicTherapyCaseManagement
          currentCase={currentCase}
          onSelectCase={(selected) => setCurrentCase(selected)}
          isDark={isDark}
        />
      )}

      {/* VIEW 1: Avaliação Clínica (8 Domínios - Fato Observado vs Interpretação) */}
      {mainSection === "avaliacao" && (
        <MusicTherapyAssessmentForm
          currentCase={currentCase}
          isDark={isDark}
          onSaved={() => setMainSection("plano_metas")}
        />
      )}

      {/* VIEW 2: Plano Terapêutico Singular (PTS-MT) & Metas SMART */}
      {mainSection === "plano_metas" && (
        <MusicTherapyPlanManagement
          currentCase={currentCase}
          isDark={isDark}
        />
      )}

      {/* VIEW 3: Sessões Clínicas Auditáveis & Histórico Longitudinal */}
      {(mainSection === "historico" || (mainSection as any) === "sessoes") && (
        <MusicTherapyLongitudinalAudit
          sessions={sessions}
          onNewSession={() => setMainSection("nova_sessao")}
          onDeleteSession={handleDeleteSession}
          onResetSeed={handleResetSeed}
          isDark={isDark}
        />
      )}

      {/* VIEW 4: Registrar Nova Sessão Clínica Estruturada */}
      {mainSection === "nova_sessao" && (
        <MusicTherapySessionFlow
          currentSessionNumber={nextSessionNumber}
          onSaveSession={handleSaveSession}
          onCancel={() => setMainSection("historico")}
          isDark={isDark}
        />
      )}

      {/* VIEW 5: Indicadores & Curva de Desenvolvimento */}
      {mainSection === "indicadores" && (
        <MusicTherapyIndicatorsView
          currentCase={currentCase}
          isDark={isDark}
        />
      )}

      {/* VIEW 6: Relatório Clínico Longitudinal Pericial */}
      {mainSection === "relatorios" && (
        <MusicTherapyReportGenerator
          currentCase={currentCase}
          isDark={isDark}
        />
      )}

      {/* VIEW 7: Repositório de Documentos Clínicos & Guias de Convênio */}
      {mainSection === "documentos" && (
        <MusicTherapyDocumentsView
          currentCase={currentCase}
          isDark={isDark}
        />
      )}

      {/* VIEW 3: Biblioteca & Laboratório Sonoro (Recursos da Sala) */}
      {mainSection === "laboratorio_sons" && (
        <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner - Soft, Neuro-friendly */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm transition ${
        isDark 
          ? "bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border-teal-800/60 text-slate-100" 
          : "bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-cyan-50/80 border-teal-200/80 text-slate-800"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
              <Headphones className="w-4 h-4 text-teal-500" />
              <span>Conforto Sensorial & Pausa Acústica</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Som & Autorregulação
            </h1>
            <p className="text-sm sm:text-base opacity-90 leading-relaxed font-sans">
              Paisagens sonoras contínuas, ruído marrom e faixas sonoras de baixa frequência para momentos de foco, pausa ou alívio de ruídos do ambiente.
            </p>
            {/* Aviso de Segurança Auditiva (Item 5 do Adendo) */}
            <div className="p-3 bg-teal-950/40 border border-teal-800/60 rounded-xl text-xs text-teal-200/90 flex items-start gap-2">
              <Info className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Regra de Segurança Auditiva:</strong> Use em volume confortável. Interrompa se sentir dor, desconforto, tontura ou aumento da irritação sensorial. Fones de ouvido são opcionais e devem ser usados em volume seguro.
              </span>
            </div>
          </div>

          {/* Quick Active Sound Indicator */}
          <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
            isDark ? "bg-slate-950/80 border-slate-800" : "bg-white/90 border-teal-100 shadow-sm"
          }`}>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activePreset.color} text-white flex items-center justify-center flex-shrink-0 shadow-md`}>
              {React.createElement(activePreset.icon, { className: "w-6 h-6" })}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Preset Atual</span>
              <h3 className="text-sm font-bold truncate max-w-[150px] sm:max-w-[180px]">{activePreset.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{isPlaying ? "🟢 Tocando agora" : "⚪ Em pausa"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Som & Autorregulação: Experiences & Activities Mode Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
        {[
          { id: "player", label: "Biblioteca & Player", icon: Sliders },
          { id: "teclado_432", label: "Teclado Am (432Hz)", icon: Piano },
          { id: "pausa_2min", label: "Pausa de 2 Minutos", icon: Clock },
          { id: "explorar", label: "Explorar Sons", icon: Headphones },
          { id: "ambiente", label: "Meu Ambiente Sonoro", icon: Volume2 },
          { id: "preparar_tarefa", label: "Preparar Tarefa", icon: Zap },
          { id: "descompressao", label: "Descompressão", icon: Wind },
          { id: "som_movimento", label: "Som & Movimento", icon: Activity },
          { id: "favoritos", label: `Favoritos (${favorites.length})`, icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMode(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isActive
                  ? "bg-teal-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-teal-300" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 0. Teclado Pentatônico Am 432Hz */}
      {activeMode === "teclado_432" && (
        <div className="space-y-4">
          <PentatonicPianoAm isDark={isDark} />
        </div>
      )}

      {/* 1. Pausa de 2 Minutos Mode */}
      {activeMode === "pausa_2min" && (
        <TwoMinutePause
          presets={SOUND_PRESETS}
          activePreset={activePreset}
          isPlaying={isPlaying}
          onSelectPreset={handleSelectPreset}
          onStartAudio={startAudio}
          onStopAudio={stopAudio}
          isDark={isDark}
        />
      )}

      {/* 2. Explorar Sons & Sensibilidade Mode */}
      {activeMode === "explorar" && (
        <ExploreSounds
          presets={SOUND_PRESETS}
          activePreset={activePreset}
          isPlaying={isPlaying}
          onSelectPreset={handleSelectPreset}
          onStartAudio={startAudio}
          onStopAudio={stopAudio}
          isDark={isDark}
        />
      )}

      {/* 3. Meu Ambiente Sonoro Mode */}
      {activeMode === "ambiente" && (
        <SoundEnvironment isDark={isDark} />
      )}

      {/* 4. Guided Experiences: Preparar para uma Tarefa */}
      {activeMode === "preparar_tarefa" && (
        <GuidedSoundExperiences
          mode="preparar_tarefa"
          presets={SOUND_PRESETS}
          isPlaying={isPlaying}
          onStartAudio={startAudio}
          onStopAudio={stopAudio}
          isDark={isDark}
        />
      )}

      {/* 5. Guided Experiences: Descompressão Pós-Atividade */}
      {activeMode === "descompressao" && (
        <GuidedSoundExperiences
          mode="descompressao"
          presets={SOUND_PRESETS}
          isPlaying={isPlaying}
          onStartAudio={startAudio}
          onStopAudio={stopAudio}
          isDark={isDark}
        />
      )}

      {/* 6. Guided Experiences: Som e Movimento */}
      {activeMode === "som_movimento" && (
        <GuidedSoundExperiences
          mode="som_movimento"
          presets={SOUND_PRESETS}
          isPlaying={isPlaying}
          onStartAudio={startAudio}
          onStopAudio={stopAudio}
          isDark={isDark}
        />
      )}

      {/* 7 & 8: Main Player & Visualizer Grid (For 'player' and 'favoritos' modes) */}
      {(activeMode === "player" || activeMode === "favoritos") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visual Stimming Orb & Controls */}
        <div className={`lg:col-span-7 p-6 sm:p-8 rounded-3xl border flex flex-col justify-between space-y-6 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-500" />
              <span>Ancoragem Visual & Pulso Sensorial</span>
            </h2>
            {timerMinutes && timeLeftSeconds !== null && (
              <span className="px-3 py-1 bg-teal-950 text-teal-300 border border-teal-800 text-xs font-bold rounded-full flex items-center gap-1.5 animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                {formatSeconds(timeLeftSeconds)}
              </span>
            )}
          </div>

          {/* Stimming Orb Animation Canvas */}
          <div className="relative py-12 flex flex-col items-center justify-center">
            
            {/* Pulsing Outer Rings */}
            <div className={`absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full transition-all duration-1000 ${
              isPlaying
                ? breathingPhase === "inspire"
                  ? "scale-125 bg-teal-500/20 blur-xl"
                  : breathingPhase === "segure"
                  ? "scale-110 bg-emerald-500/20 blur-lg"
                  : "scale-90 bg-cyan-500/10 blur-md"
                : "scale-90 bg-slate-200 dark:bg-slate-800/40 opacity-30"
            }`} />

            {/* Middle Breathing Circle */}
            <div className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br ${activePreset.color} p-1 shadow-xl transition-all duration-[3500ms] flex items-center justify-center ${
              isPlaying
                ? breathingPhase === "inspire"
                  ? "scale-110 shadow-teal-500/40"
                  : breathingPhase === "segure"
                  ? "scale-105 shadow-emerald-500/30"
                  : "scale-95 shadow-cyan-500/20"
                : "scale-95 opacity-80"
            }`}>
              <div className={`w-full h-full rounded-full flex flex-col items-center justify-center p-4 text-center text-white backdrop-blur-sm transition ${
                isDark ? "bg-slate-950/40" : "bg-black/10"
              }`}>
                {React.createElement(activePreset.icon, { 
                  className: `w-10 h-10 mb-1 transition-transform duration-700 ${isPlaying ? "animate-bounce" : ""}` 
                })}
                <span className="text-xs font-bold drop-shadow">{activePreset.title}</span>
              </div>
            </div>

            {/* Breathing Guide Subtitle */}
            <div className="mt-8 text-center space-y-1">
              <p className={`text-sm font-semibold transition-all ${
                isPlaying ? "text-teal-600 dark:text-teal-300" : "text-slate-400"
              }`}>
                {isPlaying ? breathingText : "Clique em 'Iniciar Som' para começar o ciclo sensorial."}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Foque o olhar no movimento circular para descompressão visual
              </p>
            </div>

          </div>

          {/* Master Play & Volume Controls Bar */}
          <div className={`p-4 rounded-2xl border space-y-4 ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleTogglePlay}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition shadow-md active:scale-95 ${
                  isPlaying
                    ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30"
                    : "bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/30"
                }`}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                <span>{isPlaying ? "Pausar Som" : "Iniciar Som Regula"}</span>
              </button>

              {/* Mute Toggle */}
              <button
                onClick={handleToggleMute}
                className={`p-3.5 rounded-2xl border transition ${
                  isMuted
                    ? "bg-rose-950 text-rose-300 border-rose-800"
                    : isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                }`}
                title={isMuted ? "Desmutar" : "Mutar"}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 accent-teal-600 cursor-pointer h-2 bg-slate-300 dark:bg-slate-800 rounded-lg"
              />
              <span className="text-xs font-mono text-slate-500 w-8 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

            {/* Timer Presets */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Temporizador:
              </span>
              <div className="flex items-center gap-1.5">
                {[5, 15, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleSetTimer(mins)}
                    className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
                      timerMinutes === mins
                        ? "bg-teal-600 text-white border-teal-500"
                        : isDark
                        ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Sound Presets Catalog */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-500" />
              <span>{activeMode === "favoritos" ? "Meus Sons Favoritos" : "Biblioteca de Frequências"}</span>
            </h2>
            <span className="text-xs text-slate-500">
              {activeMode === "favoritos"
                ? `${SOUND_PRESETS.filter((p) => favorites.includes(p.id)).length} favoritados`
                : "6 opções otimizadas"}
            </span>
          </div>

          <div className="space-y-3">
            {(activeMode === "favoritos"
              ? SOUND_PRESETS.filter((p) => favorites.includes(p.id))
              : SOUND_PRESETS
            ).map((preset) => {
              const Icon = preset.icon;
              const isSelected = activePreset.id === preset.id;
              const isFav = favorites.includes(preset.id);

              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                    isSelected
                      ? isDark
                        ? "bg-slate-800 border-teal-500 ring-2 ring-teal-500/30 text-slate-100 shadow-md"
                        : "bg-teal-50/90 border-teal-400 ring-2 ring-teal-500/20 text-slate-900 shadow-md"
                      : isDark
                      ? "bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-300"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${preset.color} text-white flex-shrink-0 shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold">{preset.title}</h3>
                        <div className="flex items-center gap-2">
                          {isSelected && isPlaying && (
                            <span className="flex h-2.5 w-2.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(preset.id, e)}
                            className={`p-1 rounded-lg transition ${
                              isFav ? "text-amber-400 hover:text-amber-300" : "text-slate-500 hover:text-slate-300"
                            }`}
                            title={isFav ? "Remover dos favoritos" : "Marcar como favorito"}
                          >
                            <Star className={`w-4 h-4 ${isFav ? "fill-amber-400" : ""}`} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs opacity-90 leading-relaxed font-sans">
                        {preset.description}
                      </p>
                      
                      <div className="pt-2 text-[11px] text-teal-700 dark:text-teal-300 font-medium flex items-center gap-1">
                        <Info className="w-3 h-3 flex-shrink-0" />
                        <span>{preset.benefits}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {activeMode === "favoritos" && SOUND_PRESETS.filter((p) => favorites.includes(p.id)).length === 0 && (
              <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                <Star className="w-8 h-8 text-amber-400/50 mx-auto" />
                <h4 className="text-sm font-bold text-slate-200">Nenhum som favoritado ainda</h4>
                <p className="text-xs text-slate-400">
                  Clique na estrela ao lado de qualquer frequência na Biblioteca para acessá-la rapidamente aqui!
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
      )}

        </div>
      )}

      {/* Educational Footer Banner */}
      <div className={`p-5 rounded-2xl border text-xs leading-relaxed space-y-2 ${
        isDark ? "bg-slate-900/60 border-slate-800 text-slate-400" : "bg-teal-50/50 border-teal-100 text-slate-600"
      }`}>
        <h4 className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
          💡 Som Ambiente, Previsibilidade e Conforto Sensorial
        </h4>
        <p>
          Ambientes com ruídos imprevisíveis ou conversas paralelas podem demandar muita energia de atenção e gerar sobrecarga. Para muitas pessoas, sons contínuos e homogêneos (como ruído marrom ou sons da natureza) funcionam como uma camada protetora que reduz o impacto de interferências externas. Lembre-se: este módulo oferece opções para experimentação e conforto pessoal, não constituindo musicoterapia clínica formal.
        </p>
      </div>

    </div>
  );
};
