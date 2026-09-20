import React, { useState, useEffect } from "react";
import { BookOpen, Search, Sparkles, CheckCircle2, HelpCircle, Printer, Building2, Phone, Mail, MapPin, FileText, Download, Users, Calendar, GraduationCap, PenTool, Lightbulb, Brain } from "lucide-react";
import { EDUCATION_ARTICLES, MYTHS_AND_FACTS } from "../data/education";
import { calculateAge, getAgeCategory } from "../types";
import { AccessibleActivityPlanner } from "./AccessibleActivityPlanner";
import { FunctionalLearningProfile } from "./FunctionalLearningProfile";
import { generateLibraryPdf } from "../utils/pdfGenerator";

export const EducationHub: React.FC<{ isDark?: boolean }> = ({ isDark = true }) => {
  const [activeTab, setActiveTab] = useState<"artigos" | "adaptar" | "perfil_funcional" | "mitos">("artigos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");

  // Global patients list for educators
  const [globalStudents, setGlobalStudents] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("neuroconecta_global_patients");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>(globalStudents[0]?.id || "");
  const selectedStudent = globalStudents.find(s => s.id === selectedStudentId) || globalStudents[0];

  const categories = [
    { id: "todos", label: "Todos os Artigos" },
    { id: "direitos", label: "Direitos & Leis (CIPTEA / 12.764)" },
    { id: "educacao", label: "Educação & PEI" },
    { id: "comunicacao", label: "Comunicação & CAA" },
    { id: "conceito", label: "Conceitos & Autorregulação" },
  ];

  const filteredArticles = EDUCATION_ARTICLES.filter((a) => {
    const matchesSearch =
      a.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.shortDefinition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.fullExplanation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "todos" || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadRealPdf = () => {
    generateLibraryPdf(filteredArticles, MYTHS_AND_FACTS);
  };

  const handleDownloadHtml = () => {
    const articlesHtml = filteredArticles.map(art => `
      <div style="margin-bottom: 20px; padding: 16px; border: 1px solid #cbd5e1; border-radius: 10px; page-break-inside: avoid; background-color: #f8fafc;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 16px; color: #0f172a; font-family: sans-serif;">${art.term}</h3>
          <span style="font-size: 10px; font-weight: bold; background-color: #7c3aed; color: white; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">${art.category}</span>
        </div>
        <p style="margin: 6px 0; font-size: 13px; font-weight: 600; color: #334155;">${art.shortDefinition}</p>
        <p style="margin: 8px 0; font-size: 12px; color: #475569; line-height: 1.6;">${art.fullExplanation}</p>
        ${art.practicalTips ? `
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #cbd5e1;">
            <strong style="font-size: 11px; color: #7c3aed; text-transform: uppercase;">Estratégias Práticas:</strong>
            <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 12px; color: #334155;">
              ${art.practicalTips.map(t => `<li style="margin-bottom: 4px;">${t}</li>`).join("")}
            </ul>
          </div>
        ` : ""}
      </div>
    `).join("");

    const mythsHtml = MYTHS_AND_FACTS.map(m => `
      <div style="margin-bottom: 12px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; page-break-inside: avoid; background-color: #f8fafc;">
        <p style="margin: 0 0 4px 0; color: #991b1b; font-size: 12px;"><strong>❌ MITO:</strong> ${m.myth}</p>
        <p style="margin: 0; color: #15803d; font-size: 12px;"><strong>✅ ${m.fact}</strong></p>
      </div>
    `).join("");

    const dateStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Biblioteca NeuroConecta - SISTEMASTOP</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 30px; color: #0f172a; line-height: 1.5; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }
    .brand-text h1 { margin: 0; font-size: 20px; color: #0f172a; }
    .brand-text p { margin: 2px 0 0 0; font-size: 11px; color: #7c3aed; font-weight: bold; }
    .company-info { text-align: right; font-size: 11px; color: #64748b; line-height: 1.4; }
    .section-title { font-size: 15px; font-weight: bold; color: #5b21b6; margin-top: 24px; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 12px; text-align: center; font-size: 11px; color: #64748b; }
    @media print { body { margin: 12mm; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-text">
      <h1>NeuroConecta • Biblioteca & Direitos Neuroafirmativos</h1>
      <p>Plataforma de Tecnologia Assistiva e Apoio Funcional</p>
    </div>
    <div class="company-info">
      <strong>NeuroConecta • Tecnologia Assistiva e Apoio Clínico</strong><br/>
      Canal de Suporte e Ouvidoria Institucional<br/>
      Crato - CE &bull; Apoio à Autonomia e Inclusão
    </div>
  </div>

  <div style="margin-bottom: 20px; font-size: 11px; color: #475569;">
    Documento emitido em <strong>${dateStr}</strong> contendo guia oficial de conceitos, leis (CIPTEA, Lei Berenice Piana), DUA e acomodações inclusivas.
  </div>

  <div class="section-title">📚 Conceitos, Legislação e Estratégias Neuroafirmativas</div>
  ${articlesHtml}

  <div class="section-title" style="margin-top: 28px;">💡 Desmistificando Mitos sobre Autismo e Neurodivergência</div>
  ${mythsHtml}

  <div class="footer">
    SISTEMASTOP Soluções Tecnológicas &bull; Crato - CE &bull; Apoio à Autonomia e Inclusão &bull; Documento Acessível
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `biblioteca_neuroconecta_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className={`rounded-2xl p-6 border shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-violet-500 dark:text-violet-400" />
            <h1 className="text-xl sm:text-2xl font-bold">
              Biblioteca & Direitos Neuroafirmativos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Guia completo de conceitos, Leis (Berenice Piana, CIPTEA), acomodações escolares e estratégias práticas explicadas de forma clara e acessível.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Download Real Binary PDF */}
          <button
            onClick={handleDownloadRealPdf}
            className="px-4 py-2 bg-violet-700 hover:bg-violet-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md"
            title="Baixar arquivo PDF autêntico (MIME: application/pdf) diretamente para o seu dispositivo"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Baixar PDF</span>
          </button>

          {/* Print PDF Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
            title="Imprimir visualização limpa no navegador (sem barras do app)"
          >
            <Printer className="w-4 h-4 text-violet-400" />
            <span>Imprimir</span>
          </button>

          {/* Search Input */}
          <div className="relative w-full sm:w-52">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por termo ou lei..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-violet-500 border ${
                isDark ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("artigos")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
            activeTab === "artigos"
              ? "bg-violet-600 text-white shadow-md"
              : isDark
              ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4 text-violet-300" />
          <span>Artigos & Diretrizes de Inclusão</span>
        </button>

        <button
          onClick={() => setActiveTab("adaptar")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
            activeTab === "adaptar"
              ? "bg-violet-600 text-white shadow-md"
              : isDark
              ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          <PenTool className="w-4 h-4 text-amber-300" />
          <span>Criar / Adaptar Atividade Acessível</span>
        </button>

        <button
          onClick={() => setActiveTab("perfil_funcional")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
            activeTab === "perfil_funcional"
              ? "bg-violet-600 text-white shadow-md"
              : isDark
              ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          <Brain className="w-4 h-4 text-indigo-300" />
          <span>Perfil Funcional de Aprendizagem & Apoio</span>
        </button>

        <button
          onClick={() => setActiveTab("mitos")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
            activeTab === "mitos"
              ? "bg-violet-600 text-white shadow-md"
              : isDark
              ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-emerald-300" />
          <span>Desmistificando Mitos</span>
        </button>
      </div>

      {/* Princípio Pedagógico & Não Exigência de Diagnóstico (Itens 10 e 11 do Adendo) */}
      <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed flex items-start gap-3 ${
        isDark ? "bg-violet-950/40 border-violet-800/60 text-violet-200" : "bg-violet-50 border-violet-200 text-violet-900"
      }`}>
        <Lightbulb className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Princípio Fundamental da Escola Neuroafirmativa:
          </p>
          <p className="opacity-95">
            O professor não é responsável por diagnosticar ou tratar condições clínicas. O papel da escola e do NeuroConecta é tornar atividades acessíveis, organizar instruções em etapas, criar diferentes formas de participação, utilizar apoio visual e colaborar com a família e o AEE.
          </p>
          <p className="text-[11px] font-semibold text-violet-300 dark:text-violet-300 pt-0.5">
            💡 Não é necessário um diagnóstico para oferecer diferentes formas de participação, comunicação e acesso ao conteúdo.
          </p>
        </div>
      </div>

      {/* ABA 2: CRIAR / ADAPTAR ATIVIDADE ACESSÍVEL (PROFESSOR) */}
      {activeTab === "adaptar" && (
        <AccessibleActivityPlanner isDark={isDark} />
      )}

      {/* ABA: PERFIL FUNCIONAL DE APRENDIZAGEM & APOIO (ITEM 16 DO ADENDO) */}
      {activeTab === "perfil_funcional" && (
        <FunctionalLearningProfile
          studentName={selectedStudent?.name || "Estudante"}
          isDark={isDark}
        />
      )}

      {/* ABA 1: ARTIGOS & DIRETRIZES */}
      {activeTab === "artigos" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Pescar Aluno / Cadastro Geral para Acomodações Escolares e PEI */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-950 text-amber-400 rounded-xl border border-amber-800">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span>Pescar Aluno / Cadastrado para PEI</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                    {globalStudents.length} aluno(s)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Importe dados do aluno cadastrado no sistema para emitir diretrizes de acomodação escolar.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className={`px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                  isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                {globalStudents.length === 0 ? (
                  <option value="">Nenhum aluno cadastrado no momento</option>
                ) : (
                  globalStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} • {getAgeCategory(s.birthDate)} ({calculateAge(s.birthDate) !== null ? `${calculateAge(s.birthDate)} anos` : "Idade N/A"})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  selectedCategory === cat.id
                    ? "bg-violet-600 text-white border-violet-500 shadow"
                    : isDark
                    ? "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Articles List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                <Sparkles className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                <span>Artigos e Orientações ({filteredArticles.length})</span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">Formato pronto para impressão</span>
            </div>

            <div className="space-y-4">
              {filteredArticles.length === 0 ? (
                <div className={`p-8 border rounded-2xl text-center text-xs ${
                  isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                }`}>
                  Nenhum termo encontrado para &quot;{searchTerm}&quot;. Tente buscar por lei, CIPTEA, PEI ou conceito.
                </div>
              ) : (
                filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    className={`p-5 rounded-2xl space-y-3 border shadow-sm transition ${
                      isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-violet-600 dark:text-violet-300">{art.term}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20">
                        {art.category}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
                      {art.shortDefinition}
                    </p>

                    <div className={`p-4 border rounded-xl text-xs sm:text-sm leading-relaxed ${
                      isDark ? "bg-slate-950 border-slate-800/80 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}>
                      {art.fullExplanation}
                    </div>

                    {art.practicalTips && art.practicalTips.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <h4 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Estratégias Práticas:</h4>
                        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                          {art.practicalTips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-violet-500 font-bold">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: MITOS VS FATOS */}
      {activeTab === "mitos" && (
        <div className="space-y-4 animate-fadeIn">
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            <HelpCircle className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span>Desmistificando Mitos Comuns sobre Neurodivergência</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MYTHS_AND_FACTS.map((item, idx) => (
              <div key={idx} className={`p-5 rounded-2xl space-y-3 border shadow-sm ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}>
                <div className={`p-3 border rounded-xl text-xs ${
                  isDark ? "bg-rose-950/60 border-rose-800/50 text-rose-200" : "bg-rose-50 border-rose-200 text-rose-900"
                }`}>
                  <strong>❌ MITO:</strong> {item.myth}
                </div>
                <div className={`p-3 border rounded-xl text-xs ${
                  isDark ? "bg-indigo-950/60 border-indigo-800/50 text-indigo-200" : "bg-indigo-50 border-indigo-200 text-indigo-900"
                }`}>
                  <strong>✅ {item.fact}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Contact Card Banner */}
      <div className={`p-6 border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl ${
        isDark
          ? "bg-gradient-to-r from-violet-950/90 via-slate-900 to-slate-900 border-violet-800/80 text-white"
          : "bg-gradient-to-r from-violet-50 via-indigo-50 to-slate-50 border-violet-200 text-slate-900"
      }`}>
        <div className="flex items-center gap-4">
          <img src="/sistemastop_logo.svg" alt="SISTEMASTOP Logo" className={`w-14 h-14 object-contain rounded-xl p-1 border ${
            isDark ? "bg-slate-950 border-violet-800" : "bg-white border-violet-300"
          }`} />
          <div className="space-y-1">
            <h3 className="text-base font-extrabold">SISTEMASTOP • Soluções Tecnológicas</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Rua Doutor Rolim, 366 - Bairro Independência, Crato - CE, CEP 63.119-060
            </p>
            <p className="text-xs text-violet-700 dark:text-violet-300 font-semibold">
              📞 +55 (88) 99673-9128 (WhatsApp) | Central Oficial de Atendimento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadRealPdf}
            className="px-5 py-2.5 bg-violet-700 hover:bg-violet-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition whitespace-nowrap shadow-md"
            title="Baixar arquivo PDF autêntico (MIME: application/pdf)"
          >
            <Download className="w-4 h-4" /> Baixar PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition whitespace-nowrap shadow-sm"
            title="Imprimir documento diretamente"
          >
            <Printer className="w-4 h-4 text-violet-400" /> Imprimir
          </button>
        </div>
      </div>

    </div>
  );
};
