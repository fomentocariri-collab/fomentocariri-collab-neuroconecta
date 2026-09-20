import React, { useState } from "react";
import { 
  X, 
  Printer, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Brain, 
  ShieldCheck, 
  AlertCircle 
} from "lucide-react";
import { PlannedActivity, ActivityApplicationRecord, AssistedUserSummary } from "../../types";

interface ActivityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: PlannedActivity;
  applications: ActivityApplicationRecord[];
  assistedUser?: AssistedUserSummary | null;
  isDark?: boolean;
}

export const ActivityReportModal: React.FC<ActivityReportModalProps> = ({
  isOpen,
  onClose,
  activity,
  applications,
  assistedUser,
  isDark = true,
}) => {
  const [reportType, setReportType] = useState<"individual" | "longitudinal">("individual");

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const latestApp = applications[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-3xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Topo Modal */}
        <div className="no-print p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Relatório Estruturado de Planejamento & Intervenção
              </h3>
              <p className="text-xs text-slate-400">
                Visualização técnica formatada pronta para exportação e impressão
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex text-xs">
              <button
                type="button"
                onClick={() => setReportType("individual")}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  reportType === "individual" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Atividade Atual
              </button>
              <button
                type="button"
                onClick={() => setReportType("longitudinal")}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  reportType === "longitudinal" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Evolução Longitudinal
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold rounded-xl text-xs transition flex items-center gap-1.5 border border-slate-700 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo Imprimível do Relatório */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-950 text-slate-200 print:bg-white print:text-black print:p-0">
          {/* Tarja Obrigatória de Apoio IA */}
          <div className="p-3 bg-amber-950/40 border border-amber-700/60 rounded-xl text-amber-200 text-xs flex items-center gap-2 print:border-black print:text-black">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>AVISO OBRIGATÓRIO:</strong> RASCUNHO GERADO COM APOIO DE SISTEMA INTELIGENTE. REQUER REVISÃO E VALIDAÇÃO TÉCNICA DO PROFISSIONAL RESPONSÁVEL.
            </span>
          </div>

          {/* Cabeçalho Institucional */}
          <div className="border-b border-slate-800 pb-4 space-y-2 print:border-black">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 print:text-black">
                  NeuroConecta • Planejador Multiprofissional
                </span>
                <h2 className="text-lg font-bold text-slate-100 print:text-black">
                  {reportType === "individual"
                    ? `Relatório de Atividade Pedagógica/Terapêutica: ${activity.title}`
                    : `Relatório Longitudinal de Evolução: ${assistedUser?.displayName || activity.assistedUserName || "Aprendente"}`}
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold print:border print:border-black print:text-black">
                Versão {activity.version}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2">
              <div>
                <span className="text-[10px] text-slate-400 block print:text-black font-semibold">Atendido / Aluno:</span>
                <strong className="text-slate-100 print:text-black">
                  {assistedUser?.displayName || activity.assistedUserName || "Turma Geral / Não vinculado"}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block print:text-black font-semibold">Instituição / Turma:</span>
                <span className="text-slate-200 print:text-black">
                  {assistedUser?.institutionName || "Não especificada"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block print:text-black font-semibold">Especialidade:</span>
                <span className="text-slate-200 print:text-black capitalize">
                  {activity.specialty}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block print:text-black font-semibold">Data de Registro:</span>
                <span className="text-slate-200 print:text-black">
                  {new Date(activity.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </div>

          {/* RELATÓRIO INDIVIDUAL */}
          {reportType === "individual" && (
            <div className="space-y-4 text-xs leading-relaxed">
              {/* Objetivo & Componentes */}
              <div className="space-y-1">
                <h4 className="font-bold text-teal-400 print:text-black uppercase text-[11px]">
                  1. Objetivo Pedagógico / Terapêutico
                </h4>
                <p className="p-3 bg-slate-900 rounded-xl border border-slate-800 print:bg-slate-50 print:border-black">
                  {activity.objective}
                </p>
              </div>

              {/* Disciplinas e Processos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activity.disciplines.length > 0 && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 print:bg-slate-50 print:border-black">
                    <strong className="block text-[11px] text-slate-400 print:text-black mb-1">
                      Componentes Curriculares (Interdisciplinar):
                    </strong>
                    <div className="flex flex-wrap gap-1">
                      {activity.disciplines.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-semibold text-[11px] print:border">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activity.learningProcesses.length > 0 && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 print:bg-slate-50 print:border-black">
                    <strong className="block text-[11px] text-slate-400 print:text-black mb-1">
                      Habilidades e Processos Cognitivos:
                    </strong>
                    <div className="flex flex-wrap gap-1">
                      {activity.learningProcesses.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-semibold text-[11px] print:border">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Roteiro Estruturado e Suporte Visual */}
              <div className="space-y-1">
                <h4 className="font-bold text-teal-400 print:text-black uppercase text-[11px]">
                  2. Roteiro Estruturado da Proposta
                </h4>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 print:bg-slate-50 print:border-black">
                  <p><strong>Instruções:</strong> {activity.instructions}</p>
                  <div>
                    <strong>Passo a Passo Previsível:</strong>
                    <ul className="mt-1 space-y-1 pl-3">
                      {activity.stepByStep.map((step, idx) => (
                        <li key={idx} className="list-disc">{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Adaptações e DUA */}
              <div className="space-y-1">
                <h4 className="font-bold text-teal-400 print:text-black uppercase text-[11px]">
                  3. Acessibilidade e Desenho Universal (DUA)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 print:bg-slate-50 print:border-black">
                    <strong>Adaptações Metodológicas:</strong>
                    <ul className="mt-1 space-y-0.5 pl-3">
                      {activity.adaptations.map((a, i) => (
                        <li key={i} className="list-disc">{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 print:bg-slate-50 print:border-black">
                    <strong>Recursos Ambientais e Sensoriais:</strong>
                    <ul className="mt-1 space-y-0.5 pl-3">
                      {activity.environmentalAdaptations.map((a, i) => (
                        <li key={i} className="list-disc">{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Registro de Aplicação Real se houver */}
              {latestApp && (
                <div className="space-y-1 pt-2 border-t border-slate-800 print:border-black">
                  <h4 className="font-bold text-teal-400 print:text-black uppercase text-[11px]">
                    4. Registro da Aplicação Real ({latestApp.appliedDate})
                  </h4>
                  <div className="p-4 bg-teal-950/30 border border-teal-800/60 rounded-xl space-y-2 print:bg-white print:border-black">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block print:text-black">Nível de Apoio Real:</span>
                        <strong className="text-teal-300 print:text-black">{latestApp.supportLevel}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block print:text-black">Engajamento:</span>
                        <strong className="text-teal-300 print:text-black">{latestApp.engagementScore} de 5</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block print:text-black">Duração Real:</span>
                        <strong className="text-teal-300 print:text-black">{latestApp.actualDurationMinutes} min</strong>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block print:text-black">Estratégias que Ajudaram:</span>
                      <p>{latestApp.strategiesWorked.join(", ") || "Conforme planejado"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block print:text-black">Parecer / Observação Técnica:</span>
                      <p className="italic">{latestApp.observations}</p>
                    </div>
                    {latestApp.learnerFeedback && (
                      <div className="pt-2 border-t border-teal-900/60 print:border-slate-300">
                        <span className="text-[10px] text-slate-400 block print:text-black font-semibold">
                          Escuta e Feedback Participativo do Aprendente:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1 text-[11px]">
                          {latestApp.learnerFeedback.whatHelped && (
                            <p><strong>O que ajudou:</strong> {latestApp.learnerFeedback.whatHelped}</p>
                          )}
                          {latestApp.learnerFeedback.whatWasHard && (
                            <p><strong>O que foi difícil:</strong> {latestApp.learnerFeedback.whatWasHard}</p>
                          )}
                          {latestApp.learnerFeedback.understood && (
                            <p><strong>Compreendeu a proposta:</strong> {latestApp.learnerFeedback.understood}</p>
                          )}
                          {latestApp.learnerFeedback.whatHelpWasUseful && (
                            <p><strong>Ajuda mais útil:</strong> {latestApp.learnerFeedback.whatHelpWasUseful}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RELATÓRIO LONGITUDINAL */}
          {reportType === "longitudinal" && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 print:bg-slate-50 print:border-black space-y-2">
                <h4 className="font-bold text-teal-400 print:text-black uppercase text-[11px]">
                  Síntese da Trajetória Pedagógica e Apoios
                </h4>
                <p>
                  Total de atividades registradas para este aprendente: <strong>{applications.length + 1}</strong>.
                  O histórico demonstra a resposta às adaptações e a consolidação de rotinas com menor sobrecarga sensorial.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-200 print:text-black">
                  Histórico de Aplicações e Curva de Mediação
                </h5>
                {applications.length === 0 ? (
                  <p className="text-slate-400 italic">
                    Nenhuma aplicação registrada até o momento. O relatório longitudinal será atualizado conforme novas atividades forem concluídas.
                  </p>
                ) : (
                  applications.map((app) => (
                    <div key={app.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 print:border-black flex justify-between items-center">
                      <div>
                        <strong>{app.activityTitle}</strong>
                        <p className="text-[11px] text-slate-400 print:text-black">
                          {app.appliedDate} • Apoio: <span className="text-teal-300 print:text-black font-semibold">{app.supportLevel}</span>
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold">
                        Engajamento {app.engagementScore}/5
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Assinatura Técnica */}
          <div className="pt-6 border-t border-slate-800 print:border-black flex justify-between items-end text-[11px] text-slate-400 print:text-black">
            <div>
              <p>Documento emitido pelo ecossistema NeuroConecta.</p>
              <p>Validação requer assinatura do profissional habilitado.</p>
            </div>
            <div className="text-center w-56 border-t border-slate-600 pt-1">
              <p className="font-bold text-slate-200 print:text-black">
                {activity.professionalName || "Profissional Responsável"}
              </p>
              <p className="text-[10px]">Registro Profissional / Habilitação</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
