import React, { useState } from "react";
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  BookOpen, 
  BarChart3, 
  ShieldCheck, 
  Brain, 
  Award, 
  Sparkles,
  Layers,
  ChevronRight
} from "lucide-react";
import neuroconectaLogo from "../assets/logo";
import { generateAcademicReviewPdf } from "../utils/pdfGenerator";

export const AcademicReviewModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadArticle = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Estudo de Caso & Artigo Técnico - NeuroConecta</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 28px; line-height: 1.6; background-color: #ffffff; }
    .header { border-bottom: 2px solid #7c3aed; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 11px; font-weight: bold; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; }
    h1 { font-size: 20px; margin: 4px 0; color: #0f172a; }
    .badge-box { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-weight: bold; color: #5b21b6; }
    .section-title { font-size: 14px; font-weight: bold; color: #5b21b6; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
    th { background: #f1f5f9; text-align: left; padding: 8px 12px; border-bottom: 2px solid #cbd5e1; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    p { font-size: 13px; text-align: justify; margin-bottom: 10px; }
    ul { font-size: 13px; margin-top: 4px; }
    @media print { body { margin: 10mm; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">NEUROCONECTA — TECNOLOGIA ASSISTIVA & ACESSIBILIDADE</div>
      <h1>DOCUMENTO TÉCNICO-CIENTÍFICO</h1>
      <p style="font-size: 11px; color: #64748b; margin: 0;">SISTEMASTOP Soluções Tecnológicas & Fomento Cariri | Crato - CE</p>
    </div>
    <div style="text-align: right; font-size: 11px; color: #475569;">
      <p><strong>Natureza:</strong> Estudo de Caso por Amostragem</p>
      <p><strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
    </div>
  </div>

  <div class="badge-box">
    NeuroConecta: Plataforma de Tecnologia Assistiva, Interação Humano-Computador Acessível e Suporte Funcional à Autonomia Neurodivergente
  </div>

  <div class="section-title">1. Resumo Técnico &amp; Enquadramento em Tecnologia Assistiva</div>
  <p>O <strong>NeuroConecta</strong> é uma plataforma digital de Tecnologia Assistiva (TA) orientada à Interação Humano-Computador (IHC) acessível e ao apoio funcional de pessoas neurodivergentes (especialmente indivíduos no espectro autista e com TDAH), suas famílias, cuidadores e educadores.</p>
  <p>O projeto fundamenta-se nos princípios do Desenho Universal para a Aprendizagem (DUA) e no modelo social da deficiência, priorizando recursos de comunicação aumentativa e alternativa (CAA), suporte à organização executiva por rotinas visuais, autorregulação sensorial e registro estruturado de necessidades educacionais (PEI), sem exercer atividade diagnóstica privativa de profissionais de saúde.</p>

  <div class="section-title">2. Objetivos do Projeto &amp; Escopo Funcional</div>
  <p><strong>2.1. Objetivo Geral:</strong> Disponibilizar ferramentas interativas e de baixo atrito sensorial que promovam previsibilidade, autonomia cotidiana e colaboração entre o indivíduo, sua rede de apoio familiar e o contexto educacional inclusivo.</p>
  <p><strong>2.2. Escopo Funcional Ativo:</strong></p>
  <ul>
    <li><strong>Apoio à Comunicação (CAA):</strong> Pranchas visuais com síntese vocal para facilitar a expressão autônoma.</li>
    <li><strong>Estruturação e Previsibilidade:</strong> Rotina visual sequenciada, temporizadores e monitoramento de humor para redução de sobrecarga executiva.</li>
    <li><strong>Acomodação Sensorial:</strong> Paisagens sonoras, ruídos confortáveis e exercícios de desaceleração motora e respiratória.</li>
    <li><strong>Mediação Pedagógica (PEI &amp; DUA):</strong> Minutas colaborativas de adaptações curriculares para diálogo entre escola e família.</li>
    <li><strong>Integridade de Dados:</strong> Sínteses funcionais geradas exclusivamente a partir de dados reais inseridos, com proibição estrita de inferências automatizadas.</li>
  </ul>

  <div class="section-title">3. Módulos Funcionais e Contribuições à Acessibilidade</div>
  <table>
    <thead>
      <tr>
        <th>Recurso / Módulo</th>
        <th>Finalidade &amp; Impacto Acessível</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Comunicação Alternativa (CAA)</strong></td>
        <td>Pranchas personalizadas com pictogramas e vocalização para suporte à comunicação espontânea.</td>
      </tr>
      <tr>
        <td><strong>Rotina Visual &amp; Temporizadores</strong></td>
        <td>Sequenciamento passo a passo com feedback de progresso para apoiar funções executivas.</td>
      </tr>
      <tr>
        <td><strong>Sensorial &amp; Paisagens Sonoras</strong></td>
        <td>Mapeamento de gatilhos ambientais, ruídos terapêuticos e estratégias de descompressão.</td>
      </tr>
      <tr>
        <td><strong>Autoavaliação &amp; Escalas</strong></td>
        <td>Instrumentos padronizados de autorrelato (AQ-10, SQ-EQ, CAT-Q) para reflexão e apoio a encaminhamentos.</td>
      </tr>
      <tr>
        <td><strong>Apoio a Cuidadores &amp; PEI</strong></td>
        <td>Registro colaborativo de acomodações DUA, metas funcionais e histórico de adaptações escolares.</td>
      </tr>
      <tr>
        <td><strong>Síntese Funcional &amp; Relatórios</strong></td>
        <td>Exportação estruturada de rotinas e autorrelatos com rigor de proveniência de dados.</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">4. Considerações Finais &amp; Referências Teóricas</div>
  <p>O NeuroConecta consolida-se como estudo de caso relevante em tecnologia assistiva e design inclusivo. Ao separar com clareza o suporte de rotina da intervenção médica privativa, o sistema fornece uma ferramenta ética, acessível e segura, respaldada pelas diretrizes internacionais da Convenção sobre os Direitos das Pessoas com Deficiência (ONU), pelas normas do Desenho Universal e pelos marcos teóricos da neurodiversidade.</p>

  <div style="margin-top: 30px; padding-top: 14px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
    <div>SISTEMASTOP Soluções Tecnológicas &amp; Fomento Cariri | Crato - CE</div>
    <div>Validação Técnica &bull; NeuroConecta Assistive Tech</div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `estudo_de_caso_neuroconecta_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-violet-700/80 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header (No print) */}
        <div className="no-print p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-violet-950 to-slate-950 border-b border-violet-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-900/60 border border-violet-600/60 rounded-2xl text-violet-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-violet-900/80 text-violet-300 rounded-full border border-violet-700">
                  Estudo de Caso & Artigo Técnico
                </span>
                <span className="text-[10px] text-violet-400 font-mono">PDF Pronto</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Resenha Acadêmica & Estudo de Caso NeuroConecta
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => generateAcademicReviewPdf()}
              className="px-4 py-2 bg-violet-700 hover:bg-violet-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition"
              title="Baixar artigo em PDF autêntico (MIME: application/pdf)"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Baixar PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition"
              title="Imprimir visualização limpa do artigo no navegador"
            >
              <Printer className="w-4 h-4 text-violet-400" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Scrollable Printable Article Content */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-slate-950 print:bg-white print:text-black print:p-8 print:overflow-visible">
          
          {/* Printable Document Header */}
          <div className="border-b-2 border-violet-800/80 print:border-slate-800 pb-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={neuroconectaLogo}
                  alt="NeuroConecta Logo"
                  className="w-16 h-16 object-contain rounded-xl p-1 bg-white border border-violet-800"
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-slate-900">
                    NEUROCONECTA
                  </h1>
                  <p className="text-xs text-violet-400 print:text-violet-800 font-bold uppercase tracking-wider">
                    Plataforma Integrada de Tecnologia Assistiva &amp; Acessibilidade
                  </p>
                  <p className="text-[11px] text-slate-400 print:text-slate-600">
                    SISTEMASTOP Soluções Tecnológicas &amp; Fomento Cariri
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400 print:text-slate-600 space-y-0.5">
                <p className="font-bold text-violet-300 print:text-violet-900">DOCUMENTO TÉCNICO-CIENTÍFICO</p>
                <p>Natureza: Estudo de Caso por Amostragem</p>
                <p>Data: {new Date().toLocaleDateString("pt-BR")}</p>
                <p>Local: Crato - CE, Brasil</p>
              </div>
            </div>

            <div className="p-4 bg-violet-950/60 print:bg-slate-100 border border-violet-800/80 print:border-slate-300 rounded-2xl">
              <h2 className="text-sm sm:text-base font-bold text-violet-200 print:text-slate-900 leading-snug">
                NeuroConecta: Plataforma de Tecnologia Assistiva, Interação Humano-Computador Acessível e Suporte Funcional à Autonomia Neurodivergente
              </h2>
            </div>
          </div>

          {/* 1. Resumo Técnico e Enquadramento */}
          <section className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-violet-400 print:text-violet-900 flex items-center gap-2 border-b border-slate-800 print:border-slate-300 pb-1">
              <span className="p-1 bg-violet-950 print:bg-slate-200 rounded">1</span>
              <span>Resumo Técnico &amp; Enquadramento em Tecnologia Assistiva</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 print:text-slate-800 leading-relaxed text-justify">
              O <strong>NeuroConecta</strong> é uma plataforma digital de Tecnologia Assistiva (TA) orientada à Interação Humano-Computador (IHC) acessível e ao apoio funcional de pessoas neurodivergentes (especialmente indivíduos no espectro autista e com TDAH), suas famílias, cuidadores e educadores.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 print:text-slate-800 leading-relaxed text-justify">
              O projeto fundamenta-se nos princípios do Desenho Universal para a Aprendizagem (DUA) e no modelo social da deficiência, priorizando recursos de comunicação aumentativa e alternativa (CAA), suporte à organização executiva por rotinas visuais, autorregulação sensorial e registro estruturado de necessidades educacionais (PEI), sem exercer atividade diagnóstica privativa de profissionais de saúde.
            </p>
          </section>

          {/* 2. Objetivos e Distinção de Escopo */}
          <section className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-violet-400 print:text-violet-900 flex items-center gap-2 border-b border-slate-800 print:border-slate-300 pb-1">
              <span className="p-1 bg-violet-950 print:bg-slate-200 rounded">2</span>
              <span>Objetivos do Projeto &amp; Distinção de Escopo</span>
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-slate-300 print:text-slate-800 leading-relaxed">
              <p><strong>2.1. Objetivo Geral:</strong> Disponibilizar ferramentas interativas e de baixo atrito sensorial que promovam previsibilidade, autonomia cotidiana e colaboração entre o indivíduo, sua rede de apoio familiar e o contexto educacional inclusivo.</p>
              <p><strong>2.2. Objetivos Específicos e Escopo Funcional:</strong></p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300 print:text-slate-700 text-xs sm:text-sm">
                <li><strong>Apoio à Comunicação (CAA):</strong> Pranchas visuais com síntese de voz para facilitar a expressão de vontades, necessidades e limites sensoriais.</li>
                <li><strong>Estruturação e Previsibilidade:</strong> Rotina visual sequenciada, temporizadores e diário de humor para redução de sobrecarga em transições de tarefas.</li>
                <li><strong>Acomodação Sensorial:</strong> Paisagens sonoras, ruídos neutros (branco, marrom, rosa) e exercícios de desaceleração motora e respiratória.</li>
                <li><strong>Mediação Pedagógica (PEI &amp; DUA):</strong> Minutas colaborativas de adaptações curriculares e acomodações ambientais para diálogo entre escola e família.</li>
                <li><strong>Integridade e Proveniência de Dados:</strong> Sínteses funcionais geradas exclusivamente a partir de dados reais inseridos, com proibição estrita de inferências diagnósticas automatizadas.</li>
              </ul>
            </div>
          </section>

          {/* 3. Avaliação de Usabilidade e Proposta de Uso */}
          <section className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-violet-400 print:text-violet-900 flex items-center gap-2 border-b border-slate-800 print:border-slate-300 pb-1">
              <span className="p-1 bg-violet-950 print:bg-slate-200 rounded">3</span>
              <span>Metodologia, Proposta de Uso &amp; Usabilidade Acessível</span>
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-300 print:text-slate-800 leading-relaxed text-justify">
              O desenvolvimento do NeuroConecta adota ciclos iterativos de IHC voltados à neurodiversidade. A proposta de uso centraliza-se na redução do esforço cognitivo através de navegação direta, opções visuais em pranchas, temas de alto contraste com controle de luminosidade e linguagem clara.
            </p>

            {/* Destaque dos Indicadores de Usabilidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3">
              <div className="p-4 bg-violet-950/80 print:bg-slate-100 border border-violet-700/80 print:border-slate-400 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-300 print:text-violet-900 uppercase">Aderência aos Princípios DUA</span>
                  <span className="px-2 py-0.5 bg-violet-900 text-violet-200 text-xs font-extrabold rounded-lg">Múltiplos Meios</span>
                </div>
                <p className="text-2xl font-black text-white print:text-slate-900">Acessibilidade Total</p>
                <p className="text-[11px] text-slate-300 print:text-slate-600">
                  Apoio visual, textual e auditivo para engajamento, representação e expressão.
                </p>
              </div>

              <div className="p-4 bg-slate-900 print:bg-slate-100 border border-slate-700 print:border-slate-400 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 print:text-indigo-900 uppercase">Usabilidade Subjetiva</span>
                  <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 text-xs font-extrabold rounded-lg">Baixa Fricção</span>
                </div>
                <p className="text-2xl font-black text-white print:text-slate-900">Design Confortável</p>
                <p className="text-[11px] text-slate-300 print:text-slate-600">
                  Previsibilidade espacial, contraste ajustado e prevenção de sobrecargas sensoriais.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-slate-300 print:text-slate-800 leading-relaxed text-justify">
              <p>
                <strong>Benefícios Potenciais e Limites:</strong> Observa-se que a organização visual do tempo e a disponibilidade de recursos sensoriais contribuem favoravelmente para a autorregulação e a comunicação funcional. Contudo, a literatura e as boas práticas de tecnologia assistiva ressaltam que softwares dessa natureza constituem instrumentos de apoio cotidiano e não substituem o acompanhamento clínico, fonoaudiológico, psicológico ou pedagógico especializado.
              </p>
            </div>
          </section>

          {/* 4. Estrutura Modular Ativa */}
          <section className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-violet-400 print:text-violet-900 flex items-center gap-2 border-b border-slate-800 print:border-slate-300 pb-1">
              <span className="p-1 bg-violet-950 print:bg-slate-200 rounded">4</span>
              <span>Módulos Funcionais e Contribuições à Acessibilidade</span>
            </h3>

            <div className="border border-slate-800 print:border-slate-300 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 print:bg-slate-200 text-slate-200 print:text-slate-900 font-bold">
                  <tr>
                    <th className="p-2.5 border-b border-slate-800 print:border-slate-300">Recurso / Módulo</th>
                    <th className="p-2.5 border-b border-slate-800 print:border-slate-300">Finalidade &amp; Impacto Acessível</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-300 text-slate-300 print:text-slate-700">
                  <tr>
                    <td className="p-2.5 font-bold text-violet-300 print:text-slate-900">Comunicação Alternativa (CAA)</td>
                    <td className="p-2.5">Pranchas personalizadas com pictogramas e vocalização para suporte à comunicação espontânea.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-violet-300 print:text-slate-900">Rotina Visual &amp; Temporizadores</td>
                    <td className="p-2.5">Sequenciamento passo a passo com feedback de progresso para apoiar funções executivas e previsibilidade.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-violet-300 print:text-slate-900">Sensorial &amp; Sons Confortáveis</td>
                    <td className="p-2.5">Mapeamento de gatilhos ambientais, ruídos terapêuticos e estratégias de descompressão.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-violet-300 print:text-slate-900">Autoavaliação &amp; Escalas de Rastreio</td>
                    <td className="p-2.5">Instrumentos padronizados de autorrelato (AQ-10, ASRS, CAT-Q) para reflexão e apoio a encaminhamentos.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-violet-300 print:text-slate-900">Apoio a Cuidadores &amp; Minuta PEI</td>
                    <td className="p-2.5">Registro colaborativo de acomodações DUA, metas funcionais e histórico de adaptações escolares.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-violet-300 print:text-slate-900">Síntese Funcional &amp; Relatórios</td>
                    <td className="p-2.5">Exportação estruturada de rotinas e autorrelatos com rigor de proveniência de dados.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. Considerações Finais e Fundamentação Científica */}
          <section className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-violet-400 print:text-violet-900 flex items-center gap-2 border-b border-slate-800 print:border-slate-300 pb-1">
              <span className="p-1 bg-violet-950 print:bg-slate-200 rounded">5</span>
              <span>Considerações Finais &amp; Referências Teóricas</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 print:text-slate-800 leading-relaxed text-justify">
              O <strong>NeuroConecta</strong> consolida-se como estudo de caso relevante em tecnologia assistiva e design inclusivo. Ao separar com clareza o suporte de rotina da intervenção médica privativa, o sistema fornece uma ferramenta ética, acessível e segura, respaldada pelas diretrizes internacionais da Convenção sobre os Direitos das Pessoas com Deficiência (ONU), pelas normas do Desenho Universal e pelos marcos teóricos da neurodiversidade (Singer, 1999; CAST, 2018; Beukelman &amp; Light, 2020).
            </p>
          </section>

          {/* Footer of the Printable Document */}
          <div className="pt-6 border-t border-slate-800 print:border-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 print:text-slate-600">
            <div>
              <p className="font-bold text-slate-200 print:text-slate-800">SISTEMASTOP Soluções Tecnológicas &amp; Fomento Cariri</p>
              <p>Rua Doutor Rolim, 366 - Bairro Independência, Crato - CE | +55 (88) 99673-9128</p>
            </div>
            <div className="text-right">
              <p>Validação Técnica &bull; NeuroConecta Digital Assistive Technology</p>
              <p>Código do Relatório: NC-EST-2026-RAADS64</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
