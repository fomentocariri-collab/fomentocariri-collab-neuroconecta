import React, { useState, useEffect } from "react";
import { Play, Pause, Volume2, ThumbsUp, Minus, ThumbsDown, Sparkles, CheckCircle2, ShieldCheck, RotateCcw } from "lucide-react";
import { SoundPreset } from "../MusicotherapyHub";

interface ExploreSoundsProps {
  presets: SoundPreset[];
  activePreset: SoundPreset;
  isPlaying: boolean;
  onSelectPreset: (preset: SoundPreset) => void;
  onStartAudio: (preset: SoundPreset) => void;
  onStopAudio: () => void;
  isDark?: boolean;
}

const STORAGE_RATINGS_KEY = "neuroconecta_sound_ratings_v1";

export const ExploreSounds: React.FC<ExploreSoundsProps> = ({
  presets,
  activePreset,
  isPlaying,
  onSelectPreset,
  onStartAudio,
  onStopAudio,
  isDark = true,
}) => {
  const [ratings, setRatings] = useState<Record<string, "agradavel" | "neutro" | "incomodo">>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_RATINGS_KEY);
      if (stored) {
        setRatings(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Erro ao carregar avaliações sonoras", e);
    }
  }, []);

  const handleSetRating = (presetId: string, rating: "agradavel" | "neutro" | "incomodo") => {
    const updated = { ...ratings, [presetId]: rating };
    setRatings(updated);
    try {
      localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleClearRatings = () => {
    setRatings({});
    try {
      localStorage.removeItem(STORAGE_RATINGS_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  const pleasantCount = Object.values(ratings).filter(r => r === "agradavel").length;
  const unpleasantCount = Object.values(ratings).filter(r => r === "incomodo").length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Banner */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-sm"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Mapeamento de Sensibilidade Auditiva
            </div>
            <h2 className="text-xl font-bold">Explorar Sons &amp; Sensibilidade Pessoal</h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Nem todo mundo relaxa com o mesmo estímulo acústico. Ouça cada um dos sons por 15 a 30 segundos em volume confortável e classifique como seu sistema nervoso responde a cada frequência.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {Object.keys(ratings).length > 0 && (
              <button
                type="button"
                onClick={handleClearRatings}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs border border-slate-700 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar Avaliações</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Chips */}
      {Object.keys(ratings).length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{pleasantCount} Sons Agradáveis (Acolhedores)</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1.5">
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{unpleasantCount} Sons Desconfortáveis (A Evitar)</span>
          </div>
        </div>
      )}

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presets.map((preset) => {
          const Icon = preset.icon;
          const isSelected = activePreset.id === preset.id;
          const isCurrentPlaying = isSelected && isPlaying;
          const userRating = ratings[preset.id];

          return (
            <div
              key={preset.id}
              className={`p-5 rounded-2xl border transition-all ${
                isSelected
                  ? "bg-slate-800/90 border-teal-500 shadow-md"
                  : "bg-slate-900/70 border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${preset.color} text-white flex-shrink-0 shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{preset.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{preset.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectPreset(preset);
                    if (isCurrentPlaying) {
                      onStopAudio();
                    } else {
                      onStartAudio(preset);
                    }
                  }}
                  className={`p-2.5 rounded-xl transition flex-shrink-0 ${
                    isCurrentPlaying
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-teal-600 hover:bg-teal-500 text-white shadow-sm"
                  }`}
                  title={isCurrentPlaying ? "Pausar" : "Ouvir"}
                >
                  {isCurrentPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
              </div>

              {/* Rating Selector */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Sua sensação ao ouvir:</span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetRating(preset.id, "agradavel")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition border ${
                      userRating === "agradavel"
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700"
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Agradável</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetRating(preset.id, "neutro")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition border ${
                      userRating === "neutro"
                        ? "bg-slate-700 text-slate-100 border-slate-600 shadow-sm"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700"
                    }`}
                  >
                    <Minus className="w-3 h-3" />
                    <span>Neutro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetRating(preset.id, "incomodo")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition border ${
                      userRating === "incomodo"
                        ? "bg-rose-600 text-white border-rose-500 shadow-sm"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700"
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                    <span>Incômodo</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
