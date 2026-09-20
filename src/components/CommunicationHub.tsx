import React, { useState } from "react";
import { MessageSquare, Copy, Check, FileText, Share2, HelpCircle, Volume2, Edit3, RotateCcw, Info, Sparkles } from "lucide-react";
import { SOCIAL_SCRIPTS, LITERAL_LANGUAGE_GUIDE } from "../data/scripts";

export const CommunicationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"scripts" | "gerador" | "literal">("scripts");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Custom in-place edited text map
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [useDiagMention, setUseDiagMention] = useState<Record<string, boolean>>({});

  // Accommodation Generator state
  const [recipient, setRecipient] = useState("Gestor(a) / Coordenação");
  const [requestType, setRequestType] = useState("fones");
  const [customDetail, setCustomDetail] = useState("");
  const [includeDiagnosticDisclosure, setIncludeDiagnosticDisclosure] = useState(false);
  const [generatedText, setGeneratedText] = useState("");

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (title: string, text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `NeuroConecta • ${title}`,
          text: text,
        });
      } catch {
        // Fallback to copy if user closed share sheet
      }
    } else {
      handleCopy(id, text);
    }
  };

  const handleSpeak = (id: string, text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 0.95;
      utterance.onstart = () => setSpeakingId(id);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Seu navegador não suporta a síntese de voz nativa.");
    }
  };

  const getEffectiveScriptText = (sc: typeof SOCIAL_SCRIPTS[0]) => {
    if (editedTexts[sc.id] !== undefined) {
      return editedTexts[sc.id];
    }
    if (useDiagMention[sc.id] && sc.diagnosticOptionalText) {
      return sc.diagnosticOptionalText;
    }
    return sc.scriptText;
  };

  const handleGenerateAccommodation = () => {
    let detailText = "";
    if (requestType === "fones") {
      detailText = "a autorização para utilizar fones com abafamento ou cancelamento de ruído durante momentos de concentração individual para reduzir o estresse sonoro do ambiente.";
    } else if (requestType === "instrucoes_escritas") {
      detailText = "que as instruções de projetos, tarefas complexas e prioridades de entrega sejam fornecidas também por escrito (via e-mail ou mensagem), garantindo alinhamento claro de expectativas.";
    } else if (requestType === "local_tranquilo") {
      detailText = "a possibilidade de alocação em um posto de trabalho mais silencioso ou flexibilidade de pausas rápidas em ambiente calmo quando necessário.";
    } else {
      detailText = customDetail || "ajustes funcionais razoáveis no fluxo e ambiente de trabalho/estudo para otimizar meu foco e bem-estar.";
    }

    const framing = includeDiagnosticDisclosure
      ? "Como pessoa neurodivergente, funciono de maneira mais focada e eficiente com certas estruturações de apoio funcional."
      : "Para otimizar meu rendimento, foco e qualidade de entrega em minhas tarefas cotidianas:";

    const fullTemplate = `Prezado(a) ${recipient || "Equipe / Coordenação"},

Gostaria de solicitar um ajuste funcional razoável no ambiente de estudo/trabalho para apoiar meu rendimento e bem-estar.

${framing}
Solicito gentilmente:
• ${detailText}

Essa simples adaptação me ajudará a manter alta previsibilidade, concentração e qualidade de entregas.

Permaneço à disposição para alinharmos os detalhes práticos.

Atenciosamente,`;

    setGeneratedText(fullTemplate);
  };

  const filteredScripts =
    selectedCategory === "todos"
      ? SOCIAL_SCRIPTS
      : SOCIAL_SCRIPTS.filter((s) => s.category === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-teal-400" />
            Comunicação & Scripts Sociais
          </h1>
          <p className="text-sm text-slate-400">
            Modelos de mensagens prontos para o dia a dia, gerador de acomodações e esclarecimento de expressões figuradas.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-slate-800 pb-2">
        {[
          { id: "scripts", label: "💬 Biblioteca de Scripts" },
          { id: "gerador", label: "✉️ Gerador de Acomodações" },
          { id: "literal", label: "📖 Guia do Sentido Literal" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-teal-950 text-teal-200 border border-teal-700"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Scripts Library */}
      {activeTab === "scripts" && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
            {[
              { id: "todos", label: "Todos" },
              { id: "tdah_organizacao", label: "⚡ Organização, Atenção & TDAH" },
              { id: "trabalho", label: "Trabalho" },
              { id: "saude", label: "Saúde / Médicos" },
              { id: "familia", label: "Família" },
              { id: "social", label: "Eventos Sociais" },
              { id: "acomodacoes", label: "Acomodações" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-teal-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Educational / Anti-Stereotype Banner for TDAH & Executive Function Scripts */}
          {selectedCategory === "tdah_organizacao" && (
            <div className="p-4 bg-teal-950/70 border border-teal-800/80 rounded-2xl flex items-start gap-3 text-xs text-teal-200 shadow-sm animate-fadeIn">
              <Sparkles className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-teal-100">Recurso Funcional para Organização & Foco</p>
                <p className="text-teal-300 leading-relaxed">
                  Este recurso pode ser útil para pessoas que se beneficiam de instruções estruturadas, prioridades claras e redução de distrações. Não é necessário diagnóstico formal para utilizar estes modelos. O padrão é sempre funcional e sem patologização.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScripts.map((sc) => {
              const currentText = getEffectiveScriptText(sc);
              const isEditing = editingId === sc.id;
              const hasCustomEdit = editedTexts[sc.id] !== undefined;

              return (
                <div
                  key={sc.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-2.5 py-0.5 rounded-md border border-teal-800">
                        {sc.category === "tdah_organizacao" ? "Atenção & TDAH" : sc.category}
                      </span>

                      {/* Optional Diagnostic Disclosure Toggle (User Conscious Choice) */}
                      {sc.diagnosticOptionalText && (
                        <button
                          type="button"
                          onClick={() => {
                            setUseDiagMention((prev) => ({ ...prev, [sc.id]: !prev[sc.id] }));
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                            useDiagMention[sc.id]
                              ? "bg-amber-950 text-amber-200 border-amber-700 font-semibold"
                              : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
                          }`}
                          title="Opção consciente: por padrão o texto é funcional e sem menção a diagnóstico"
                        >
                          {useDiagMention[sc.id] ? "✓ Com menção explícita de TDAH" : "+ Mencionar TDAH (opcional)"}
                        </button>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-100 text-base">{sc.title}</h3>
                    <p className="text-xs text-slate-400">{sc.description}</p>

                    {/* Script text or Inline Editable area */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={5}
                          value={currentText}
                          onChange={(e) => setEditedTexts((prev) => ({ ...prev, [sc.id]: e.target.value }))}
                          className="w-full p-3 bg-slate-950 border border-teal-600 rounded-xl text-xs text-slate-100 font-sans leading-relaxed focus:outline-none"
                          placeholder="Personalize o texto do seu script conforme sua necessidade..."
                        />
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-teal-400">Edição personalizada ativa</span>
                          {hasCustomEdit && (
                            <button
                              type="button"
                              onClick={() => {
                                const copy = { ...editedTexts };
                                delete copy[sc.id];
                                setEditedTexts(copy);
                              }}
                              className="text-slate-400 hover:text-rose-400 flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" /> Restaurar padrão
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap relative group">
                        {currentText}
                        {hasCustomEdit && (
                          <span className="absolute top-2 right-2 text-[9px] font-bold uppercase bg-teal-950 text-teal-300 px-1.5 py-0.5 rounded border border-teal-800">
                            Editado
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tips */}
                    {sc.tips && sc.tips.length > 0 && (
                      <div className="text-[11px] text-slate-400 space-y-1">
                        {sc.tips.map((tip, idx) => (
                          <p key={idx} className="flex items-start gap-1.5">
                            <span className="text-teal-400">•</span>
                            <span>{tip}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions: Copiar, Editar, Ouvir Áudio, Compartilhar */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(sc.id, currentText)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        {copiedId === sc.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === sc.id ? "Copiado!" : "Copiar"}</span>
                      </button>

                      <button
                        onClick={() => setEditingId(isEditing ? null : sc.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                          isEditing
                            ? "bg-teal-600 text-white"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditing ? "Concluir" : "Editar"}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSpeak(sc.id, currentText)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                          speakingId === sc.id
                            ? "bg-teal-600 text-white animate-pulse"
                            : "bg-slate-800 hover:bg-slate-700 text-teal-300"
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{speakingId === sc.id ? "Falando..." : "Ouvir"}</span>
                      </button>

                      <button
                        onClick={() => handleShare(sc.title, currentText, sc.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Compartilhar script"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Compartilhar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Accommodation Request Generator */}
      {activeTab === "gerador" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100">Gerador de Pedido de Acomodação</h2>
            <p className="text-xs text-slate-400">
              Monte uma mensagem formal e educada para solicitar fones, instruções por escrito ou flexibilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Para quem é a mensagem?</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Ex: Prof. Silva, Gerente de RH, Supervisor..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Qual acomodação você precisa?</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100"
              >
                <option value="fones">Uso de fones com cancelamento de ruído</option>
                <option value="instrucoes_escritas">Instruções de tarefas enviadas por escrito</option>
                <option value="local_tranquilo">Trabalho em mesa mais silenciosa / Híbrido</option>
                <option value="outro">Outro pedido personalizado</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2.5 text-xs text-slate-300">
            <input
              type="checkbox"
              id="includeDiag"
              checked={includeDiagnosticDisclosure}
              onChange={(e) => setIncludeDiagnosticDisclosure(e.target.checked)}
              className="rounded border-slate-700 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="includeDiag" className="cursor-pointer">
              Mencionar neurodivergência explicitamente no texto (opcional — por padrão, foca apenas na necessidade funcional prática).
            </label>
          </div>

          <button
            onClick={handleGenerateAccommodation}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar Modelo de Texto</span>
          </button>

          {generatedText && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Texto Gerado (Editável):</h4>
                <span className="text-[11px] text-slate-400">Você pode ajustar o texto diretamente abaixo</span>
              </div>
              <textarea
                rows={10}
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 font-sans leading-relaxed focus:border-teal-500 focus:outline-none"
              />

              <button
                onClick={() => handleCopy("gen-acc", generatedText)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedId === "gen-acc" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === "gen-acc" ? "Copiado!" : "Copiar Texto"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Literal Meaning Guide */}
      {activeTab === "literal" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100">Guia de Expressões Figuradas vs. Sentido Literal</h2>
            <p className="text-xs text-slate-400">
              Se você costuma interpretar metáforas de forma literal, consulte o significado real das expressões mais comuns do português:
            </p>
          </div>

          <div className="space-y-3">
            {LITERAL_LANGUAGE_GUIDE.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <h3 className="font-bold text-teal-300 text-sm">💬 Expressão: "{item.expression}"</h3>
                <p className="text-xs text-slate-200">
                  🎯 <strong>O que realmente significa:</strong> {item.literalMeaning}
                </p>
                <p className="text-xs text-slate-400 italic">
                  💡 <strong>Nota:</strong> {item.avoid}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
