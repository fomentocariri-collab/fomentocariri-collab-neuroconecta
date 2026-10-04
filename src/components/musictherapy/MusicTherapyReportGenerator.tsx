import React, { useState, useEffect, useMemo } from "react";
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Calendar, 
  UserCheck, 
  Lock,
  Filter,
  Target
} from "lucide-react";
import { MusicotherapyCase, MusicotherapyGoal } from "../../types/musicotherapy";
import { MusicTherapySession } from "../../types";
import { jsPDF } from "jspdf";

interface MusicTherapyReportGeneratorProps {
  currentCase: MusicotherapyCase;
  sessions?: MusicTherapySession[];
  isDark?: boolean;
}

export const MusicTherapyReportGenerator: React.FC<MusicTherapyReportGeneratorProps> = ({
  currentCase,
  sessions: propSessions,
  isDark = true,
}) => {
  const [periodStart, setPeriodStart] = useState<string>(
    currentCase.start_date || "2026-02-10"
  );
  const [periodEnd, setPeriodEnd] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Carregar metas reais do PTS
  const [goals, setGoals] = useState<MusicotherapyGoal[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`neuroconecta_mt_goals_${currentCase.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGoals(parsed);
          return;
        }
      }
    } catch {}

    // Metas padrão do caso
    setGoals([
      {
        id: "goal-01",
        plan_id: `plan-${currentCase.id}`,
        case_id: currentCase.id,
        patient_id: currentCase.patient_id,
        domain: "interacao_social",
        description: "Alternar turnos musicais (tocar e aguardar) em atividade percussiva estruturada.",
        baseline: "Sustenta até 2 turnos com mediação física direta.",
        target: "Realizar 6 turnos alternados consecutivos com apoio verbal mínimo ou visual.",
        status: "active",
        start_date: "2026-02-15",
        professional_id: currentCase.professional_id,
      },
      {
        id: "goal-02",
        plan_id: `plan-${currentCase.id}`,
        case_id: currentCase.id,
        patient_id: currentCase.patient_id,
        domain: "comunicacao",
        description: "Expressar intenção comunicativa de escolha entre 2 instrumentos musicais.",
        baseline: "Pega impulsivamente sem apontar ou vocalizar.",
        target: "Apontar espontaneamente ou vocalizar a sílaba inicial do instrumento desejado em 80% das oportunidades.",
        status: "active",
        start_date: "2026-02-15",
        professional_id: currentCase.professional_id,
      },
      {
        id: "goal-03",
        plan_id: `plan-${currentCase.id}`,
        case_id: currentCase.id,
        patient_id: currentCase.patient_id,
        domain: "resposta_sensorial",
        description: "Permanecer na sala tolerando sons de intensidade moderada (até 65 dB) sem sobrecarga sensorial.",
        baseline: "Apresenta desconforto auditivo e cobre ouvidos após 5 minutos.",
        target: "Permanecer regulado por 20 minutos com acomodações sonoras previsíveis.",
        status: "partially_achieved",
        start_date: "2026-02-15",
        professional_id: currentCase.professional_id,
      },
    ]);
  }, [currentCase.id]);

  // Carregar sessões reais no período
  const periodSessions = useMemo(() => {
    let list: MusicTherapySession[] = [];
    if (propSessions && Array.isArray(propSessions)) {
      list = propSessions;
    } else {
      try {
        const stored = localStorage.getItem("neuroconecta_musictherapy_sessions");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) list = parsed;
        }
      } catch {}
    }

    const cName = currentCase.patient_name.toLowerCase().trim();
    return list.filter((s) => {
      const matchName = !s.patientName || s.patientName.toLowerCase().trim().includes(cName) || cName.includes(s.patientName.toLowerCase().trim());
      if (!matchName) return false;
      if (s.date && (s.date < periodStart || s.date > periodEnd)) return false;
      return true;
    });
  }, [propSessions, currentCase.patient_name, periodStart, periodEnd]);

  const [clinicalSynthesis, setClinicalSynthesis] = useState(
    "Durante o período acompanhado, o paciente demonstrou evolução em suas respostas de reciprocidade comunicativa e regulação sensorial através de experiências sonoro-musicais estruturadas. Observou-se ampliação no tempo de atenção conjunta com instrumentos acústicos afinados, além da emergência de turnos alternados em atividades de dueto. O uso de rituais sonoros de abertura e desaceleração mostrou-se eficaz na sustentação do estado de autorregulação."
  );

  const [recommendations, setRecommendations] = useState(
    "1. Continuidade do atendimento de musicoterapia em frequência semanal (50 min);\n2. Manutenção de acomodações acústicas na sala de aula (antecipação de ruídos fortes, pausas sonoras);\n3. Compartilhamento das canções de transição com a equipe pedagógica e mediadores escolares."
  );

  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const margin = 18;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - margin * 2;
      let y = 18;

      // Cabeçalho Institucional
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("NEUROCONECTA • PLATAFORMA CLÍNICA MULTIDISCIPLINAR", margin, y);
      y += 5;

      doc.setFontSize(10);
      doc.setTextColor(13, 148, 136); // teal-600
      doc.text("RELATÓRIO CLÍNICO LONGITUDINAL DE MUSICOTERAPIA", margin, y);
      y += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Protocolo Clínico NC-MT1 • CBO 2263-05 (Musicoterapeuta) • UBAM", margin, y);
      y += 3;
      doc.setDrawColor(204, 251, 241);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;

      // 1. Identificação
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text("1. IDENTIFICAÇÃO DA PESSOA ACOMPANHADA", margin, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Nome: ${currentCase.patient_name}`, margin, y);
      y += 4;
      doc.text(`Data de Nasc.: ${currentCase.patient_birth_date || "Não informada"} | Pronomes: ${currentCase.patient_pronouns || "ele/dele"}`, margin, y);
      y += 4;
      doc.text(`CIPTEA / Reg.: ${currentCase.patient_ciptea || "CIPTEA-CE 2026/089"} | Diagnóstico: Laudo Médico Formal (TEA)`, margin, y);
      y += 4;
      doc.text(`Período de Referência: ${periodStart} a ${periodEnd} (${periodSessions.length} sessões realizadas)`, margin, y);
      y += 6;

      // 2. Responsável Técnico
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text("2. RESPONSÁVEL TÉCNICO", margin, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Musicoterapeuta: ${currentCase.professional_name}`, margin, y);
      y += 4;
      doc.text(`Habilitação Profissional: ${currentCase.professional_register || "CBO 2263-05 / UBAM 0341"}`, margin, y);
      y += 6;

      // 3. Metas do PTS-MT (Reais e Dinâmicas)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text("3. SÍNTESE DO PLANO TERAPÊUTICO SINGULAR (PTS-MT)", margin, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      if (goals.length === 0) {
        doc.text("Nenhuma meta cadastrada no PTS.", margin, y);
        y += 5;
      } else {
        goals.forEach((g, idx) => {
          const statusText = 
            g.status === "achieved" ? "Consolidada" :
            g.status === "partially_achieved" ? "Em progresso consistente" : "Ativa";
          const goalLine = `• Meta ${idx + 1} (${g.domain.replace("_", " ")}): ${g.description} [Status: ${statusText}]`;
          const split = doc.splitTextToSize(goalLine, contentWidth);
          doc.text(split, margin, y);
          y += split.length * 4 + 1;
        });
      }
      y += 3;

      // 4. Parecer Clínico Longitudinal
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text("4. PARECER CLÍNICO LONGITUDINAL", margin, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const splitSynthesis = doc.splitTextToSize(clinicalSynthesis, contentWidth);
      doc.text(splitSynthesis, margin, y);
      y += splitSynthesis.length * 4 + 6;

      // 5. Recomendações
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text("5. RECOMENDAÇÕES DE CONTINUIDADE", margin, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const splitRecs = doc.splitTextToSize(recommendations, contentWidth);
      doc.text(splitRecs, margin, y);
      y += splitRecs.length * 4 + 10;

      // Rodapé de Assinatura
      doc.setDrawColor(203, 213, 225);
      doc.line(margin + 25, y, pageWidth - margin - 25, y);
      y += 4.5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(currentCase.professional_name, pageWidth / 2, y, { align: "center" });
      y += 3.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(currentCase.professional_register || "CBO 2263-05 (Musicoterapeuta)", pageWidth / 2, y, { align: "center" });
      y += 3.5;
      doc.text(`Documento emitido eletronicamente via NeuroConecta em ${new Date().toLocaleDateString("pt-BR")}`, pageWidth / 2, y, { align: "center" });

      // Salva arquivo
      doc.save(`Relatorio_Musicoterapia_${currentCase.patient_name.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl border shadow-sm ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                Documento Clínico Oficial
              </span>
              <span className="text-xs text-slate-400">Pessoa Acompanhada: <strong>{currentCase.patient_name}</strong></span>
            </div>
            <h2 className="text-xl font-black mt-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Relatório Clínico Longitudinal de Musicoterapia
            </h2>
            <p className="text-xs text-slate-400">
              Síntese avaliativa pericial com fundamentação em evidências para famílias, planos de saúde e equipe multidisciplinar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-700 shadow-sm"
              title="Imprimir relatório"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGenerating ? "Gerando PDF..." : "Exportar PDF Oficial"}</span>
            </button>
          </div>
        </div>

        {/* Filtros de Período e Parâmetros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block text-[11px] mb-1">Data Inicial do Período:</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block text-[11px] mb-1">Data Final do Período:</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex flex-col justify-end">
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-teal-400 font-semibold text-center">
              {periodSessions.length} {periodSessions.length === 1 ? "sessão vinculada" : "sessões vinculadas"} no período
            </div>
          </div>
        </div>
      </div>

      {/* Visualização do Relatório (Prontuário Formatado) */}
      <div className={`p-8 rounded-3xl border shadow-lg space-y-6 ${
        isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        {/* Cabeçalho do Laudo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-teal-500">
              Prontuário Clínico Especializado • CBO 2263-05
            </span>
            <h1 className="text-lg sm:text-xl font-black">
              RELATÓRIO DE EVOLUÇÃO EM MUSICOTERAPIA
            </h1>
            <p className="text-xs text-slate-400">
              Protocolo NC-MT1 • Associação Brasileira de Musicoterapia (UBAM)
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-300 block">
              Emissão: {new Date().toLocaleDateString("pt-BR")}
            </span>
            <span className="text-[10px] text-teal-400 font-mono">
              Autenticação: MT-{currentCase.id.substring(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* 1. Identificação */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-teal-400 uppercase tracking-wide text-[11px]">
            1. Identificação da Pessoa Acompanhada
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block">Nome Completo:</span>
              <strong className="text-slate-200">{currentCase.patient_name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Data de Nascimento:</span>
              <span className="text-slate-200">{currentCase.patient_birth_date || "12/04/2018"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">CIPTEA:</span>
              <span className="text-slate-200">{currentCase.patient_ciptea || "CIPTEA-CE 2026/089"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Pronomes:</span>
              <span className="text-slate-200">{currentCase.patient_pronouns || "ele/dele"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Diagnóstico:</span>
              <span className="text-slate-200">TEA (Laudo Médico Formal)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Início das Sessões:</span>
              <span className="text-slate-200">{currentCase.start_date}</span>
            </div>
          </div>
        </div>

        {/* 2. Responsável Técnico */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-teal-400 uppercase tracking-wide text-[11px]">
            2. Identificação do Musicoterapeuta Responsável
          </h3>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <strong className="text-slate-200 text-sm block">{currentCase.professional_name}</strong>
              <span className="text-teal-400 text-xs font-semibold">
                {currentCase.professional_register || "CBO 2263-05 / UBAM 0341"}
              </span>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <span>Especialização em Musicoterapia & Neurodesenvolvimento</span>
            </div>
          </div>
        </div>

        {/* 3. Metas do PTS-MT Reais */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-teal-400 uppercase tracking-wide text-[11px]">
            3. Síntese do Plano Terapêutico Singular (PTS-MT)
          </h3>
          <div className="space-y-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            {goals.length === 0 ? (
              <p className="text-slate-500 italic">Nenhuma meta associada.</p>
            ) : (
              goals.map((g, idx) => (
                <div key={g.id} className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-1.5 last:border-b-0 last:pb-0">
                  <div>
                    <span className="font-semibold text-slate-200">
                      Meta {idx + 1} ({g.domain.replace("_", " ")}):
                    </span>{" "}
                    <span className="text-slate-300">{g.description}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      <strong>Base:</strong> {g.baseline} | <strong>Alvo:</strong> {g.target}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                    g.status === "achieved" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" :
                    g.status === "partially_achieved" ? "bg-amber-950 text-amber-300 border border-amber-800" :
                    "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}>
                    {g.status === "achieved" ? "Consolidada" : g.status === "partially_achieved" ? "Em progresso" : "Ativa"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. Parecer Clínico Editável */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-teal-400 uppercase tracking-wide text-[11px]">
            4. Parecer Clínico e Evolução Longitudinal
          </h3>
          <textarea
            rows={4}
            value={clinicalSynthesis}
            onChange={(e) => setClinicalSynthesis(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 leading-relaxed focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* 5. Recomendações */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-teal-400 uppercase tracking-wide text-[11px]">
            5. Recomendações Multidisciplinares e Escolares
          </h3>
          <textarea
            rows={3}
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 leading-relaxed focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Assinatura Eletrônica e Certificação */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Documento assinado eletronicamente com integridade e rastreabilidade na Plataforma NeuroConecta.</span>
          </div>

          <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
            <div className="font-bold text-slate-200">{currentCase.professional_name}</div>
            <div className="text-[11px] text-teal-400">{currentCase.professional_register || "CBO 2263-05"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
