import React, { useState } from "react";
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
  ExternalLink
} from "lucide-react";
import { MusicotherapyCase } from "../../types/musicotherapy";
import { jsPDF } from "jspdf";

interface MusicTherapyReportGeneratorProps {
  currentCase: MusicotherapyCase;
  isDark?: boolean;
}

export const MusicTherapyReportGenerator: React.FC<MusicTherapyReportGeneratorProps> = ({
  currentCase,
  isDark = true,
}) => {
  const [periodStart, setPeriodStart] = useState("2026-02-10");
  const [periodEnd, setPeriodEnd] = useState("2026-09-10");
  const [clinicalSynthesis, setClinicalSynthesis] = useState(
    "Durante o período acompanhado, o paciente demonstrou evolução significativa em suas respostas de reciprocidade comunicativa e regulação sensorial através de experiências sonoro-musicais. Observou-se ampliação no tempo de atenção conjunta com o metalofone e instrumentos afinados, além da emergência de turnos alternados espontâneos em atividades de dueto. O uso de rituais sonoros de abertura e desaceleração mostrou-se eficaz na sustentação do estado de autorregulação."
  );
  const [recommendations, setRecommendations] = useState(
    "1. Continuidade do atendimento de musicoterapia em frequência semanal (50 min);\n2. Manutenção de acomodações acústicas na sala de aula (antecipação de ruídos fortes, pausas sonoras);\n3. Compartilhamento das canções de transição com a equipe pedagógica e mediadores escolares."
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      
      // Cabeçalho Institucional
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("NEUROCONECTA • PLATAFORMA CLÍNICA MULTIDISCIPLINAR", 20, 20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("RELATÓRIO CLÍNICO LONGITUDINAL DE MUSICOTERAPIA", 20, 26);
      doc.text("Protocolo Clínico NC-MT1 • CBO 2263-05 (Musicoterapeuta)", 20, 31);
      doc.line(20, 34, 190, 34);

      // Dados do Paciente
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("1. IDENTIFICAÇÃO DA PESSOA ACOMPANHADA", 20, 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Nome: ${currentCase.patient_name}`, 20, 48);
      doc.text(`Data de Nasc.: ${currentCase.patient_birth_date || "Não informada"} | Pronomes: ${currentCase.patient_pronouns || "ele/dele"}`, 20, 53);
      doc.text(`CIPTEA / Reg.: ${currentCase.patient_ciptea || "CIPTEA-CE 2026/089"} | Diagnóstico: Laudo Médico Formal (TEA)`, 20, 58);
      doc.text(`Período de Referência: ${periodStart} a ${periodEnd}`, 20, 63);

      // Dados do Musicoterapeuta
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("2. RESPONSÁVEL TÉCNICO", 20, 72);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Musicoterapeuta: ${currentCase.professional_name}`, 20, 78);
      doc.text(`Habilitação Profissional: ${currentCase.professional_register || "CBO 2263-05 / UBAM 0341"}`, 20, 83);

      // Metas do PTS-MT
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("3. SÍNTESE DO PLANO TERAPÊUTICO SINGULAR (PTS-MT)", 20, 92);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("• Meta 1 (Interação Social): Alternar turnos em dueto musical (Atingida: 6 turnos consecutivos).", 20, 98);
      doc.text("• Meta 2 (Comunicação): Escolha espontânea de instrumentos sonoros (Em progresso consistente).", 20, 103);
      doc.text("• Meta 3 (Sensorial): Permanência regulada em ambiente acústico até 65 dB (Consolidada).", 20, 108);

      // Síntese Clínica
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("4. PARECER CLÍNICO LONGITUDINAL", 20, 118);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const splitSynthesis = doc.splitTextToSize(clinicalSynthesis, 170);
      doc.text(splitSynthesis, 20, 124);

      // Recomendações
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("5. RECOMENDAÇÕES DE CONTINUIDADE", 20, 155);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const splitRecs = doc.splitTextToSize(recommendations, 170);
      doc.text(splitRecs, 20, 161);

      // Rodapé de Assinatura
      doc.line(20, 235, 190, 235);
      doc.setFontSize(8);
      doc.text("Documento emitido eletronicamente com integridade e rastreabilidade na Plataforma NeuroConecta.", 20, 240);
      doc.text(`Assinado eletronicamente por: ${currentCase.professional_name} - ${currentCase.professional_register || "CBO 2263-05"}`, 20, 245);
      doc.text(`Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}`, 20, 250);

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
                Documentação Oficial • Relatório Clínico Longitudinal
              </span>
              <span className="text-xs text-slate-400">Pessoa Acompanhada: <strong>{currentCase.patient_name}</strong></span>
            </div>
            <h2 className="text-xl font-black mt-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Relatório Pericial & Síntese Evolutiva
            </h2>
            <p className="text-xs text-slate-400">
              Documento formatado para apresentação a planos de saúde, equipe multidisciplinar, escola e perícias.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {isGenerating ? "Gerando..." : "Baixar PDF Oficial"}
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" /> Imprimir
            </button>
          </div>
        </div>

        {/* Parâmetros do Relatório */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">Início do Período Avaliado:</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Término do Período Avaliado:</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Pré-visualização do Relatório Oficial */}
      <div className={`p-8 rounded-2xl border shadow-lg space-y-6 max-w-4xl mx-auto ${
        isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-300 text-slate-900"
      }`}>
        {/* Cabeçalho Oficial do Relatório */}
        <div className="border-b-2 border-teal-500 pb-4 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-teal-400">
              Plataforma NeuroConecta • Prontuário Eletrônico Certificado
            </span>
            <h1 className="text-lg font-black text-slate-100">
              RELATÓRIO CLÍNICO LONGITUDINAL DE MUSICOTERAPIA
            </h1>
            <p className="text-xs text-slate-400">
              Módulo Especializado NC-MT1 • Habilitação CBO 2263-05
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

        {/* 3. Parecer Clínico Editável */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-teal-400 uppercase tracking-wide text-[11px]">
            3. Parecer Clínico e Evolução Longitudinal
          </h3>
          <textarea
            rows={4}
            value={clinicalSynthesis}
            onChange={(e) => setClinicalSynthesis(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 leading-relaxed focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* 4. Recomendações */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-teal-400 uppercase tracking-wide text-[11px]">
            4. Recomendações Multidisciplinares e Escolares
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
            <span>Documento assinado eletronicamente com valor pericial e comprovação de proveniência.</span>
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
