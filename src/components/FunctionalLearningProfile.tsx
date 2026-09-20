import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Printer,
  Copy,
  Check,
  Lightbulb,
  ShieldCheck,
  AlertCircle,
  Brain,
  MessageSquare,
  Eye,
  Heart,
  Ban,
  CheckCircle2,
  FolderPlus,
} from "lucide-react";

export interface FunctionalProfileData {
  id: string;
  studentName: string;
  gradeOrClass: string;
  instructionPreferences: string[];
  instructionNotes: string;
  expressionModalities: string[];
  expressionNotes: string;
  helpfulResources: string[];
  engagementInterests: string;
  schoolBarriers: string[];
  whatWorkedHistory: { date: string; note: string }[];
  whatDidNotWork: { date: string; note: string }[];
  updatedAt: string;
}

const DEFAULT_INSTRUCTION_PREFS = [
  "Passo a passo fracionado e visível no quadro",
  "Apoio visual com imagens e esquemas concretos",
  "Demonstração prática e modelagem prévia antes da tarefa",
  "Linguagem direta e comandos curtos (sem metáforas ambíguas)",
  "Previsibilidade da rotina logo na acolhida",
  "Verificação de entendimento sem constrangimento público",
];

const DEFAULT_EXPRESSION_MODS = [
  "Texto convencional escrito ou digitado",
  "Gravação de áudio ou relato oral guiado",
  "Sequência de cartões ou imagens ordenadas",
  "Histórias em quadrinhos ou tirinhas ilustradas",
  "Mapas conceituais e esquemas visuais",
  "Comunicação Aumentativa e Alternativa (CAA)",
  "Respostas de múltipla escolha com opções visuais",
];

const DEFAULT_HELPFUL_RESOURCES = [
  "Quadro de rotina visual previsível",
  "Uso de abafador auricular em momentos com ruído elevado",
  "Sinal discreto para pausa de descompressão sensorial",
  "Tempo estendido (50% a mais) em avaliações e tarefas individuais",
  "Trabalho em duplas estruturadas com papéis definidos",
  "Cantinho da calma acessível quando sentir sobrecarga",
  "Material manipulável ou cartões móveis",
];

const DEFAULT_BARRIERS = [
  "Ruído sonoro elevado (recreio, pátio, conversas múltiplas)",
  "Sobrecarga visual (luzes fluorescentes, quadros desorganizados)",
  "Cópia exaustiva e demorada do quadro",
  "Cobrança de resposta oral instantânea sob pressão coletiva",
  "Mudanças bruscas de horários ou professores sem aviso prévio",
  "Ambientes com muita movimentação ou portas abertas",
];

export const FunctionalLearningProfile: React.FC<{
  studentName?: string;
  isDark?: boolean;
}> = ({ studentName = "Estudante", isDark = true }) => {
  const [profile, setProfile] = useState<FunctionalProfileData>(() => {
    try {
      const stored = localStorage.getItem(`neuroconecta_profile_${studentName}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {
      id: `flp-${Date.now()}`,
      studentName,
      gradeOrClass: "Ensino Fundamental II",
      instructionPreferences: [
        "Passo a passo fracionado e visível no quadro",
        "Apoio visual com imagens e esquemas concretos",
      ],
      instructionNotes: "Prefere orientações divididas em 2 a 3 passos consecutivos.",
      expressionModalities: [
        "Texto convencional escrito ou digitado",
        "Mapas conceituais e esquemas visuais",
        "Gravação de áudio ou relato oral guiado",
      ],
      expressionNotes: "Apresenta excelente síntese quando pode expressar-se por esquemas visuais ou gravação de voz.",
      helpfulResources: [
        "Quadro de rotina visual previsível",
        "Uso de abafador auricular em momentos com ruído elevado",
        "Sinal discreto para pausa de descompressão sensorial",
      ],
      engagementInterests: "Tecnologia, astronomia, programação em blocos e histórias em quadrinhos.",
      schoolBarriers: [
        "Ruído sonoro elevado (recreio, pátio, conversas múltiplas)",
        "Cópia exaustiva e demorada do quadro",
      ],
      whatWorkedHistory: [
        {
          date: "14/08",
          note: "Apresentação em dupla usando slides ilustrados gerou engajamento pleno sem ansiedade.",
        },
        {
          date: "28/08",
          note: "Roteiro de 4 etapas escrito no canto da lousa evitou interrupções na atividade de matemática.",
        },
      ],
      whatDidNotWork: [
        {
          date: "05/08",
          note: "Cópia direta de texto longo da lousa gerou estresse motor e sobrecarga; preferir folha impressa.",
        },
      ],
      updatedAt: new Date().toLocaleDateString("pt-BR"),
    };
  });

  const [copied, setCopied] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  const [newWhatWorked, setNewWhatWorked] = useState("");
  const [newWhatDidNotWork, setNewWhatDidNotWork] = useState("");

  const toggleArrayItem = (key: keyof Pick<FunctionalProfileData, "instructionPreferences" | "expressionModalities" | "helpfulResources" | "schoolBarriers">, item: string) => {
    setProfile((prev) => {
      const arr = prev[key] as string[];
      const exists = arr.includes(item);
      const updated = exists ? arr.filter((x) => x !== item) : [...arr, item];
      return { ...prev, [key]: updated };
    });
  };

  const handleSave = () => {
    const updated = {
      ...profile,
      updatedAt: new Date().toLocaleDateString("pt-BR"),
    };
    setProfile(updated);
    try {
      localStorage.setItem(`neuroconecta_profile_${studentName}`, JSON.stringify(updated));
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWhatWorked = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhatWorked.trim()) return;
    const entry = {
      date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      note: newWhatWorked.trim(),
    };
    setProfile((prev) => ({
      ...prev,
      whatWorkedHistory: [entry, ...prev.whatWorkedHistory],
    }));
    setNewWhatWorked("");
  };

  const handleAddWhatDidNotWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhatDidNotWork.trim()) return;
    const entry = {
      date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      note: newWhatDidNotWork.trim(),
    };
    setProfile((prev) => ({
      ...prev,
      whatDidNotWork: [entry, ...prev.whatDidNotWork],
    }));
    setNewWhatDidNotWork("");
  };

  const handleCopyProfile = () => {
    const text = `=====================================================
PERFIL FUNCIONAL DE APRENDIZAGEM E APOIO PEDAGÓGICO
NEUROCONECTA • SUPORTE À INCLUSÃO ESCOLAR
(Documento Pedagógico - Sem Centralidade no Diagnóstico)
=====================================================
Estudante: ${profile.studentName}
Turma / Ano: ${profile.gradeOrClass}
Data de Atualização: ${profile.updatedAt}

1. PREFERÊNCIAS DE RECEPÇÃO DE INSTRUÇÃO:
${profile.instructionPreferences.map((p) => `• ${p}`).join("\n")}
Anotações: ${profile.instructionNotes || "N/A"}

2. FORMAS DE EXPRESSÃO E PARTICIPAÇÃO (DUA):
${profile.expressionModalities.map((m) => `• ${m}`).join("\n")}
Anotações: ${profile.expressionNotes || "N/A"}

3. RECURSOS E ACOMODAÇÕES QUE AJUDAM:
${profile.helpfulResources.map((r) => `• ${r}`).join("\n")}

4. ENGAJADORES PEDAGÓGICOS & INTERESSES:
${profile.engagementInterests || "Não informados"}
(Aviso: Recursos para mediação pedagógica; não geram inferência diagnóstica)

5. BARREIRAS OBSERVADAS NO AMBIENTE ESCOLAR:
${profile.schoolBarriers.map((b) => `• ${b}`).join("\n")}

6. O QUE FUNCIONOU (REGISTRO CUMULATIVO):
${profile.whatWorkedHistory.map((h) => `[${h.date}] ${h.note}`).join("\n") || "Nenhum registro ainda"}

7. O QUE NÃO FUNCIONOU (PARA EVITAR REPETIÇÃO):
${profile.whatDidNotWork.map((d) => `[${d.date}] ${d.note}`).join("\n") || "Nenhum registro ainda"}
=====================================================
Aviso: Este perfil descreve recursos de acessibilidade pedagógica.
Não é diagnóstico médico nem laudo clínico.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Perfil Funcional de Aprendizagem - ${profile.studentName}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #0f172a; line-height: 1.5; font-size: 13px; }
            .header { border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 20px; }
            h1 { font-size: 20px; margin: 0 0 4px 0; color: #0f172a; }
            .badge { display: inline-block; background: #ccfbf1; color: #0f766e; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 11px; }
            .section { margin-bottom: 16px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; page-break-inside: avoid; }
            .section h3 { margin: 0 0 8px 0; font-size: 14px; color: #0d9488; text-transform: uppercase; }
            ul { margin: 4px 0 0 16px; padding: 0; }
            li { margin-bottom: 4px; }
            .disclaimer { margin-top: 24px; padding: 10px; background: #f8fafc; border-left: 3px solid #0d9488; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="badge">Educação Inclusiva & DUA</span>
            <h1>Perfil Funcional de Aprendizagem e Apoio</h1>
            <p><strong>Estudante:</strong> ${profile.studentName} | <strong>Turma:</strong> ${profile.gradeOrClass} | <strong>Atualizado:</strong> ${profile.updatedAt}</p>
          </div>

          <div class="section">
            <h3>1. Como prefere receber instruções</h3>
            <ul>${profile.instructionPreferences.map((p) => `<li>${p}</li>`).join("")}</ul>
            ${profile.instructionNotes ? `<p><em>Obs:</em> ${profile.instructionNotes}</p>` : ""}
          </div>

          <div class="section">
            <h3>2. Formas de Expressão e Participação (DUA)</h3>
            <ul>${profile.expressionModalities.map((m) => `<li>${m}</li>`).join("")}</ul>
            ${profile.expressionNotes ? `<p><em>Obs:</em> ${profile.expressionNotes}</p>` : ""}
          </div>

          <div class="section">
            <h3>3. Recursos e Acomodações que Ajudam</h3>
            <ul>${profile.helpfulResources.map((r) => `<li>${r}</li>`).join("")}</ul>
          </div>

          <div class="section">
            <h3>4. Interesses e Engajadores Pedagógicos</h3>
            <p>${profile.engagementInterests || "Não informados"}</p>
          </div>

          <div class="section">
            <h3>5. Barreiras no Ambiente Escolar a Atenuar</h3>
            <ul>${profile.schoolBarriers.map((b) => `<li>${b}</li>`).join("")}</ul>
          </div>

          <div class="section">
            <h3>6. O que funcionou (Histórico Cumulativo)</h3>
            <ul>${profile.whatWorkedHistory.map((h) => `<li><strong>${h.date}:</strong> ${h.note}</li>`).join("")}</ul>
          </div>

          <div class="section">
            <h3>7. O que não funcionou (Para Evitar Repetição)</h3>
            <ul>${profile.whatDidNotWork.map((d) => `<li><strong>${d.date}:</strong> ${d.note}</li>`).join("")}</ul>
          </div>

          <div class="disclaimer">
            <strong>Aviso de Escopo:</strong> Este documento destina-se ao planejamento pedagógico e à eliminação de barreiras de acesso ao currículo escolar. Não substitui e não se confunde com laudo médico ou diagnóstico clínico.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Principle Banner (Item 16 do Adendo) */}
      <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed flex items-start gap-3 ${
        isDark ? "bg-teal-950/40 border-teal-800/60 text-teal-200" : "bg-teal-50 border-teal-200 text-teal-900"
      }`}>
        <ShieldCheck className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Perfil Funcional de Aprendizagem e Apoio Pedagógico (Item 16 do Adendo):
          </p>
          <p className="opacity-95 text-xs">
            Esta ferramenta apoia o educador na identificação das <strong>vias de acesso, comunicação e autorregulação</strong> do estudante, mantendo a memória pedagógica viva e evitando repetição de estratégias infrutíferas.
          </p>
          <p className="text-[11px] font-semibold text-teal-300 pt-0.5">
            🔒 Não rotula, não infere diagnóstico e não exige laudo médico como condição de suporte.
          </p>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Brain className="w-5 h-5 text-teal-400" />
              Perfil Funcional: {profile.studentName}
            </h2>
            <span className="px-2 py-0.5 bg-teal-950 text-teal-300 border border-teal-800 rounded-full text-[10px] font-bold">
              Pedagógico
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Atualizado em: {profile.updatedAt} • Acessibilidade e DUA aplicados ao contexto escolar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyProfile}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copiado!" : "Copiar Perfil"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Imprimir Ficha</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow"
          >
            {savedStatus ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FolderPlus className="w-3.5 h-3.5" />}
            <span>{savedStatus ? "Salvo com Sucesso!" : "Salvar Alterações"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Como Prefere Receber Instruções */}
        <div className={`p-5 rounded-2xl border space-y-3 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> 1. Como Prefere Receber Instruções
            </h3>
            <span className="text-[10px] text-slate-400">Compreensão & Acesso</span>
          </div>

          <div className="space-y-1.5">
            {DEFAULT_INSTRUCTION_PREFS.map((item, idx) => {
              const active = profile.instructionPreferences.includes(item);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleArrayItem("instructionPreferences", item)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition border flex items-center gap-2 ${
                    active
                      ? "bg-teal-950/70 border-teal-700 text-teal-200"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    active ? "bg-teal-600 border-teal-500 text-white" : "border-slate-700 bg-slate-900"
                  }`}>
                    {active ? "✓" : ""}
                  </span>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>

          <input
            type="text"
            placeholder="Anotações complementares sobre instrução..."
            value={profile.instructionNotes}
            onChange={(e) => setProfile({ ...profile, instructionNotes: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* 2. Formas de Expressão e Participação (DUA) */}
        <div className={`p-5 rounded-2xl border space-y-3 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> 2. Formas de Expressão & Participação
            </h3>
            <span className="text-[10px] text-slate-400">DUA • Múltiplos Meios</span>
          </div>

          <div className="space-y-1.5">
            {DEFAULT_EXPRESSION_MODS.map((item, idx) => {
              const active = profile.expressionModalities.includes(item);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleArrayItem("expressionModalities", item)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition border flex items-center gap-2 ${
                    active
                      ? "bg-cyan-950/70 border-cyan-700 text-cyan-200"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    active ? "bg-cyan-600 border-cyan-500 text-white" : "border-slate-700 bg-slate-900"
                  }`}>
                    {active ? "✓" : ""}
                  </span>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>

          <input
            type="text"
            placeholder="Anotações complementares sobre formas de resposta..."
            value={profile.expressionNotes}
            onChange={(e) => setProfile({ ...profile, expressionNotes: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* 3. Recursos e Acomodações que Ajudam */}
        <div className={`p-5 rounded-2xl border space-y-3 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> 3. Recursos e Acomodações que Ajudam
            </h3>
            <span className="text-[10px] text-slate-400">Apoio Sensorial & Rotina</span>
          </div>

          <div className="space-y-1.5">
            {DEFAULT_HELPFUL_RESOURCES.map((item, idx) => {
              const active = profile.helpfulResources.includes(item);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleArrayItem("helpfulResources", item)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition border flex items-center gap-2 ${
                    active
                      ? "bg-amber-950/70 border-amber-700 text-amber-200"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    active ? "bg-amber-600 border-amber-500 text-white" : "border-slate-700 bg-slate-900"
                  }`}>
                    {active ? "✓" : ""}
                  </span>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Interesses e Engajadores Pedagógicos */}
        <div className={`p-5 rounded-2xl border space-y-3 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Heart className="w-4 h-4" /> 4. Interesses & Engajadores Pedagógicos
            </h3>
            <span className="text-[10px] text-slate-400">Ponte Pedagógica</span>
          </div>

          <p className="text-xs text-slate-400 leading-snug">
            Mapeie tópicos, personagens, músicas, território ou tecnologias significativas que possam ser usados como contexto motivador na atividade:
          </p>

          <textarea
            rows={3}
            value={profile.engagementInterests}
            onChange={(e) => setProfile({ ...profile, engagementInterests: e.target.value })}
            placeholder="Ex: Trens, dinossauros, programação em Scratch, música regional, cultura digital..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />

          <p className="text-[10px] text-slate-400 italic">
            * Não inferir diagnóstico a partir destes interesses; são recursos para conexões curriculares ricas.
          </p>
        </div>

        {/* 5. Barreiras no Ambiente Escolar a Atenuar */}
        <div className={`p-5 rounded-2xl border space-y-3 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> 5. Barreiras Observadas no Ambiente
            </h3>
            <span className="text-[10px] text-slate-400">Eliminação de Barreiras</span>
          </div>

          <div className="space-y-1.5">
            {DEFAULT_BARRIERS.map((item, idx) => {
              const active = profile.schoolBarriers.includes(item);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleArrayItem("schoolBarriers", item)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition border flex items-center gap-2 ${
                    active
                      ? "bg-rose-950/70 border-rose-800 text-rose-200"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    active ? "bg-rose-600 border-rose-500 text-white" : "border-slate-700 bg-slate-900"
                  }`}>
                    {active ? "✓" : ""}
                  </span>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. O QUE FUNCIONOU vs O QUE NÃO FUNCIONOU (Histórico Pedagógico) */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          {/* Sub-block: O que Funcionou */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> 6. O Que Funcionou (Registro Cumulativo)
              </h4>
              <span className="text-[10px] text-emerald-300">Práticas de Sucesso</span>
            </div>

            <form onSubmit={handleAddWhatWorked} className="flex gap-2">
              <input
                type="text"
                value={newWhatWorked}
                onChange={(e) => setNewWhatWorked(e.target.value)}
                placeholder="Registrar estratégia que funcionou bem..."
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
              >
                + Adicionar
              </button>
            </form>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {profile.whatWorkedHistory.map((item, idx) => (
                <div key={idx} className="p-2 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-300 flex items-start justify-between gap-2">
                  <span><strong>[{item.date}]</strong> {item.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-block: O que Não Funcionou */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Ban className="w-4 h-4" /> 7. O Que Não Funcionou (Para Evitar Repetição)
              </h4>
              <span className="text-[10px] text-amber-300">Evitar Desgaste</span>
            </div>

            <form onSubmit={handleAddWhatDidNotWork} className="flex gap-2">
              <input
                type="text"
                value={newWhatDidNotWork}
                onChange={(e) => setNewWhatDidNotWork(e.target.value)}
                placeholder="Registrar estratégia a não repetir..."
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl"
              >
                + Adicionar
              </button>
            </form>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {profile.whatDidNotWork.map((item, idx) => (
                <div key={idx} className="p-2 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-300 flex items-start justify-between gap-2">
                  <span><strong>[{item.date}]</strong> {item.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
