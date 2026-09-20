import { jsPDF } from "jspdf";
import { EducationArticle } from "../types";

/**
 * Real PDF Generator for NeuroConecta
 * Produces genuine binary PDFs with application/pdf MIME type,
 * clean margins, crisp vector typography, and multi-page support.
 */

export function generateLibraryPdf(
  articles: EducationArticle[],
  myths: { myth: string; fact: string }[]
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = 18;
      // Header for subsequent pages
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("NeuroConecta • Biblioteca & Direitos Neuroafirmativos (Continuação)", margin, 10);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 12, pageWidth - margin, 12);
    }
  };

  // --- Document Header ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("NEUROCONECTA — BIBLIOTECA & LEGISLAÇÃO", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(124, 58, 237); // violet-600
  doc.text("Plataforma de Tecnologia Assistiva, Acessibilidade & Inclusão Neuroafirmativa", margin, y);
  y += 5;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const nowStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Emitido em: ${nowStr} | SISTEMASTOP Soluções Tecnológicas (Crato - CE)`, margin, y);
  y += 4;

  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Principles banner
  doc.setFillColor(245, 243, 255); // violet-50
  doc.setDrawColor(221, 214, 254); // violet-200
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "FD");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(91, 33, 182); // violet-800
  doc.text("Diretriz Pedagógica & Princípio de Acesso Inclusivo:", margin + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const principleText = "O professor e a escola não são responsáveis por diagnosticar. O papel da instituição é tornar conteúdos acessíveis, organizar instruções em etapas e acolher a diversidade. Não é necessário diagnóstico clínico prévio para oferecer apoio e adaptações pedagógicas.";
  const principleLines = doc.splitTextToSize(principleText, contentWidth - 6);
  doc.text(principleLines, margin + 3, y + 9.5);
  y += 22;

  // Section 1: Articles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`1. Artigos, Conceitos e Legislação (${articles.length})`, margin, y);
  y += 6;

  articles.forEach((art, index) => {
    checkPageBreak(30);

    // Box for each article
    const artStartY = y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(124, 58, 237);
    doc.text(`${index + 1}. ${art.term}`, margin, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`[Categoria: ${art.category.toUpperCase()}]`, pageWidth - margin - 35, y);
    y += 5;

    // Short definition
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    const defLines = doc.splitTextToSize(art.shortDefinition, contentWidth);
    doc.text(defLines, margin, y);
    y += defLines.length * 4;

    // Full explanation
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const explLines = doc.splitTextToSize(art.fullExplanation, contentWidth);
    doc.text(explLines, margin, y);
    y += explLines.length * 3.8;

    // Practical tips
    if (art.practicalTips && art.practicalTips.length > 0) {
      y += 1;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(124, 58, 237);
      doc.text("Estratégias Práticas:", margin, y);
      y += 3.5;

      art.practicalTips.forEach((tip) => {
        checkPageBreak(8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        const tipLines = doc.splitTextToSize(`• ${tip}`, contentWidth - 4);
        doc.text(tipLines, margin + 2, y);
        y += tipLines.length * 3.5;
      });
    }

    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  });

  // Section 2: Myths & Facts
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("2. Desmistificando Mitos Comuns sobre Neurodivergência", margin, y);
  y += 6;

  myths.forEach((item) => {
    checkPageBreak(18);

    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(185, 28, 28);
    doc.text(`X  MITO: ${item.myth}`, margin + 2, y + 4.5);
    y += 8;

    doc.setFillColor(240, 253, 244); // green-50
    doc.setDrawColor(187, 247, 208);
    const factLines = doc.splitTextToSize(`v  FATO: ${item.fact}`, contentWidth - 4);
    const boxH = Math.max(7, factLines.length * 3.8 + 3);
    doc.roundedRect(margin, y, contentWidth, boxH, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(21, 128, 61);
    doc.text(factLines, margin + 2, y + 4.5);
    y += boxH + 4;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `NeuroConecta • SISTEMASTOP Soluções Tecnológicas (Crato-CE) • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }

  doc.save(`neuroconecta_biblioteca_${new Date().toISOString().split("T")[0]}.pdf`);
}

/**
 * Real PDF generator for the Academic Review / Estudo de Caso
 * Guarantees:
 * - 0 references to CAPS / Saúde CAPS / RH / Gestão RH / NR-1 / prontuário
 * - Clean technical paper format with tables and citations
 */
export function generateAcademicReviewPdf() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("NeuroConecta • Resenha Acadêmica & Estudo de Caso (Continuação)", margin, 10);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 12, pageWidth - margin, 12);
    }
  };

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("NEUROCONECTA — DOCUMENTO TÉCNICO-CIENTÍFICO", margin, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(124, 58, 237);
  doc.text("ESTUDO DE CASO & ENQUADRAMENTO EM TECNOLOGIA ASSISTIVA", margin, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`SISTEMASTOP Soluções Tecnológicas & Fomento Cariri | Crato - CE | ${new Date().toLocaleDateString("pt-BR")}`, margin, y);
  y += 4;

  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Title Box
  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(221, 214, 254);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(91, 33, 182);
  const titleBoxText = "Plataforma de Tecnologia Assistiva, Interação Humano-Computador Acessível e Suporte Funcional à Autonomia Neurodivergente";
  const titleBoxLines = doc.splitTextToSize(titleBoxText, contentWidth - 6);
  doc.text(titleBoxLines, margin + 3, y + 5.5);
  y += 19;

  // Sections
  const sections = [
    {
      title: "1. Resumo Técnico & Enquadramento em Tecnologia Assistiva",
      paragraphs: [
        "O NeuroConecta é uma plataforma de Tecnologia Assistiva (TA) orientada à Interação Humano-Computador (IHC) acessível e ao apoio funcional de pessoas neurodivergentes (especialmente autistas e pessoas com TDAH), suas famílias, cuidadores e educadores.",
        "Fundamentado nos princípios do Desenho Universal para a Aprendizagem (DUA) e no modelo social da deficiência, prioriza comunicação aumentativa e alternativa (CAA), suporte à organização executiva por rotinas visuais, autorregulação sensorial e registro de necessidades educacionais (PEI), sem exercer atividade diagnóstica clínica.",
      ],
    },
    {
      title: "2. Escopo Funcional Ativo & Recursos Implementados",
      paragraphs: [
        "Apoio à Comunicação (CAA): Pranchas com pictogramas e síntese vocal para facilitar a comunicação autônoma.",
        "Estruturação e Previsibilidade: Rotinas visuais sequenciadas, temporizadores e monitoramento de humor para mitigação de sobrecarga cognitiva.",
        "Acomodação Sensorial: Paisagens sonoras, ruídos confortáveis e pausas guiadas de respiração e desaceleração.",
        "Mediação Pedagógica (PEI & DUA): Minutas colaborativas de adaptações escolares com respeito estrito à proveniência de dados.",
        "Integridade & Segurança: Arquitetura sem inferências diagnósticas automatizadas e com autorização explícita (ShareGrant) para compartilhamento educacional.",
      ],
    },
    {
      title: "3. Princípios Metodológicos & Diferenciação Rigorosa",
      paragraphs: [
        "• Recurso Implementado: Rotinas visuais, pranchas CAA, sons para autorregulação, minutas de PEI e perfil funcional de aprendizagem.",
        "• Potencial de Uso: Apoio à inclusão em sala de aula regular, mediação do diálogo entre família e corpo docente, e suporte à previsibilidade no lar.",
        "• Evidência Externa: Literatura científica reconhece suportes visuais e acomodações baseadas em DUA como práticas recomendadas em educação inclusiva.",
      ],
    },
    {
      title: "4. Considerações Éticas e Delimitação Profissional",
      paragraphs: [
        "A plataforma NeuroConecta reafirma expressamente que seus módulos constituem Tecnologia Assistiva para organização, acessibilidade e comunicação cotidiana. Em nenhuma hipótese a plataforma substitui avaliações clínicas de médicos, psicólogos, terapeutas ocupacionais ou fonoaudiólogos.",
      ],
    },
  ];

  sections.forEach((sec) => {
    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(sec.title, margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    sec.paragraphs.forEach((p) => {
      checkPageBreak(12);
      const lines = doc.splitTextToSize(p, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 3.8 + 2;
    });
    y += 3;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `NeuroConecta • Documento Técnico Científico • SISTEMASTOP • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }

  doc.save(`neuroconecta_resenha_academica_${new Date().toISOString().split("T")[0]}.pdf`);
}

/**
 * Real PDF generator for ReportHub (Functional Report)
 */
export function generateFunctionalReportPdf(data: {
  patientName: string;
  pronouns: string;
  supportLevel: string;
  diagnosisStatus: string;
  ciptea: string;
  periodLabel: string;
  goals?: string;
  accommodations?: string[];
  sensoryNeeds?: string;
  tests: { name: string; score: string; interpretation: string }[];
  emitterName: string;
  emitterRole: string;
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("NeuroConecta • Relatório Funcional de Acompanhamento (Continuação)", margin, 10);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 12, pageWidth - margin, 12);
    }
  };

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("NEUROCONECTA — RELATÓRIO FUNCIONAL DE APOIO", margin, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(124, 58, 237);
  doc.text("TECNOLOGIA ASSISTIVA & ACOMPANHAMENTO NEUROAFIRMATIVO", margin, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Período de Análise: ${data.periodLabel} | Emissão: ${new Date().toLocaleDateString("pt-BR")}`, margin, y);
  y += 4;

  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // Identification Grid
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Titular dos Registros:", margin + 3, y + 5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.patientName} (${data.pronouns})`, margin + 35, y + 5);

  doc.setTextColor(71, 85, 105);
  doc.text("Nível de Suporte:", margin + 3, y + 10);
  doc.setTextColor(15, 23, 42);
  doc.text(data.supportLevel, margin + 35, y + 10);

  doc.setTextColor(71, 85, 105);
  doc.text("Status Documental:", margin + 3, y + 15);
  doc.setTextColor(15, 23, 42);
  doc.text(data.diagnosisStatus, margin + 35, y + 15);

  doc.setTextColor(71, 85, 105);
  doc.text("CIPTEA:", margin + 110, y + 5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.ciptea || "Não cadastrada", margin + 125, y + 5);

  y += 28;

  // Assessments Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Síntese dos Rastreios & Autoavaliações Funcionais", margin, y);
  y += 5;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text("Instrumento", margin + 3, y + 4);
  doc.text("Pontuação", margin + 80, y + 4);
  doc.text("Interpretação Funcional", margin + 110, y + 4);
  y += 7;

  data.tests.forEach((t) => {
    checkPageBreak(7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(t.name, margin + 3, y + 3);
    doc.text(t.score, margin + 80, y + 3);
    doc.text(t.interpretation, margin + 110, y + 3);
    y += 5;
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y, pageWidth - margin, y);
    y += 1;
  });

  y += 6;

  // PEI Section
  if (data.accommodations && data.accommodations.length > 0) {
    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("2. Acomodações & Adaptações Pedagógicas em Vigor", margin, y);
    y += 5;

    data.accommodations.forEach((acc) => {
      checkPageBreak(6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(`• ${acc}`, contentWidth - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 3.5;
    });
    y += 4;
  }

  // Goals
  if (data.goals) {
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("3. Metas Funcionais e Pedagógicas", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const goalLines = doc.splitTextToSize(data.goals, contentWidth);
    doc.text(goalLines, margin, y);
    y += goalLines.length * 3.5 + 4;
  }

  // Signatures
  checkPageBreak(35);
  y += 10;
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 10, y, margin + 70, y);
  doc.line(margin + 100, y, margin + 160, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(data.emitterName, margin + 40, y, { align: "center" });
  doc.text(data.patientName, margin + 130, y, { align: "center" });
  y += 3.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Emissor: ${data.emitterRole}`, margin + 40, y, { align: "center" });
  doc.text("Titular dos Registros", margin + 130, y, { align: "center" });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `NeuroConecta • Relatório Emitido com Proveniência de Dados • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }

  doc.save(`neuroconecta_relatorio_${new Date().toISOString().split("T")[0]}.pdf`);
}
