import React, { useMemo } from "react";
import { 
  FileCheck2, 
  Target, 
  Calendar, 
  HeartHandshake, 
  AlertTriangle, 
  CheckCircle2, 
  ClipboardList, 
  FileText, 
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Layers,
  Sparkles
} from "lucide-react";
import { PsychologyTherapeuticProcess } from "../../types";

interface PsychologyProcessClinicalSummaryProps {
  process: PsychologyTherapeuticProcess;
  patientDisplayName: string;
  isDark?: boolean;
}

export const PsychologyProcessClinicalSummary: React.FC<PsychologyProcessClinicalSummaryProps> = ({
  process,
  patientDisplayName,
  isDark = true,
}) => {
  // 1. Processar dados estruturados de check-in
  const checkInSummary = useMemo(() => {
    const list = [...process.processCheckIns].sort((a, b) => {
      const timeA = new Date(a.date || a.createdAt || "").getTime();
      const timeB = new Date(b.date || b.createdAt || "").getTime();
      return timeA - timeB;
    });

    const count = list.length;
    if (count === 0) {
      return {
        count: 0,
        avg: 0,
        avgVinculo: 0,
        avgSentido: 0,
        avgMetas: 0,
        avgTarefas: 0,
        firstDate: null,
        lastDate: null,
        delta: 0,
        firstGeneral: 0,
        lastGeneral: 0,
        notesWithFeedback: 0,
      };
    }

    const sumVinculo = list.reduce((a, b) => a + b.feltHeardScore, 0);
    const sumSentido = list.reduce((a, b) => a + b.sessionMadeSenseScore, 0);
    const sumMetas = list.reduce((a, b) => a + b.understoodGoalsScore, 0);
    const sumTarefas = list.reduce((a, b) => a + b.taskFeasibleScore, 0);

    const avgVinculo = Number((sumVinculo / count).toFixed(1));
    const avgSentido = Number((sumSentido / count).toFixed(1));
    const avgMetas = Number((sumMetas / count).toFixed(1));
    const avgTarefas = Number((sumTarefas / count).toFixed(1));
    const avg = Number(((avgVinculo + avgSentido + avgMetas + avgTarefas) / 4).toFixed(1));

    const first = list[0];
    const last = list[count - 1];
    const firstGeneral = Number(((first.feltHeardScore + first.sessionMadeSenseScore + first.understoodGoalsScore + first.taskFeasibleScore) / 4).toFixed(1));
    const lastGeneral = Number(((last.feltHeardScore + last.sessionMadeSenseScore + last.understoodGoalsScore + last.taskFeasibleScore) / 4).toFixed(1));
    const delta = Number((lastGeneral - firstGeneral).toFixed(1));

    const notesWithFeedback = list.filter(c => Boolean(c.openMessageForTherapist?.trim())).length;

    return {
      count,
      avg,
      avgVinculo,
      avgSentido,
      avgMetas,
      avgTarefas,
      firstDate: first.date,
      lastDate: last.date,
      delta,
      firstGeneral,
      lastGeneral,
      notesWithFeedback,
    };
  }, [process.processCheckIns]);

  // 2. Metas Colaborativas
  const goalsSummary = useMemo(() => {
    const total = process.collaborativeGoals.length;
    const active = process.collaborativeGoals.filter(g => g.status === "ativo").length;
    const highPriority = process.collaborativeGoals.filter(g => g.priority === "alta").length;
    const withReview = process.collaborativeGoals.filter(g => Boolean(g.reviewDate)).length;
    return { total, active, highPriority, withReview };
  }, [process.collaborativeGoals]);

  // 3. Agendas de Sessão
  const agendaSummary = useMemo(() => {
    const total = process.sessionAgendas.length;
    const latest = total > 0 ? process.sessionAgendas[0] : null;
    return { total, latest };
  }, [process.sessionAgendas]);

  // 4. Recursos Entre Sessões
  const activitiesSummary = useMemo(() => {
    const total = process.interSessionActivities.length;
    const agreedCount = process.interSessionActivities.filter(a => a.wasAgreedInSession).length;
    const understoodCount = process.interSessionActivities.filter(a => a.patientUnderstandsGoal).length;
    return { total, agreedCount, understoodCount };
  }, [process.interSessionActivities]);

  // 5. Rupturas & Sinais de Atenção
  const rupturesSummary = useMemo(() => {
    const total = process.ruptureAlerts.length;
    const discussed = process.ruptureAlerts.filter(r => r.wasDiscussedInSession).length;
    const pendingReview = process.ruptureAlerts.filter(r => r.reviewInNextSession).length;
    const managedCount = process.ruptureAlerts.filter(r => Boolean(r.clinicalManagementNotes?.trim())).length;
    return { total, discussed, pendingReview, managedCount };
  }, [process.ruptureAlerts]);

  return (
    <div className="space-y-6">
      {/* Header do Resumo Clínico */}
      <div
        className={`p-6 rounded-2xl border shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Síntese Funcional do Prontuário
              </span>
              <span className="text-xs text-slate-400">
                Pessoa Acompanhada: <strong className="text-indigo-300">{patientDisplayName || process.patientName}</strong>
              </span>
            </div>
            <h3 className="text-lg font-black mt-1 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-400" />
              Resumo do Processo Terapêutico
            </h3>
            <p className="text-xs text-slate-400">
              Leitura profissional estruturada baseada exclusivamente nos registros documentados no sistema.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 block">Abordagem Vinculada:</span>
            <span className="text-xs font-bold text-indigo-300">{process.therapeuticApproach}</span>
          </div>
        </div>

        {/* Quadro Sinóptico Estrutural */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 text-xs">
          <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 block text-[11px]">Metas Colaborativas</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-slate-100">{goalsSummary.active} ativas</span>
              <span className="text-[10px] text-slate-500">de {goalsSummary.total}</span>
            </div>
            <span className="text-[10px] text-indigo-400 block mt-1">
              {goalsSummary.highPriority} de alta prioridade
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 block text-[11px]">Agendas Construídas</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-slate-100">{agendaSummary.total}</span>
              <span className="text-[10px] text-slate-500">sessões com pauta</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {agendaSummary.latest ? `Última em ${agendaSummary.latest.sessionDate}` : "Sem agenda registrada"}
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 block text-[11px]">Recursos / Tarefas</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-slate-100">{activitiesSummary.total}</span>
              <span className="text-[10px] text-slate-500">combinadas</span>
            </div>
            <span className="text-[10px] text-emerald-400 block mt-1">
              {activitiesSummary.understoodCount}/{activitiesSummary.total} com compreensão confirmada
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-400 block text-[11px]">Rupturas & Ajustes</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-slate-100">{rupturesSummary.total}</span>
              <span className="text-[10px] text-slate-500">registradas</span>
            </div>
            <span className="text-[10px] text-amber-400 block mt-1">
              {rupturesSummary.managedCount}/{rupturesSummary.total} com manejo documentado
            </span>
          </div>
        </div>
      </div>

      {/* 2. LEITURA CLÍNICA INTEGRADA: DADOS OBJETIVOS VS REGISTRO PROFISSIONAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel Esquerdo: DADOS OBJETIVOS DO PROCESSO */}
        <div
          className={`p-6 rounded-2xl border space-y-4 ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              1. Dados Objetivos do Processo
            </h4>
            <span className="text-[10px] bg-indigo-950 border border-indigo-800 text-indigo-300 px-2 py-0.5 rounded-full">
              Fatos Registrados
            </span>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            {/* Parágrafo de Período e Check-ins */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-300">Tempo de Processo e Escuta:</span>
              <p className="text-slate-400">
                Início do acompanhamento em <strong className="text-slate-200">{process.startDate}</strong>. 
                {checkInSummary.count > 0 ? (
                  <>
                    {" "}Foram registrados <strong className="text-slate-200">{checkInSummary.count}</strong> check-ins de processo
                    {checkInSummary.firstDate && checkInSummary.lastDate && (
                      <> entre <strong className="text-slate-200">{checkInSummary.firstDate}</strong> e <strong className="text-slate-200">{checkInSummary.lastDate}</strong></>
                    )}.
                  </>
                ) : (
                  " Nenhum check-in de processo registrado até o momento."
                )}
              </p>
            </div>

            {/* Parágrafo de Métricas das 4 Dimensões */}
            {checkInSummary.count > 0 && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-300">Média Geral e Comportamento por Dimensão:</span>
                <p className="text-slate-400">
                  A média geral da aliança no período é de <strong className="text-rose-400">{checkInSummary.avg} / 5.0</strong>.
                </p>
                <ul className="space-y-1 text-[11px] text-slate-300 pt-1">
                  <li className="flex items-center justify-between">
                    <span>• Vínculo e Percepção de Escuta:</span>
                    <strong className="text-indigo-400">{checkInSummary.avgVinculo} / 5.0</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>• Sentido e Relevância da Sessão:</span>
                    <strong className="text-cyan-400">{checkInSummary.avgSentido} / 5.0</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>• Clareza dos Objetivos Terapêuticos:</span>
                    <strong className="text-purple-400">{checkInSummary.avgMetas} / 5.0</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>• Viabilidade das Tarefas Entre Sessões:</span>
                    <strong className="text-emerald-400">{checkInSummary.avgTarefas} / 5.0</strong>
                  </li>
                </ul>

                {checkInSummary.count >= 2 && (
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    Variação entre primeiro ({checkInSummary.firstGeneral}) e último registro ({checkInSummary.lastGeneral}):{" "}
                    <strong className={checkInSummary.delta >= 0 ? "text-emerald-400" : "text-amber-400"}>
                      {checkInSummary.delta >= 0 ? `+${checkInSummary.delta}` : checkInSummary.delta} pontos
                    </strong>.
                  </p>
                )}
              </div>
            )}

            {/* Parágrafo de Objetivos e Tarefas */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-300">Colaboração e Atividades Combinadas:</span>
              <p className="text-slate-400">
                Atualmente constam <strong className="text-slate-200">{goalsSummary.active}</strong> objetivos colaborativos ativos.
                {activitiesSummary.total > 0 ? (
                  <>
                    {" "}Foram planejadas <strong className="text-slate-200">{activitiesSummary.total}</strong> atividades entre sessões,
                    com registro de consenso em sessão e compreensão do objetivo pelo paciente.
                  </>
                ) : (
                  " Nenhuma tarefa entre sessões foi associada ao plano até o momento."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Painel Direito: REGISTRO CLÍNICO DO PROFISSIONAL */}
        <div
          className={`p-6 rounded-2xl border space-y-4 ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              2. Registro Clínico Documentado
            </h4>
            <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full">
              Notas Terapêuticas
            </span>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            {/* Metas Prioritárias em Andamento */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300">Metas Prioritárias em Acompanhamento:</span>
              {process.collaborativeGoals.length === 0 ? (
                <p className="text-slate-500 italic text-[11px]">Nenhuma meta formulada no plano.</p>
              ) : (
                <ul className="space-y-1.5 text-[11px]">
                  {process.collaborativeGoals.slice(0, 3).map((g) => (
                    <li key={g.id} className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-indigo-300 font-semibold">
                        <span>Prioridade {g.priority}</span>
                        {g.reviewDate && <span className="text-slate-500 text-[10px]">Revisão: {g.reviewDate}</span>}
                      </div>
                      <p className="text-slate-300 mt-0.5">{g.description}</p>
                      {g.notes && <p className="text-slate-400 text-[10px] mt-0.5 italic">Obs: {g.notes}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Sinais de Ruptura e Manejo Terapêutico */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300">Rupturas e Ajustes Clínicos Documentados:</span>
              {process.ruptureAlerts.length === 0 ? (
                <p className="text-slate-400 text-[11px]">
                  Nenhum episódio de ruptura ou desacordo foi documentado. O processo mantém alinhamento comunicativo estável.
                </p>
              ) : (
                <div className="space-y-2 text-[11px]">
                  {process.ruptureAlerts.map((rup) => (
                    <div key={rup.id} className="p-2.5 bg-amber-950/20 border border-amber-900/50 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 capitalize">{rup.alertType.replace("_", " ")}</span>
                        <span className="text-slate-500 text-[10px]">{rup.date}</span>
                      </div>
                      <p className="text-slate-300">{rup.description}</p>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-amber-950">
                        <strong className="text-amber-400">Manejo Clínico:</strong> {rup.clinicalManagementNotes}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mensagens e devolutivas qualitativas do paciente */}
            {checkInSummary.notesWithFeedback > 0 && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-300">Mensagens e Devolutivas Abertas do Paciente:</span>
                <div className="space-y-1 text-[11px] text-slate-300">
                  {process.processCheckIns
                    .filter((c) => Boolean(c.openMessageForTherapist?.trim()))
                    .slice(0, 2)
                    .map((c) => (
                      <blockquote key={c.id} className="p-2 bg-slate-900 rounded-lg border-l-2 border-indigo-500 italic text-slate-300">
                        "{c.openMessageForTherapist}"
                        <span className="text-[10px] text-slate-500 block not-italic mt-0.5">— Check-in de {c.date}</span>
                      </blockquote>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rodapé Informativo: Princípio Ético e Não-Diagnóstico */}
      <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Este resumo compila dados descritivos reais do processo terapêutico. O sistema não formula hipóteses diagnósticas automáticas nem prognósticos.
          </span>
        </div>
      </div>
    </div>
  );
};
