import React, { useState } from "react";
import { 
  X, 
  Search, 
  User, 
  Check, 
  Building2, 
  GraduationCap, 
  Sparkles, 
  Plus, 
  Layers,
  UserCheck,
  Tag
} from "lucide-react";
import { AssistedUserSummary } from "../../types";

interface UserSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistedUsers: AssistedUserSummary[];
  selectedUserId?: string | null;
  onSelectUser: (user: AssistedUserSummary | null) => void;
  onAddNewUser: (newUserParams: {
    displayName: string;
    preferredName?: string;
    registrationNumber?: string;
    gradeLevel?: string;
    institutionName?: string;
    relationshipType: "aluno" | "aprendente" | "paciente" | "assistido";
  }) => Promise<void>;
  isDark?: boolean;
}

export const UserSelectModal: React.FC<UserSelectModalProps> = ({
  isOpen,
  onClose,
  assistedUsers,
  selectedUserId,
  onSelectUser,
  onAddNewUser,
  isDark = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRegistration, setNewRegistration] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [newInstitution, setNewInstitution] = useState("");
  const [newRelationship, setNewRelationship] = useState<"aluno" | "aprendente" | "paciente">("aluno");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredUsers = assistedUsers.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.displayName.toLowerCase().includes(term) ||
      (user.preferredName && user.preferredName.toLowerCase().includes(term)) ||
      (user.registrationNumber && user.registrationNumber.toLowerCase().includes(term)) ||
      (user.institutionName && user.institutionName.toLowerCase().includes(term)) ||
      (user.gradeLevel && user.gradeLevel.toLowerCase().includes(term))
    );
  });

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      await onAddNewUser({
        displayName: newName.trim(),
        preferredName: newName.trim().split(" ")[0],
        registrationNumber: newRegistration.trim() || undefined,
        gradeLevel: newGrade.trim() || undefined,
        institutionName: newInstitution.trim() || undefined,
        relationshipType: newRelationship,
      });

      setIsAddingNew(false);
      setNewName("");
      setNewRegistration("");
      setNewGrade("");
      setNewInstitution("");
      onClose();
    } catch (err: any) {
      console.error("Erro ao cadastrar atendido:", err);
      setFormError(err.message || "Falha ao gravar no Supabase. Verifique a conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Cabeçalho */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-400" />
              Selecionar Aprendente / Paciente / Aluno
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Vincule esta atividade ao registro do atendido para manter a continuidade pedagógica e terapêutica.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Opção sem vínculo (Criar como modelo para biblioteca) */}
          <div
            onClick={() => {
              onSelectUser(null);
              onClose();
            }}
            className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
              selectedUserId === null || selectedUserId === undefined
                ? "bg-teal-950/40 border-teal-500/80 text-teal-300"
                : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">Criar sem vincular a usuário (Biblioteca / Modelo)</p>
                <p className="text-[11px] text-slate-400">
                  Ideal para criar banco de atividades reutilizáveis, modelos gerais e planos para turmas inteiras.
                </p>
              </div>
            </div>
            {(selectedUserId === null || selectedUserId === undefined) && (
              <Check className="w-4 h-4 text-teal-400 shrink-0" />
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
              <span className="bg-slate-900 px-3">Ou escolha do seu escopo autorizado</span>
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, matrícula, turma ou instituição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Lista de Usuários */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                Nenhum atendido encontrado para os critérios informados.
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUserId === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? "bg-teal-950/60 border-teal-500 text-teal-100 shadow-sm"
                        : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
                        {user.displayName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-100">{user.displayName}</p>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-teal-300 capitalize border border-slate-700">
                            {user.relationshipType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{user.gradeLevel || "Série não informada"}</span>
                          {user.institutionName && <span>• {user.institutionName}</span>}
                          {user.registrationNumber && (
                            <span className="text-slate-500">({user.registrationNumber})</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-teal-400 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>

          {/* Toggle para vincular novo usuário rápido */}
          {!isAddingNew ? (
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="w-full py-2.5 px-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-teal-400 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Vincular Novo Aprendente / Paciente / Aluno</span>
            </button>
          ) : (
            <form onSubmit={handleCreateNewUser} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Novo Vínculo com Atendido</span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pedro Henrique Silva"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">Tipo de Vínculo</label>
                  <select
                    value={newRelationship}
                    onChange={(e) => setNewRelationship(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="aluno">Aluno (Escola / AEE)</option>
                    <option value="aprendente">Aprendente (Psicopedagogia)</option>
                    <option value="paciente">Paciente (Psicologia / Clínica)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">Série / Etapa</label>
                  <input
                    type="text"
                    placeholder="Ex: 5º Ano Fundamental I"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">Escola / Instituição / Clínica</label>
                  <input
                    type="text"
                    placeholder="Ex: Escola Municipal ou Clínica"
                    value={newInstitution}
                    onChange={(e) => setNewInstitution(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <span className="font-bold">Erro:</span>
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cadastrando no Supabase...</span>
                  </>
                ) : (
                  <span>Cadastrar e Selecionar</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
