import React from "react";
import { User, Users, ArrowRightLeft, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { AssistedUserSummary, PlannerMode } from "../../types";

interface PlannerHeaderProps {
  selectedUser: AssistedUserSummary | null;
  onOpenSelectUserModal: () => void;
  plannerMode: PlannerMode;
  onSelectPlannerMode: (mode: PlannerMode) => void;
  isDark?: boolean;
}

export const PlannerHeader: React.FC<PlannerHeaderProps> = ({
  selectedUser,
  onOpenSelectUserModal,
  plannerMode,
  onSelectPlannerMode,
  isDark = true,
}) => {
  const getModeLabel = (mode: PlannerMode) => {
    switch (mode) {
      case "escolar":
        return { label: "Planejamento Escolar", sub: "Componentes curriculares, interdisciplinaridade e DUA", color: "text-emerald-400 bg-emerald-950/60 border-emerald-800" };
      case "psicopedagogia":
        return { label: "Planejamento Psicopedagógico", sub: "Processos de aprendizagem, funções executivas e metas SMART", color: "text-amber-400 bg-amber-950/60 border-amber-800" };
      case "psicologia":
        return { label: "Recursos para Psicologia & Aliança", sub: "Processo terapêutico colaborativo, TCC e atividades entre sessões", color: "text-indigo-400 bg-indigo-950/60 border-indigo-800" };
      case "aee":
        return { label: "Planejamento AEE / Ed. Especial", sub: "Tecnologia assistiva, eliminação de barreiras e recursos táteis", color: "text-teal-400 bg-teal-950/60 border-teal-800" };
    }
  };

  const modeInfo = getModeLabel(plannerMode);

  return (
    <div className="space-y-3">
      {/* Barra de Seleção de Usuário (Requisito Central: Pinçar Usuário por ID) */}
      <div
        className={`p-4 rounded-2xl border transition-all shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
          selectedUser
            ? isDark
              ? "bg-slate-900/90 border-teal-600/60 text-slate-100"
              : "bg-teal-50/80 border-teal-300 text-teal-950"
            : isDark
            ? "bg-slate-900/60 border-dashed border-slate-700 text-slate-300"
            : "bg-slate-100/90 border-dashed border-slate-300 text-slate-700"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              selectedUser
                ? "bg-teal-500/20 border-teal-500/40 text-teal-400"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            {selectedUser ? <User className="w-6 h-6" /> : <Users className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-teal-400">
                {selectedUser ? "PLANEJANDO PARA:" : "MODO DE PLANEJAMENTO:"}
              </span>
              {selectedUser && (
                <span className="px-2 py-0.5 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-[10px] font-semibold">
                  Vínculo ID Ativo
                </span>
              )}
            </div>

            {selectedUser ? (
              <div className="space-y-0.5">
                <h3 className="text-sm md:text-base font-bold text-slate-100 dark:text-white flex items-center gap-2">
                  <span>{selectedUser.displayName}</span>
                  {selectedUser.preferredName && selectedUser.preferredName !== selectedUser.displayName && (
                    <span className="text-xs font-normal text-slate-400">({selectedUser.preferredName})</span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2">
                  <span>{selectedUser.gradeLevel || "Série não especificada"}</span>
                  {selectedUser.institutionName && <span>• {selectedUser.institutionName}</span>}
                  {selectedUser.classGroup && <span>• {selectedUser.classGroup}</span>}
                  {selectedUser.registrationNumber && (
                    <span className="text-[11px] text-teal-400">({selectedUser.registrationNumber})</span>
                  )}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Planejamento Geral / Biblioteca de Modelos (Sem Vínculo)
                </h3>
                <p className="text-xs text-slate-400">
                  A atividade será criada como modelo institucional ou modelo reutilizável.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            type="button"
            onClick={onOpenSelectUserModal}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm ${
              selectedUser
                ? "bg-teal-600 hover:bg-teal-500 text-white border-teal-500"
                : "bg-slate-800 hover:bg-slate-700 text-teal-300 border-slate-700"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>{selectedUser ? "Trocar Usuário" : "Selecionar Aluno / Usuário"}</span>
          </button>
        </div>
      </div>

      {/* Seletor de Modo Profissional (Linguagem, limites e templates próprios) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {(["escolar", "psicopedagogia", "psicologia", "aee"] as PlannerMode[]).map((mode) => {
          const info = getModeLabel(mode);
          const isSelected = plannerMode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => onSelectPlannerMode(mode)}
              className={`text-left p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? `${info.color} shadow-sm ring-1 ring-teal-500/50`
                  : isDark
                  ? "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{info.label}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />}
              </div>
              <p className="text-[10px] opacity-80 mt-1 line-clamp-2 leading-relaxed">{info.sub}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
