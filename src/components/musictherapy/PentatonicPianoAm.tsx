import React, { useState, useEffect, useRef, useCallback } from "react";
import { Maximize2, Minimize2, Volume2, Info, Sparkles, Music } from "lucide-react";

interface PentatonicPianoAmProps {
  isDark?: boolean;
  onCloseFullscreen?: () => void;
}

interface NoteConfig {
  nota: string;
  freq: number;
  cor: string;
  tecla: string;
  nome: string;
}

export const NOTAS_AM_432: NoteConfig[] = [
  { nota: "A3", freq: 216.0, cor: "#C62828", tecla: "1", nome: "Lá grave (216 Hz)" }, // Vermelho Escuro
  { nota: "C4", freq: 256.87, cor: "#E65100", tecla: "2", nome: "Dó (256,8 Hz)" },    // Laranja Escuro
  { nota: "D4", freq: 288.32, cor: "#FBC02D", tecla: "3", nome: "Ré (288,3 Hz)" },    // Amarelo Escuro
  { nota: "E4", freq: 323.64, cor: "#2E7D32", tecla: "4", nome: "Mi (323,6 Hz)" },    // Verde Escuro
  { nota: "G4", freq: 384.87, cor: "#1565C0", tecla: "5", nome: "Sol (384,8 Hz)" },   // Azul Escuro
  { nota: "A4", freq: 432.0, cor: "#EF5350", tecla: "6", nome: "Lá central (432 Hz)" }, // Vermelho Claro
  { nota: "C5", freq: 513.74, cor: "#FF9800", tecla: "7", nome: "Dó oitava (513,7 Hz)" },// Laranja Claro
  { nota: "D5", freq: 576.65, cor: "#FFF176", tecla: "8", nome: "Ré oitava (576,6 Hz)" },// Amarelo Claro
  { nota: "E5", freq: 647.26, cor: "#4CAF50", tecla: "9", nome: "Mi oitava (647,2 Hz)" } // Verde Claro
];

interface ActiveOscillator {
  oscs: OscillatorNode[];
  gainNode: GainNode;
}

export const PentatonicPianoAm: React.FC<PentatonicPianoAmProps> = ({ isDark = true }) => {
  const [activeKeys, setActiveKeys] = useState<{ [nota: string]: boolean }>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osciladoresAtivosRef = useRef<{ [nota: string]: ActiveOscillator }>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Tocar nota com os harmônicos de Piano e afinação 432Hz
  const tocarNota = useCallback((notaObj: NoteConfig) => {
    const audioCtx = initAudio();
    if (osciladoresAtivosRef.current[notaObj.nota]) return;

    const gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);

    // Criação dos harmônicos do Piano (Onda fundamental + frequências secundárias)
    const componentes = [
      { tipo: "sine" as OscillatorType, vol: 0.5 },         // Corpo principal
      { tipo: "triangle" as OscillatorType, vol: 0.25 },     // Brilho da madeira do piano
      { tipo: "sine" as OscillatorType, mult: 2, vol: 0.1 } // Harmônico superior sutil
    ];

    const oscs = componentes.map(comp => {
      const osc = audioCtx.createOscillator();
      osc.type = comp.tipo;
      osc.frequency.setValueAtTime(notaObj.freq * (comp.mult || 1), audioCtx.currentTime);

      const compGain = audioCtx.createGain();
      compGain.gain.setValueAtTime(comp.vol, audioCtx.currentTime);

      osc.connect(compGain);
      compGain.connect(gainNode);
      osc.start();
      return osc;
    });

    // Envelope ADSR de Piano: Ataque percussivo imediato e decaimento gradual
    const agora = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0, agora);
    gainNode.gain.linearRampToValueAtTime(0.4, agora + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.05, agora + 1.5);

    osciladoresAtivosRef.current[notaObj.nota] = { oscs, gainNode };
    setActiveKeys(prev => ({ ...prev, [notaObj.nota]: true }));
  }, [initAudio]);

  // Cessar o som ao soltar (Simula o abafador de feltro do piano)
  const pararNota = useCallback((notaObj: NoteConfig) => {
    const ativa = osciladoresAtivosRef.current[notaObj.nota];
    if (ativa && audioCtxRef.current) {
      const { oscs, gainNode } = ativa;
      const agora = audioCtxRef.current.currentTime;

      gainNode.gain.setValueAtTime(gainNode.gain.value, agora);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, agora + 0.3);

      oscs.forEach(osc => {
        try {
          osc.stop(agora + 0.3);
        } catch {
          // ignore
        }
      });
      delete osciladoresAtivosRef.current[notaObj.nota];
    }
    setActiveKeys(prev => ({ ...prev, [notaObj.nota]: false }));
  }, []);

  // Suporte a teclado do computador (teclas 1 a 9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se o usuário estiver digitando em input ou textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      const notaMapeada = NOTAS_AM_432.find(n => n.tecla === e.key);
      if (notaMapeada && !osciladoresAtivosRef.current[notaMapeada.nota]) {
        tocarNota(notaMapeada);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const notaMapeada = NOTAS_AM_432.find(n => n.tecla === e.key);
      if (notaMapeada) {
        pararNota(notaMapeada);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      // Limpar osciladores ao desmontar
      Object.values(osciladoresAtivosRef.current).forEach((item: ActiveOscillator) => {
        item.oscs.forEach(o => {
          try {
            o.stop();
          } catch {
            // ignore
          }
        });
      });
      osciladoresAtivosRef.current = {};
    };
  }, [tocarNota, pararNota]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-[#121212] p-4 flex flex-col justify-between select-none"
          : "p-4 space-y-3 border rounded-3xl " + (isDark ? "bg-slate-900/95 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800")
      }`}
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {/* Cabeçalho da Ferramenta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Teclado Pentatônico Am — 432 Hz Piano
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
                Afinação Natural 432Hz
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30 hidden sm:inline">
                Harmonia Modal Segura
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Escala Pentatônica Menor de Lá (A3 a E5) com ressonância harmônica de piano e envelope ADSR percussivo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            title={isFullscreen ? "Sair da tela cheia" : "Expandir para tela cheia clínica (imersão táctil)"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? "Reduzir" : "Tela Cheia"}</span>
          </button>
        </div>
      </div>

      {/* Orientações clínicas rápidas */}
      {!isFullscreen && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Toque nas teclas ou pressione os números <strong>1 a 9</strong> no teclado.
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Cores escuras na base grave · Claras nas oitavas agudas
          </span>
        </div>
      )}

      {/* Teclado Pentatônico Visual */}
      <div
        className={`w-full flex gap-2 select-none ${
          isFullscreen ? "h-[80vh] py-2" : "h-44 sm:h-52 py-1"
        }`}
      >
        {NOTAS_AM_432.map((item) => {
          const isAtiva = !!activeKeys[item.nota];
          return (
            <button
              key={item.nota}
              type="button"
              id={`tecla-${item.nota}`}
              onMouseDown={(e) => {
                e.preventDefault();
                tocarNota(item);
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                pararNota(item);
              }}
              onMouseLeave={() => {
                if (isAtiva) pararNota(item);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                tocarNota(item);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                pararNota(item);
              }}
              onTouchCancel={(e) => {
                e.preventDefault();
                pararNota(item);
              }}
              style={{
                backgroundColor: item.cor,
                boxShadow: isAtiva
                  ? "0 2px 4px rgba(0,0,0,0.6)"
                  : "0 6px 14px rgba(0,0,0,0.45)",
                transform: isAtiva ? "scale(0.96)" : "scale(1)",
                filter: isAtiva ? "brightness(1.28) saturate(1.15)" : "none"
              }}
              className="flex-1 flex flex-col justify-end items-center pb-4 sm:pb-6 rounded-2xl cursor-pointer transition-all duration-75 text-white active:outline-none focus:outline-none relative group border border-white/10"
              title={`${item.nota} (${item.freq} Hz) - Tecla ${item.tecla}`}
            >
              {/* Nome da nota musical */}
              <span
                className={`font-black tracking-tight leading-none drop-shadow-md ${
                  isFullscreen ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"
                }`}
                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
              >
                {item.nota}
              </span>

              {/* Tecla numérica de atalho */}
              <span
                className="mt-1 px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-semibold bg-black/30 text-white/90"
              >
                {item.tecla}
              </span>

              {/* Frequência precisa (visível no hover ou quando ativa) */}
              <span className="text-[10px] text-white/75 mt-0.5 font-mono hidden sm:inline">
                {item.freq.toFixed(0)} Hz
              </span>
            </button>
          );
        })}
      </div>

      {isFullscreen && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-2 border-t border-slate-800">
          <span>Afinação 432 Hz Piano Pentatônico (Am) · Resposta motora sem notas de dissonância</span>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
          >
            Sair do Modo Tela Cheia
          </button>
        </div>
      )}
    </div>
  );
};
