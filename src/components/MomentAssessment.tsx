import React, { useState, useEffect } from "react";
import {
  Zap,
  Volume2,
  Brain,
  MessageSquare,
  Activity,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Save,
  Clock,
  ShieldCheck,
  Headphones,
  Compass,
  AlertTriangle,
  ChevronRight,
  Trash2,
  Copy,
  Check
} from "lucide-react";

export interface FunctionalMomentResult {
  id: string;
  timestamp: string;
  timeStr: string;
  energy: "alta" | "estavel" | "baixa" | "esgotada";
  sensory: "calmo" | "moderado" | "intenso" | "critico";
  focus: "fluido" | "disperso" | "paralisia" | "nevoa";
  social: "sociavel" | "assincrono" | "pouca_bateria" | "isolamento";
  physical: "relaxado" | "tensao_leve" | "agitacao_stimming" | "dor_exaustao";
  patternTitle: string;
  immediateAction: string;
  whatToDo: string[];
  whatToAvoid: string[];
  recommendedSoundType?: string;
}

interface MomentAssessmentProps {
  onNavigateToChat?: (prompt?: string, role?: string) => void;
  onNavigateToSounds?: () => void;
  onNavigateToTab?: (tab: any) => void;
  isDark?: boolean;
}

const STORAGE_KEY = "neuroconecta_moment_assessments_v1";

export const MomentAssessment: React.FC<MomentAssessmentProps> = ({
  onNavigateToChat,
  onNavigateToSounds,
  onNavigateToTab,
  isDark = true,
}) => {
  // Dimension selections
  const [energy, setEnergy] = useState<"alta" | "estavel" | "baixa" | "esgotada">("estavel");
  const [sensory, setSensory] = useState<"calmo" | "moderado" | "intenso" | "critico">("moderado");
  const [focus, setFocus] = useState<"fluido" | "disperso" | "paralisia" | "nevoa">("disperso");
  const [social, setSocial] = useState<"sociavel" | "assincrono" | "pouca_bateria" | "isolamento">("assincrono");
  const [physical, setPhysical] = useState<"relaxado" | "tensao_leve" | "agitacao_stimming" | "dor_exaustao">("tensao_leve");

  const [currentResult, setCurrentResult] = useState<FunctionalMomentResult | null>(null);
  const [savedRecords, setSavedRecords] = useState<FunctionalMomentResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [planLinkedMessage, setPlanLinkedMessage] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedRecords(parsed);
        }
      }
    } catch (e) {
      console.warn("Erro ao carregar histórico de autoavaliações do momento", e);
    }
  }, []);

  // Rules Engine: Compute Functional Assessment (100% Local, Non-Diagnostic)
  const computeFunctionalParecer = (): FunctionalMomentResult => {
    let patternTitle = "Estado de Equilíbrio & Manutenção de Rotina";
    let immediateAction = "Defina 1 prioridade leve para o próximo bloco de 20 minutos e faça uma pausa sensorial ao concluir.";
    let whatToDo: string[] = [
      "Trabalhar em ritmo constante sem pressa.",
      "Manter água fresca por perto.",
      "Anotar as ideias no papel para não sobrecarregar a memória de trabalho."
    ];
    let whatToAvoid: string[] = [
      "Não acumular muitas tarefas simultâneas.",
      "Evitar pular refeições ou pausas programadas."
    ];
    let recommendedSoundType = "preset-alpha";

    // Scenario 1: Critical Sensory Overload or Extreme Exhaustion
    if (sensory === "critico" || energy === "esgotada") {
      patternTitle = "Sobrecarga Sensorial / Esgotamento — Modo Proteção Imediata";
      immediateAction = "Vá para um espaço silencioso, diminua as luzes e coloque fones com cancelamento de ruído agora.";
      whatToDo = [
        "Suspender imediatamente qualquer cobrança executiva nos próximos 30 minutos.",
        "Fazer respirações suaves no seu ritmo ou fechar os olhos com ruído marrom contínuo.",
        "Comunique pessoas próximas por escrito caso precise de silêncio e espaço.",
        "Hidratar-se com pequenos goles de água fresca."
      ];
      whatToAvoid = [
        "Não tome nenhuma decisão importante ou responda a mensagens complexas agora.",
        "Evite luzes brancas, telas brilhantes ou ambientes com muitas pessoas conversando.",
        "Não se sinta culpado(a) por pausar: sua bateria biológica precisa de recomposição."
      ];
      recommendedSoundType = "preset-brown";
    }
    // Scenario 2: Executive Paralysis / Task Block
    else if (focus === "paralisia") {
      patternTitle = "Bloqueio Executivo / Paralisia de Início — Protocolo Micro-Ação";
      immediateAction = "Não tente fazer o projeto todo. Faça apenas a 'Ação Zero' de 2 minutos (ex: apenas abrir o arquivo ou colocar o calçado).";
      whatToDo = [
        "Adotar o 'Micro-Início': execute uma ação ridícula de tão simples sem se comprometer a terminar.",
        "Usar um cronômetro curto de 10 minutos sem cobrança de perfeição.",
        "Fazer uma pausa de 3 minutos logo após os 10 minutos.",
        "Pedir instruções por escrito caso a tarefa pareça ambígua."
      ];
      whatToAvoid = [
        "Não olhe para a lista completa de tarefas de uma vez só.",
        "Evite ficar julgando o próprio ritmo — a paralisia é sobrecarga neurológica, não preguiça.",
        "Evite começar por tarefas difíceis e desconhecidas."
      ];
      recommendedSoundType = "preset-rain";
    }
    // Scenario 3: High Sensory Noise with Moderate Energy
    else if (sensory === "intenso" || physical === "agitacao_stimming") {
      patternTitle = "Ambiente Desfavorável — Protocolo de Barreira Sensorial e Stimming";
      immediateAction = "Crie uma camada de proteção acústica (fones ou ruído marrom) e permita stimmings confortáveis para autorregular.";
      whatToDo = [
        "Utilizar objetos de stimming, balançar suavemente ou alongar as mãos.",
        "Ajustar a iluminação do local ou usar óculos escuros / boné se a luz incomodar.",
        "Solicitar verbalmente ou por escrito que diminuam o volume do ambiente, se possível.",
        "Fazer pausas de 2 minutos a cada 25 minutos."
      ];
      whatToAvoid = [
        "Não reprima movimentos regulatórios (stimming) se eles te ajudam a concentrar.",
        "Evite permanecer em conversas paralelas concorrentes sem proteção auditiva."
      ];
      recommendedSoundType = "preset-brown";
    }
    // Scenario 4: Brain Fog with Low Energy
    else if (energy === "baixa" || focus === "nevoa") {
      patternTitle = "Baixa Energia & Névoa Mental — Modo Economia Executiva";
      immediateAction = "Escolha apenas 1 tarefa indispensável para hoje. Tudo o que não for urgente pode e deve ser reagendado.";
      whatToDo = [
        "Adotar a 'Regra do 1 Item': terminar uma única coisa já é uma vitória no dia.",
        "Optar por comunicação assíncrona (áudio ou texto curto) em vez de chamadas.",
        "Descansar a visão e fazer uma caminhada leve ou alongamento no solo.",
        "Garantir uma refeição nutritiva e beber água."
      ];
      whatToAvoid = [
        "Não assuma novos compromissos sociais ou profissionais hoje.",
        "Não tente compensar o ritmo forçando horas extras de trabalho exaustivo."
      ];
      recommendedSoundType = "preset-432";
    }
    // Scenario 5: High Energy & Good Focus
    else if (energy === "alta" && focus === "fluido") {
      patternTitle = "Janela de Alta Produtividade — Ritmo Sustentável";
      immediateAction = "Aproveite a boa energia para iniciar seu objetivo mais importante, mas programe pausas para não esgotar a bateria mais tarde.";
      whatToDo = [
        "Direcionar o foco para aquela atividade que exige maior clareza cognitiva.",
        "Colocar o som de ondas alfa (10 Hz) para manter o estado de fluxo contínuo.",
        "Deixar lembrete para pausar a cada 40 minutos para hidratação e esticar o corpo."
      ];
      whatToAvoid = [
        "Não ignore a fome ou a sede durante o hiperfoco.",
        "Evite iniciar três projetos diferentes ao mesmo tempo; termine um antes de saltar para o próximo."
      ];
      recommendedSoundType = "preset-alpha";
    }

    const now = new Date();
    return {
      id: `moment-${Date.now()}`,
      timestamp: now.toISOString(),
      timeStr: `${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      energy,
      sensory,
      focus,
      social,
      physical,
      patternTitle,
      immediateAction,
      whatToDo,
      whatToAvoid,
      recommendedSoundType,
    };
  };

  const handleGenerateAssessment = () => {
    const res = computeFunctionalParecer();
    setCurrentResult(res);
    setJustSaved(false);
  };

  const handleSaveResult = () => {
    if (!currentResult) return;
    const updated = [currentResult, ...savedRecords.filter(r => r.id !== currentResult.id)].slice(0, 30);
    setSavedRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Falha ao salvar no localStorage", e);
    }
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = savedRecords.filter(r => r.id !== id);
    setSavedRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Falha ao salvar", e);
    }
  };

  const handleCopyText = (res: FunctionalMomentResult) => {
    const text = `[NEUROCONECTA - AUTOAVALIAÇÃO FUNCIONAL DO MOMENTO]
Registro: ${res.timeStr}
Padrão Identificado: ${res.patternTitle}

ESTADO ATUAL:
- Energia Vital: ${res.energy.toUpperCase()}
- Ambiente & Carga Sensorial: ${res.sensory.toUpperCase()}
- Foco & Função Executiva: ${res.focus.toUpperCase()}
- Disponibilidade Social: ${res.social.toUpperCase()}
- Tensão Corporal: ${res.physical.toUpperCase()}

AÇÃO IMEDIATA RECOMENDADA:
${res.immediateAction}

O QUE FAZER AGORA:
${res.whatToDo.map(i => `• ${i}`).join("\n")}

O QUE EVITAR AGORA:
${res.whatToAvoid.map(i => `• ${i}`).join("\n")}

*Aviso: Avaliação estritamente funcional e neuroafirmativa para autorregulação diária. Não constitui diagnóstico clínico.*`;

    navigator.clipboard.writeText(text);
    setCopiedId(res.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendToChat = (res: FunctionalMomentResult) => {
    const prompt = `Acabei de realizar a minha Autoavaliação Funcional do Momento no NeuroConecta:
- Padrão: ${res.patternTitle}
- Minha energia está: ${res.energy}
- Meu ambiente está: ${res.sensory}
- Meu foco executivo está: ${res.focus}
- Minha bateria social está: ${res.social}
- Meu corpo está com: ${res.physical}

A recomendação imediata foi: "${res.immediateAction}".

Como você pode me apoiar a estruturar meus próximos passos práticos de forma leve e sem sobrecarga?`;

    onNavigateToChat?.(prompt, "organizacao_rotina");
  };

  const handleLinkToFunctionalPlan = (res: FunctionalMomentResult) => {
    try {
      const planKey = "neuroconecta_functional_plan_active";
      const existingRaw = localStorage.getItem(planKey);
      const plan = existingRaw ? JSON.parse(existingRaw) : {
        subjectId: "user-local",
        sensoryAccommodations: [],
        routineGuidelines: [],
        communicationPreferences: [],
        updatedAt: new Date().toISOString()
      };
      plan.sensoryAccommodations = Array.from(new Set([...(plan.sensoryAccommodations || []), ...res.whatToDo]));
      plan.updatedAt = new Date().toISOString();
      localStorage.setItem(planKey, JSON.stringify(plan));
      setPlanLinkedMessage("Diretrizes vinculadas ao seu Plano Funcional de Apoio pessoal. (Garantia: O PEI escolar nunca é alterado automaticamente e requer revisão humana).");
      setTimeout(() => setPlanLinkedMessage(null), 6000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Intro Header */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-sm"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              100% Funcional & Não Diagnóstica
            </div>
            <h2 className="text-xl font-bold">Autoavaliação Funcional do Momento</h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Mapeie em menos de 1 minuto como estão sua energia, seu ambiente sonoro e seu foco executivo agora. Receba orientações locais baseadas em regras práticas para proteger seu ritmo, sem qualquer dependência de IA.
            </p>
          </div>
          <div className="text-xs bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/80 text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Sem rótulos clínicos. Foco em acomodação e bem-estar.</span>
          </div>
        </div>

        {/* Safeguard Guarantee Banner: AUTO-SAFE-01 & SHARE-01 */}
        <div className="mt-4 p-3 bg-teal-950/40 border border-teal-800/60 rounded-xl flex items-start sm:items-center gap-2.5 text-xs text-teal-200">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-relaxed">
            <strong>Garantia de Integridade &amp; Privacidade:</strong> A autoavaliação é estritamente de uso pessoal do usuário. Ela <em>nunca</em> altera o Plano de Ensino Individualizado (PEI) escolar automaticamente e não pode ser visualizada por professores ou terceiros sem uma Concessão de Compartilhamento (ShareGrant) explícita e voluntária.
          </span>
        </div>
      </div>

      {/* Interactive Form: 5 Dimensions */}
      <div className={`p-6 rounded-2xl border space-y-6 ${
        isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"
      }`}>
        
        {/* Dimension 1: Energy */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>1. Nível de Energia Vital Agora</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { id: "alta", title: "⚡ Alta Disposição", desc: "Clareza e capacidade para tarefas complexas" },
              { id: "estavel", title: "🔋 Estável / Moderada", desc: "Ritmo constante para atividades habituais" },
              { id: "baixa", title: "🪫 Baixa / Fadiga", desc: "Cansaço perceptível, requer economia executiva" },
              { id: "esgotada", title: "🔌 Bateria no Fim", desc: "Sobrecarga acumulada, descanso indispensável" }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setEnergy(opt.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  energy === opt.id
                    ? "bg-teal-600/20 border-teal-500 ring-2 ring-teal-500/30 text-teal-200 font-semibold"
                    : "bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300"
                }`}
              >
                <div className="text-xs font-bold">{opt.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dimension 2: Sensory Load */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>2. Ambiente &amp; Carga Sensorial</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { id: "calmo", title: "🌿 Confortável / Calmo", desc: "Pouco ruído, iluminação agradável" },
              { id: "moderado", title: "⚠️ Estímulos Moderados", desc: "Ruídos de fundo toleráveis" },
              { id: "intenso", title: "🔊 Ambiente Intenso", desc: "Muitos ruídos, luz forte ou pessoas falando" },
              { id: "critico", title: "🚨 Sobrecarga Crítica", desc: "Caos sensorial, dor de cabeça ou mal-estar" }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSensory(opt.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  sensory === opt.id
                    ? "bg-cyan-600/20 border-cyan-500 ring-2 ring-cyan-500/30 text-cyan-200 font-semibold"
                    : "bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300"
                }`}
              >
                <div className="text-xs font-bold">{opt.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dimension 3: Focus & Executive Function */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>3. Foco Mental &amp; Função Executiva</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { id: "fluido", title: "🎯 Focado e Fluido", desc: "Conseguindo iniciar e manter a atenção" },
              { id: "disperso", title: "🌪️ Disperso / Mente Acelerada", desc: "Muitas ideias paralelas, difícil aterrar" },
              { id: "paralisia", title: "🧱 Paralisia de Início", desc: "Quero começar, mas o cérebro trava" },
              { id: "nevoa", title: "🌫️ Névoa Mental", desc: "Dificuldade de processar informações básicas" }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFocus(opt.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  focus === opt.id
                    ? "bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/30 text-purple-200 font-semibold"
                    : "bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300"
                }`}
              >
                <div className="text-xs font-bold">{opt.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dimension 4: Social Battery */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>4. Bateria Social &amp; Interação</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { id: "sociavel", title: "💬 Receptivo(a)", desc: "Aberto(a) para conversas presenciais ou reuniões" },
              { id: "assincrono", title: "✉️ Apenas Assíncrono", desc: "Prefiro responder por texto com calma" },
              { id: "pouca_bateria", title: "🛑 Pouca Bateria Social", desc: "Evitando interações que não sejam urgentes" },
              { id: "isolamento", title: "🔒 Modo Silencioso Protetor", desc: "Necessidade urgente de isolamento e silêncio" }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSocial(opt.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  social === opt.id
                    ? "bg-emerald-600/20 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-200 font-semibold"
                    : "bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300"
                }`}
              >
                <div className="text-xs font-bold">{opt.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dimension 5: Physical Tension & Somatic State */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <span>5. Estado Corporal &amp; Tensão Física</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { id: "relaxado", title: "😌 Corpo Relaxado", desc: "Postura confortável, sem tensão evidente" },
              { id: "tensao_leve", title: "😬 Tensão Muscular", desc: "Mandíbula ou ombros contraídos" },
              { id: "agitacao_stimming", title: "🌀 Inquietude / Stimming", desc: "Necessidade de movimentar pernas/mãos" },
              { id: "dor_exaustao", title: "😣 Dor / Exaustão Física", desc: "Sensação de peso no corpo ou enxaqueca" }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPhysical(opt.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  physical === opt.id
                    ? "bg-rose-600/20 border-rose-500 ring-2 ring-rose-500/30 text-rose-200 font-semibold"
                    : "bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300"
                }`}
              >
                <div className="text-xs font-bold">{opt.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={handleGenerateAssessment}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Gerar Parecer Funcional do Momento</span>
          </button>
        </div>

      </div>

      {/* Generated Result Card */}
      {currentResult && (
        <div className={`p-6 rounded-2xl border space-y-6 animate-fadeIn ${
          isDark ? "bg-slate-900 border-teal-500/40 shadow-xl" : "bg-white border-teal-300 shadow-lg"
        }`}>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-semibold text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Parecer Funcional Gerado Localmente
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-1">{currentResult.patternTitle}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Calculado às {currentResult.timeStr}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveResult}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  justSaved
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                }`}
              >
                {justSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{justSaved ? "Salvo no Histórico!" : "Salvar Registro"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyText(currentResult)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
              >
                {copiedId === currentResult.id ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Parecer</span>
              </button>
            </div>
          </div>

          {/* Immediate Action Highlight */}
          <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-800/80 text-slate-200 space-y-1">
            <div className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Ação Prioritária para os Próximos 10 Minutos:
            </div>
            <p className="text-sm leading-relaxed font-medium text-slate-100">
              {currentResult.immediateAction}
            </p>
          </div>

          {/* What to do & What to avoid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* What to do */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/50 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Diretrizes Recomendadas (O Que Fazer):
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {currentResult.whatToDo.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What to avoid */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/50 space-y-2">
              <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Limites Protetivos (O Que Evitar Agora):
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {currentResult.whatToAvoid.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Linked Plan Confirmation Feedback */}
          {planLinkedMessage && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-semibold flex items-start sm:items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
              <span>{planLinkedMessage}</span>
            </div>
          )}

          {/* Integrated Next Steps */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                Vincular a Apoios Funcionais Práticos:
              </span>
              <span className="text-[11px] text-slate-400">
                Ações imediatas para colocar o parecer em prática
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleLinkToFunctionalPlan(currentResult)}
                className="px-3.5 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm border border-teal-700"
                title="Incorporar as diretrizes desta autoavaliação ao seu Plano Funcional de Apoio pessoal (sem alterar o PEI escolar)"
              >
                <Save className="w-3.5 h-3.5 text-teal-300" />
                <span>Incorporar ao Meu Plano Funcional</span>
              </button>

              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab("rotina")}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  title="Aplicar bloco de foco ou descanso na sua rotina visual"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aplicar na Rotina Visual</span>
                </button>
              )}

              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab("comunicacao")}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  title="Usar pranchas de comunicação alternativa para avisar sobre sua energia"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span>Comunicação AAC</span>
                </button>
              )}

              {onNavigateToSounds && (
                <button
                  type="button"
                  onClick={onNavigateToSounds}
                  className="px-3.5 py-2 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Headphones className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Som &amp; Autorregulação</span>
                </button>
              )}

              {onNavigateToChat && (
                <button
                  type="button"
                  onClick={() => handleSendToChat(currentResult)}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Levar Parecer ao Copiloto IA</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Saved Records History */}
      {savedRecords.length > 0 && (
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Histórico de Autoavaliações do Momento ({savedRecords.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Salvos localmente no seu dispositivo</span>
          </div>

          <div className="space-y-2.5">
            {savedRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{rec.patternTitle}</span>
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">{rec.timeStr}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-1">{rec.immediateAction}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyText(rec)}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                    title="Copiar texto"
                  >
                    {copiedId === rec.id ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendToChat(rec)}
                    className="px-2.5 py-1 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 border border-teal-500/30 font-semibold text-[11px] flex items-center gap-1 transition"
                  >
                    <Sparkles className="w-3 h-3" /> Chat
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteRecord(rec.id)}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition"
                    title="Excluir registro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
