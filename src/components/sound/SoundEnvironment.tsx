import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, Copy, Check, RotateCcw } from "lucide-react";

const STORAGE_ENV_KEY = "neuroconecta_sound_environment_v1";

interface SoundEnvItem {
  id: string;
  label: string;
  category: "ajuda" | "atrapalha";
  description: string;
}

const DEFAULT_ENV_ITEMS: SoundEnvItem[] = [
  { id: "brown_noise", label: "Ruído Marrom ou Rosa Contínuo", category: "ajuda", description: "Mascara sons imprevisíveis com constância acústica" },
  { id: "rain_ambient", label: "Sons Contínuos de Chuva / Natureza", category: "ajuda", description: "Cria uma barreira suave e orgânica" },
  { id: "anc_headphones", label: "Fones com Cancelamento Ativo (ANC)", category: "ajuda", description: "Reduz o volume geral do ambiente em até 20 dB" },
  { id: "lofi_ambient", label: "Música Instrumental Sem Vocais", category: "ajuda", description: "Evita o processamento linguístico concorrente" },
  { id: "constant_fan", label: "Ventilador / Ar-Condicionado Suave", category: "ajuda", description: "Fonte previsível de som mecânico neutro" },

  { id: "side_conversations", label: "Conversas Paralelas Concorrentes", category: "atrapalha", description: "Cérebro tenta decodificar palavras involuntariamente" },
  { id: "phone_notifications", label: "Bips e Notificações Repentinas", category: "atrapalha", description: "Disparam micro-respostas de alerta e assustam" },
  { id: "traffic_sirens", label: "Trânsito Intenso, Buzinas ou Obras", category: "atrapalha", description: "Estímulo de alta frequência e imprevisibilidade" },
  { id: "cutlery_dishes", label: "Talheres, Louças e Ecos Metálicos", category: "atrapalha", description: "Ataque acústico pontiagudo que pode causar dor física" },
  { id: "fluorescent_buzz", label: "Zumbido Elétrico de Lâmpadas / Bobinas", category: "atrapalha", description: "Estímulo de alta frequência percebido por mentes sensíveis" },
];

export const SoundEnvironment: React.FC<{ isDark?: boolean }> = ({ isDark = true }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ENV_KEY);
      if (stored) {
        setSelectedIds(JSON.parse(stored));
      } else {
        // Defaults: ANC + Brown noise + Side conversations
        setSelectedIds(["brown_noise", "anc_headphones", "side_conversations", "phone_notifications"]);
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleToggle = (id: string) => {
    const updated = selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id];
    setSelectedIds(updated);
    try {
      localStorage.setItem(STORAGE_ENV_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleReset = () => {
    setSelectedIds(["brown_noise", "anc_headphones", "side_conversations"]);
    try {
      localStorage.setItem(STORAGE_ENV_KEY, JSON.stringify(["brown_noise", "anc_headphones", "side_conversations"]));
    } catch (e) {
      console.warn(e);
    }
  };

  const helpfulSelected = DEFAULT_ENV_ITEMS.filter(item => item.category === "ajuda" && selectedIds.includes(item.id));
  const disruptiveSelected = DEFAULT_ENV_ITEMS.filter(item => item.category === "atrapalha" && selectedIds.includes(item.id));

  // Acoustic Comfort Score calculation
  const helpfulScore = helpfulSelected.length * 20;
  const disruptionImpact = disruptiveSelected.length * 15;
  const comfortScore = Math.max(10, Math.min(100, 50 + helpfulScore - disruptionImpact));

  const handleCopyReport = () => {
    const text = `[NEUROCONECTA - MEU AMBIENTE SONORO & ACOMODAÇÕES]
Data: ${new Date().toLocaleDateString("pt-BR")}
Índice de Conforto Acústico: ${comfortScore}%

SONS E ESTRATÉGIAS QUE ME AJUDAM:
${helpfulSelected.length > 0 ? helpfulSelected.map(i => `• ${i.label}: ${i.description}`).join("\n") : "(Nenhum marcado)"}

SONS E RUÍDOS QUE ME ATRAPALHAM / SOBRECARREGAM:
${disruptiveSelected.length > 0 ? disruptiveSelected.map(i => `• ${i.label}: ${i.description}`).join("\n") : "(Nenhum marcado)"}

ACOMODAÇÕES RECOMENDADAS:
- Permitir uso de fones antirruído durante tarefas de concentração.
- Preferir mensagens por texto ou assíncronas para não interromper com alertas sonoros.
- Oferecer local com menor trânsito de pessoas ou acústica amortecida.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Banner */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-sm"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Volume2 className="w-3.5 h-3.5" />
              Mapeamento Acústico
            </div>
            <h2 className="text-xl font-bold">Meu Ambiente Sonoro: O Que Ajuda vs O Que Atrapalha</h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Identifique os estímulos acústicos que regulam ou sobrecarregam você no dia a dia. Gere um parecer com orientações de acomodação para apresentar no trabalho, escola ou ambiente familiar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copiado!" : "Copiar Relatório Acústico"}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs border border-slate-700 transition"
              title="Restaurar padrão"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Comfort Gauge Bar */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Índice de Conforto Acústico Atual
          </div>
          <div className="text-2xl font-bold text-teal-400 flex items-center gap-2 justify-center sm:justify-start">
            <span>{comfortScore}%</span>
            <span className="text-xs font-normal text-slate-400">
              ({helpfulSelected.length} proteções ativas vs {disruptiveSelected.length} interferências)
            </span>
          </div>
        </div>

        <div className="w-full sm:w-64 bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              comfortScore >= 70 ? "bg-emerald-500" : comfortScore >= 40 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: `${comfortScore}%` }}
          />
        </div>
      </div>

      {/* Two-Column Interactive Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Column 1: Sons que Ajudam */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? "bg-slate-900 border-emerald-950/60" : "bg-white border-emerald-200"
        }`}>
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">Sons &amp; Estratégias que Me Ajudam</h3>
              <p className="text-[11px] text-slate-400">Camadas sonoras que promovem constância e foco</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {DEFAULT_ENV_ITEMS.filter(i => i.category === "ajuda").map((item) => {
              const isChecked = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                    isChecked
                      ? "bg-emerald-950/40 border-emerald-700 text-emerald-200 shadow-sm"
                      : "bg-slate-800/40 hover:bg-slate-800 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                    isChecked ? "bg-emerald-600 border-emerald-500 text-white" : "border-slate-600"
                  }`}>
                    {isChecked && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Sons que Atrapalham */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? "bg-slate-900 border-rose-950/60" : "bg-white border-rose-200"
        }`}>
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <VolumeX className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">Sons que Me Atrapalham ou Sobrecarregam</h3>
              <p className="text-[11px] text-slate-400">Ruídos imprevisíveis que geram fuga de atenção ou dor</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {DEFAULT_ENV_ITEMS.filter(i => i.category === "atrapalha").map((item) => {
              const isChecked = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                    isChecked
                      ? "bg-rose-950/40 border-rose-700 text-rose-200 shadow-sm"
                      : "bg-slate-800/40 hover:bg-slate-800 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                    isChecked ? "bg-rose-600 border-rose-500 text-white" : "border-slate-600"
                  }`}>
                    {isChecked && <AlertTriangle className="w-3 h-3" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
