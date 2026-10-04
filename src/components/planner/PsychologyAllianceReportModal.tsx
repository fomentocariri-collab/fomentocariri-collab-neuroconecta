import React, { useState, useMemo } from "react";
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Sparkles,
  ClipboardCheck,
  Edit3
} from "lucide-react";
import { jsPDF } from "jspdf";
import { PsychologyTherapeuticProcess, AssistedUserSummary } from "../../types";

interface PsychologyAllianceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  process: PsychologyTherapeuticProcess;
  selectedUser: AssistedUserSummary | null;
  professionalName?: string;
  professionalRegister?: string;
  isDark?: boolean;
}

export const PsychologyAllianceReportModal: React.FC<PsychologyAllianceReportModalProps> = ({
  isOpen,
  onClose,
  process,
  selectedUser,
  professionalName = "Profissional Responsável",
  professionalRegister = "CRP 11/00000",
  isDark = true,
}) => {
  if (!isOpen) return null;

  // Título e Tipologia Prudente
  const [reportTitle, setReportTitle] = useState<string>("Relatório de Acompanhamento do Processo Terapêutico");
  const [professionalTitle, setProfessionalTitle] = useState<string>("Psicólogo(a) Clínico(a)");
  const [profName, setProfName] = useState<string>(professionalName);
  const [profRegister, setProfRegister] = useState<string>(professionalRegister);

  // Filtros de Período
  const defaultStartDate = process.startDate || "2026-01-01";
  const defaultEndDate = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);

  // Filtragem dos registros pelo período selecionado
  const filteredCheckIns = useMemo(() => {
    return process.processCheckIns
      .filter((chk) => {
        const d = chk.date || chk.createdAt?.split("T")[0];
        if (!d) return true;
        return d >= startDate && d <= endDate;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date || a.createdAt || "").getTime();
        const timeB = new Date(b.date || b.createdAt || "").getTime();
        return timeA - timeB;
      });
  }, [process.processCheckIns, startDate, endDate]);

  const filteredAgendas = useMemo(() => {
    return process.sessionAgendas.filter((a) => {
      const d = a.sessionDate;
      if (!d) return true;
      return d >= startDate && d <= endDate;
    });
  }, [process.sessionAgendas, startDate, endDate]);

  const filteredRuptures = useMemo(() => {
    return process.ruptureAlerts.filter((r) => {
      const d = r.date || r.createdAt?.split("T")[0];
      if (!d) return true;
      return d >= startDate && d <= endDate;
    });
  }, [process.ruptureAlerts, startDate, endDate]);

  // Cálculos determinísticos para o relatório
  const checkInMetrics = useMemo(() => {
    const count = filteredCheckIns.length;
    if (count === 0) {
      return {
        count: 0,
        avgGeneral: 0,
        avgVinculo: 0,
        avgSentido: 0,
        avgMetas: 0,
        avgTarefas: 0,
        firstGeneral: 0,
        lastGeneral: 0,
        delta: 0,
      };
    }

    const sumVinculo = filteredCheckIns.reduce((a, b) => a + b.feltHeardScore, 0);
    const sumSentido = filteredCheckIns.reduce((a, b) => a + b.sessionMadeSenseScore, 0);
    const sumMetas = filteredCheckIns.reduce((a, b) => a + b.understoodGoalsScore, 0);
    const sumTarefas = filteredCheckIns.reduce((a, b) => a + b.taskFeasibleScore, 0);

    const avgVinculo = Number((sumVinculo / count).toFixed(2));
    const avgSentido = Number((sumSentido / count).toFixed(2));
    const avgMetas = Number((sumMetas / count).toFixed(2));
    const avgTarefas = Number((sumTarefas / count).toFixed(2));
    const avgGeneral = Number(((avgVinculo + avgSentido + avgMetas + avgTarefas) / 4).toFixed(2));

    const first = filteredCheckIns[0];
    const last = filteredCheckIns[count - 1];
    const firstGeneral = Number(
      ((first.feltHeardScore + first.sessionMadeSenseScore + first.understoodGoalsScore + first.taskFeasibleScore) / 4).toFixed(2)
    );
    const lastGeneral = Number(
      ((last.feltHeardScore + last.sessionMadeSenseScore + last.understoodGoalsScore + last.taskFeasibleScore) / 4).toFixed(2)
    );
    const delta = Number((lastGeneral - firstGeneral).toFixed(2));

    return {
      count,
      avgGeneral,
      avgVinculo,
      avgSentido,
      avgMetas,
      avgTarefas,
      firstGeneral,
      lastGeneral,
      delta,
    };
  }, [filteredCheckIns]);

  // 7. Síntese do Período — Campo editável sob responsabilidade profissional
  const [clinicalSynthesis, setClinicalSynthesis] = useState<string>(() => {
    return (
      `No período compreendido entre ${startDate} e ${endDate}, foram realizados atendimentos clínicos fundamentados na Terapia Cognitivo-Comportamental (TCC) Neuroafirmativa. ` +
      `O processo evidenciou engajamento colaborativo na definição de prioridades e pautas de sessão. ` +
      `Foram registrados check-ins regulares com avaliação estruturada de vínculo, clareza dos objetivos e viabilidade das tarefas combinadas, ` +
      `sustentando uma relação terapêutica segura e colaborativa.`
    );
  });

  const patientName = selectedUser?.displayName || process.patientName || "Paciente";
  const emissionDate = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  // GERAÇÃO DE PDF FORMATADO COM JSPDF
  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = 18;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 18) {
        doc.addPage();
        y = 18;
        // Cabeçalho de continuação
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`NeuroConecta • ${reportTitle} (Continuação)`, margin, 12);
        doc.line(margin, 14, pageWidth - margin, 14);
      }
    };

    // Cabeçalho Institucional
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("NEUROCONECTA • PLATAFORMA CLÍNICA MULTIDISCIPLINAR", margin, y);
    y += 5;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(reportTitle.toUpperCase(), margin, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Abordagem: ${process.therapeuticApproach} | Emissão: ${emissionDate}`, margin, y);
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // 1. Identificação
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("1. IDENTIFICAÇÃO", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Pessoa Acompanhada: ${patientName}`, margin, y);
    y += 4.5;
    doc.text(`Profissional Responsável: ${profName} (${professionalTitle} • ${profRegister})`, margin, y);
    y += 4.5;
    doc.text(`Período de Referência: ${startDate} a ${endDate}`, margin, y);
    y += 6;

    // 2. Objetivos Terapêuticos Colaborativos
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("2. OBJETIVOS TERAPÊUTICOS COLABORATIVOS", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    if (process.collaborativeGoals.length === 0) {
      doc.text("Nenhum objetivo específico registrado no processo até o momento.", margin, y);
      y += 5;
    } else {
      process.collaborativeGoals.forEach((goal, i) => {
        checkPageBreak(12);
        const goalLine = `• [Prioridade ${goal.priority.toUpperCase()}] ${goal.description}`;
        const splitText = doc.splitTextToSize(goalLine, contentWidth);
        doc.text(splitText, margin, y);
        y += splitText.length * 4 + 1;
        if (goal.notes) {
          const notesText = doc.splitTextToSize(`  Obs: ${goal.notes}`, contentWidth - 4);
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(notesText, margin + 4, y);
          y += notesText.length * 3.5 + 1;
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
        }
      });
      y += 2;
    }

    // 3. Acompanhamento da Aliança Terapêutica
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("3. ACOMPANHAMENTO DA ALIANÇA TERAPÊUTICA (ESCALA 1-5)", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    if (checkInMetrics.count === 0) {
      doc.text("Nenhum check-in registrado dentro do período selecionado.", margin, y);
      y += 6;
    } else {
      doc.text(`Total de check-ins no período: ${checkInMetrics.count} avaliações`, margin, y);
      y += 4.5;
      doc.text(`• Média Geral da Aliança: ${checkInMetrics.avgGeneral} / 5.0 (Variação no período: ${checkInMetrics.delta >= 0 ? `+${checkInMetrics.delta}` : checkInMetrics.delta} pts)`, margin, y);
      y += 4.5;
      doc.text(`• Vínculo e Percepção de Escuta: ${checkInMetrics.avgVinculo} / 5.0`, margin, y);
      y += 4.5;
      doc.text(`• Sentido e Relevância da Sessão: ${checkInMetrics.avgSentido} / 5.0`, margin, y);
      y += 4.5;
      doc.text(`• Clareza dos Objetivos Terapêuticos: ${checkInMetrics.avgMetas} / 5.0`, margin, y);
      y += 4.5;
      doc.text(`• Viabilidade das Tarefas Entre Sessões: ${checkInMetrics.avgTarefas} / 5.0`, margin, y);
      y += 6;
    }

    // 4. Agenda e Participação no Processo
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("4. AGENDA E PARTICIPAÇÃO NO PROCESSO", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    if (filteredAgendas.length === 0) {
      doc.text("Nenhuma agenda colaborativa registrada no período.", margin, y);
      y += 6;
    } else {
      filteredAgendas.slice(0, 3).forEach((ag) => {
        checkPageBreak(15);
        doc.text(`• Sessão ${ag.sessionDate}:`, margin, y);
        y += 4;
        const agDesc = `  Paciente: ${ag.patientPriorities} | Terapeuta: ${ag.professionalPriorities} | Pauta: ${ag.agreedAgendaTopics.join(", ")}`;
        const splitAg = doc.splitTextToSize(agDesc, contentWidth - 4);
        doc.text(splitAg, margin + 4, y);
        y += splitAg.length * 4 + 1;
      });
      y += 2;
    }

    // 5. Atividades Entre Sessões
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("5. ATIVIDADES E RECURSOS ENTRE SESSÕES", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    if (process.interSessionActivities.length === 0) {
      doc.text("Nenhuma atividade entre sessões registrada no plano.", margin, y);
      y += 6;
    } else {
      process.interSessionActivities.forEach((act) => {
        checkPageBreak(12);
        const actDesc = `• ${act.title} (${act.resourceCategory}): ${act.objectiveExplanation}`;
        const splitAct = doc.splitTextToSize(actDesc, contentWidth);
        doc.text(splitAct, margin, y);
        y += splitAct.length * 4 + 1;
      });
      y += 2;
    }

    // 6. Sinais de Ruptura / Dificuldades no Processo
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("6. SINAIS DE ATENÇÃO & MANEJO DE RUPTURAS", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    if (filteredRuptures.length === 0) {
      doc.text("Nenhuma ruptura ou desacordo registrado no período. Processo com colaboração contínua.", margin, y);
      y += 6;
    } else {
      filteredRuptures.forEach((rup) => {
        checkPageBreak(14);
        const rupTitle = `• [${rup.date || "Sem data"}] Situação: ${rup.alertType.replace("_", " ")} — ${rup.description}`;
        const splitRup = doc.splitTextToSize(rupTitle, contentWidth);
        doc.text(splitRup, margin, y);
        y += splitRup.length * 4;
        const mgmtText = doc.splitTextToSize(`  Manejo Realizado: ${rup.clinicalManagementNotes}`, contentWidth - 4);
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(mgmtText, margin + 4, y);
        y += mgmtText.length * 3.5 + 2;
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
      });
      y += 2;
    }

    // 7. Síntese do Período
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("7. SÍNTESE DO PERÍODO & PARECER PROFISSIONAL", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitSynth = doc.splitTextToSize(clinicalSynthesis, contentWidth);
    doc.text(splitSynth, margin, y);
    y += splitSynth.length * 4.5 + 8;

    // 8. Assinatura e Responsabilidade Profissional
    checkPageBreak(35);
    y += 10;
    doc.line(margin + 30, y, pageWidth - margin - 30, y);
    y += 4.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(profName, pageWidth / 2, y, { align: "center" });
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${professionalTitle} • ${profRegister}`, pageWidth / 2, y, { align: "center" });
    y += 4;
    doc.text(`Documento emitido eletronicamente via NeuroConecta em ${emissionDate}`, pageWidth / 2, y, { align: "center" });

    // Download do arquivo
    const cleanFileName = `Relatorio_Alianca_${patientName.replace(/\s+/g, "_")}_${startDate}_a_${endDate}.pdf`;
    doc.save(cleanFileName);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Barra Superior de Controles (Não é impressa) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Emissão de Relatório do Processo Terapêutico
              </h3>
              <p className="text-[11px] text-slate-400">
                Visualização prévia estruturada para impressão ou download em PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-700 shadow-sm"
              title="Imprimir relatório formatado"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              title="Baixar arquivo PDF binário"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtros e Ajuste de Parâmetros (Não impresso) */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-slate-400 font-semibold">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <span>Período:</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
            <span className="text-slate-500">até</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-400 font-semibold">Título do Documento:</label>
            <select
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="Relatório de Acompanhamento do Processo Terapêutico">
                Relatório de Acompanhamento do Processo Terapêutico
              </option>
              <option value="Relatório de Evolução da Aliança Terapêutica">
                Relatório de Evolução da Aliança Terapêutica
              </option>
              <option value="Síntese Terapêutica de Aliança e Metas">
                Síntese Terapêutica de Aliança e Metas
              </option>
            </select>
          </div>
        </div>

        {/* CORPO DO RELATÓRIO — VISUALIZAÇÃO E ÁREA DE IMPRESSÃO */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-slate-900 text-slate-200 print:bg-white print:text-black print:p-0 print:m-0 print:overflow-visible font-sans text-xs">
          
          {/* Cabeçalho do Documento */}
          <div className="border-b border-slate-700 pb-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-400 print:text-indigo-800">
                NeuroConecta • Plataforma Multidisciplinar
              </span>
              <span className="text-[10px] text-slate-400 print:text-slate-600">
                Emissão: {emissionDate}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-100 print:text-black">
              {reportTitle}
            </h1>
            <p className="text-[11px] text-slate-400 print:text-slate-700">
              Protocolo TCC Neuroafirmativa • Abordagem: {process.therapeuticApproach}
            </p>
          </div>

          {/* 1. IDENTIFICAÇÃO */}
          <section className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-800 border-b border-slate-800 print:border-slate-300 pb-1">
              1. Identificação
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-950 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">Pessoa Acompanhada:</span>
                <strong className="text-sm text-slate-100 print:text-black">{patientName}</strong>
                {selectedUser?.id && (
                  <span className="text-[10px] text-slate-500 block">ID: {selectedUser.id}</span>
                )}
              </div>
              <div className="p-3 bg-slate-950 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">Profissional Responsável:</span>
                <strong className="text-sm text-slate-100 print:text-black">{profName}</strong>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">
                  {professionalTitle} • {profRegister}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 print:text-slate-600 px-1">
              Período do Relatório: <strong>{startDate}</strong> a <strong>{endDate}</strong>
            </div>
          </section>

          {/* 2. OBJETIVOS TERAPÊUTICOS COLABORATIVOS */}
          <section className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-800 border-b border-slate-800 print:border-slate-300 pb-1">
              2. Objetivos Terapêuticos Colaborativos
            </h2>
            {process.collaborativeGoals.length === 0 ? (
              <p className="text-slate-400 print:text-slate-600 italic">Nenhum objetivo registrado no plano.</p>
            ) : (
              <div className="space-y-2">
                {process.collaborativeGoals.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 bg-slate-950 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-950 print:bg-indigo-100 text-indigo-300 print:text-indigo-800 border border-indigo-800 print:border-indigo-300">
                          Prioridade {g.priority}
                        </span>
                        <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-semibold">
                          Status: {g.status}
                        </span>
                      </div>
                      <p className="text-slate-200 print:text-black font-semibold mt-1">{g.description}</p>
                      {g.notes && <p className="text-slate-400 print:text-slate-600 text-[11px]">{g.notes}</p>}
                    </div>
                    {g.reviewDate && (
                      <span className="text-[10px] text-slate-400 print:text-slate-600 shrink-0">
                        Revisão prevista: {g.reviewDate}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 3. ACOMPANHAMENTO DA ALIANÇA TERAPÊUTICA */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-800 border-b border-slate-800 print:border-slate-300 pb-1">
              3. Acompanhamento da Aliança Terapêutica
            </h2>
            {checkInMetrics.count === 0 ? (
              <p className="text-slate-400 print:text-slate-600 italic">
                Nenhum check-in registrado dentro do período selecionado ({startDate} a {endDate}).
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                  <div className="p-2.5 bg-slate-950 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200">
                    <span className="text-[10px] text-slate-400 print:text-slate-600 block">Média Geral</span>
                    <strong className="text-sm text-rose-400 print:text-rose-700">{checkInMetrics.avgGeneral} / 5.0</strong>
                  </div>
                  <div className="p-2.5 bg-slate-950 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200">
                    <span className="text-[10px] text-slate-400 print:text-slate-600 block">Vínculo / Escuta</span>
                    <strong className="text-sm text-indigo-400 print:text-indigo-700">{checkInMetrics.avgVinculo} / 5.0</strong>
                  </div>
                  <div className="p-2.5 bg-slate-950 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200">
                    <span className="text-[10px] text-slate-400 print:text-slate-600 block">Sentido Sessão</span>
                    <strong className="text-sm text-cyan-400 print:text-cyan-700">{checkInMetrics.avgSentido} / 5.0</strong>
                  </div>
                  <div className="p-2.5 bg-slate-950 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200">
                    <span className="text-[10px] text-slate-400 print:text-slate-600 block">Metas Claras</span>
                    <strong className="text-sm text-purple-400 print:text-purple-700">{checkInMetrics.avgMetas} / 5.0</strong>
                  </div>
                  <div className="p-2.5 bg-slate-950 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200">
                    <span className="text-[10px] text-slate-400 print:text-slate-600 block">Viabilidade Tarefas</span>
                    <strong className="text-sm text-emerald-400 print:text-emerald-700">{checkInMetrics.avgTarefas} / 5.0</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200 text-[11px] text-slate-300 print:text-slate-800 space-y-1">
                  <p>
                    Foram considerados <strong>{checkInMetrics.count}</strong> check-ins de processo terapêutico no período.
                  </p>
                  {checkInMetrics.count >= 2 && (
                    <p>
                      Evolução temporal: Primeiro check-in com média <strong>{checkInMetrics.firstGeneral}</strong> e último com{" "}
                      <strong>{checkInMetrics.lastGeneral}</strong> (variação de{" "}
                      <strong>{checkInMetrics.delta >= 0 ? `+${checkInMetrics.delta}` : checkInMetrics.delta} pontos</strong>).
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* 4. AGENDA E PARTICIPAÇÃO NO PROCESSO */}
          <section className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-800 border-b border-slate-800 print:border-slate-300 pb-1">
              4. Agenda e Participação no Processo
            </h2>
            {filteredAgendas.length === 0 ? (
              <p className="text-slate-400 print:text-slate-600 italic">Nenhuma agenda colaborativa registrada no período.</p>
            ) : (
              <div className="space-y-2">
                {filteredAgendas.map((ag) => (
                  <div key={ag.id} className="p-3 bg-slate-950 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-300 print:text-indigo-700">Sessão em {ag.sessionDate}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-400 print:text-slate-600 font-semibold block">Trazido pelo Paciente:</span>
                        <p className="text-slate-300 print:text-black">{ag.patientPriorities}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 print:text-slate-600 font-semibold block">Prioridades do Terapeuta:</span>
                        <p className="text-slate-300 print:text-black">{ag.professionalPriorities}</p>
                      </div>
                    </div>
                    {ag.agreedAgendaTopics.length > 0 && (
                      <p className="text-[11px] text-slate-400 print:text-slate-600 pt-1">
                        <strong>Pauta Acordada:</strong> {ag.agreedAgendaTopics.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 5. ATIVIDADES ENTRE SESSÕES */}
          <section className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-800 border-b border-slate-800 print:border-slate-300 pb-1">
              5. Atividades Entre Sessões
            </h2>
            {process.interSessionActivities.length === 0 ? (
              <p className="text-slate-400 print:text-slate-600 italic">Nenhum recurso entre sessões registrado no plano.</p>
            ) : (
              <div className="space-y-2">
                {process.interSessionActivities.map((act) => (
                  <div key={act.id} className="p-3 bg-slate-950 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-200 print:text-black">{act.title}</strong>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 print:bg-indigo-100 text-indigo-300 print:text-indigo-800 font-bold">
                        {act.resourceCategory}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 print:text-slate-700 mt-1">{act.description}</p>
                    <div className="mt-1 text-[10px] text-emerald-400 print:text-emerald-700 flex items-center gap-2">
                      <span>✓ Combinada em sessão</span>
                      <span>•</span>
                      <span>✓ Compreensão do objetivo confirmada</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 6. SINAIS DE RUPTURA / DIFICULDADES NO PROCESSO */}
          <section className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-800 border-b border-slate-800 print:border-slate-300 pb-1">
              6. Sinais de Ruptura & Dificuldades Documentadas
            </h2>
            {filteredRuptures.length === 0 ? (
              <p className="text-slate-400 print:text-slate-600 italic">
                Nenhum episódio de ruptura documentado no período selecionado.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredRuptures.map((rup) => (
                  <div key={rup.id} className="p-3 bg-amber-950/20 print:bg-amber-50 rounded-xl border border-amber-900/60 print:border-amber-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-amber-300 print:text-amber-800 capitalize">
                        {rup.alertType.replace("_", " ")}
                      </strong>
                      <span className="text-[10px] text-slate-400 print:text-slate-600">{rup.date}</span>
                    </div>
                    <p className="text-slate-300 print:text-black text-[11px]">{rup.description}</p>
                    <div className="text-[11px] text-slate-400 print:text-slate-700 pt-1 border-t border-amber-900/40 print:border-amber-200">
                      <strong>Manejo Profissional:</strong> {rup.clinicalManagementNotes}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 7. SÍNTESE DO PERÍODO & PARECER PROFISSIONAL (EDITÁVEL) */}
          <section className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-800">
                7. Síntese do Período & Parecer Profissional
              </h2>
              <span className="text-[10px] text-slate-400 print:hidden flex items-center gap-1">
                <Edit3 className="w-3 h-3 text-indigo-400" />
                Campo editável pelo profissional
              </span>
            </div>

            <div className="print:hidden">
              <textarea
                rows={4}
                value={clinicalSynthesis}
                onChange={(e) => setClinicalSynthesis(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                placeholder="Insira aqui o parecer clínico e a síntese do período sob responsabilidade técnica..."
              />
            </div>

            {/* Versão para Impressão */}
            <div className="hidden print:block p-3 bg-white rounded-xl text-xs leading-relaxed text-black whitespace-pre-wrap">
              {clinicalSynthesis}
            </div>
          </section>

          {/* 8. ASSINATURA / RESPONSABILIDADE PROFISSIONAL */}
          <section className="pt-6 space-y-6">
            <div className="w-72 mx-auto text-center border-t border-slate-700 print:border-black pt-3 space-y-1">
              <div className="print:hidden mb-2 space-y-1">
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  placeholder="Nome do profissional"
                  className="w-full text-center bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 font-bold"
                />
                <input
                  type="text"
                  value={profRegister}
                  onChange={(e) => setProfRegister(e.target.value)}
                  placeholder="Registro (ex: CRP 11/00000)"
                  className="w-full text-center bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-400"
                />
              </div>

              <div className="hidden print:block">
                <p className="font-bold text-black text-sm">{profName}</p>
                <p className="text-slate-700 text-xs">{professionalTitle} • {profRegister}</p>
              </div>

              <p className="text-[10px] text-slate-500 print:text-slate-600">
                Documento emitido eletronicamente via NeuroConecta em {emissionDate}
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
