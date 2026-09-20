import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  X,
  Plus,
  Lock,
  Eye,
  AlertTriangle,
  School,
  Users,
  CheckCircle2,
  Trash2,
  Share2,
  Heart,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { ShareGrant, ShareResourceType, ShareContext, UserProfile } from "../types";
import { Lote1Api } from "../services/lote1Client";

interface ShareManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

export const ShareManagerModal: React.FC<ShareManagerModalProps> = ({
  isOpen,
  onClose,
  userProfile,
}) => {
  const [grants, setGrants] = useState<ShareGrant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [grantedToName, setGrantedToName] = useState("");
  const [relationship, setRelationship] = useState<ShareGrant["relationship"]>("cuidador");
  const [context, setContext] = useState<ShareContext>("familia_cuidador");
  const [resourceType, setResourceType] = useState<ShareResourceType>("plano_funcional");
  const [description, setDescription] = useState("");
  const [confirmedPersonalDiary, setConfirmedPersonalDiary] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const subjectId = userProfile.email || "user-local";

  const loadGrants = async () => {
    setLoading(true);
    const data = await Lote1Api.getShareGrants(subjectId, userProfile);
    setGrants(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadGrants();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantedToName.trim()) return;

    if (resourceType === "diario_pessoal" && !confirmedPersonalDiary) {
      alert("Atenção: Para compartilhar o diário íntimo pessoal, confirme a caixa de ciência expressa.");
      return;
    }

    setLoading(true);
    const newGrant = await Lote1Api.createShareGrant(
      {
        subjectId,
        subjectName: userProfile.preferredName,
        grantedBy: userProfile.email || "user-local",
        grantedToName: grantedToName.trim(),
        relationship,
        context,
        resourceType,
        permission: "VIEW",
        description: description.trim() || undefined,
      },
      userProfile
    );

    setGrants([newGrant, ...grants]);
    setGrantedToName("");
    setDescription("");
    setShowAddForm(false);
    setConfirmedPersonalDiary(false);
    setActionStatus("Permissão concedida com sucesso!");
    setLoading(false);
    setTimeout(() => setActionStatus(null), 3000);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Deseja realmente revogar este compartilhamento imediatamente?")) return;
    setLoading(true);
    await Lote1Api.revokeShareGrant(id, subjectId, userProfile);
    await loadGrants();
    setActionStatus("Compartilhamento revogado com sucesso.");
    setLoading(false);
    setTimeout(() => setActionStatus(null), 3000);
  };

  const getResourceLabel = (type: ShareResourceType) => {
    switch (type) {
      case "plano_funcional":
        return "📋 Plano Individual de Apoio Funcional";
      case "estrategias_comunicacao":
        return "💬 Estratégias de Comunicação & AAC";
      case "necessidades_sensoriais":
        return "🌱 Necessidades Sensoriais & Desescalada";
      case "rotina_escolar":
        return "🏫 Rotina e Acomodações Escolares";
      case "observacoes_cuidador":
        return "👨‍👩‍👧 Observações de Cuidador";
      case "diario_pessoal":
        return "🔒 Diário Íntimo Pessoal (Altamente Reservado)";
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-950 text-teal-400 rounded-2xl border border-teal-800">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Painel de Privacidade & Compartilhamento Granular
              </h2>
              <p className="text-xs text-slate-400">
                Você no controle: decida exatamente o que a família ou a escola podem ver.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Banner */}
        <div className="p-4 bg-teal-950/40 border-b border-teal-900/50 flex items-start gap-3 text-xs text-teal-200">
          <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <p className="font-semibold text-teal-300">
              Princípio da Pessoa no Centro & Resguardo do Diário Íntimo
            </p>
            <p className="text-slate-300">
              Estar vinculado como cuidador ou escola <strong>não</strong> concede acesso automático
              a todos os dados. O seu <strong>Diário Pessoal</strong> é estritamente íntimo por padrão
              e nunca é compartilhado sem sua autorização explícita e revogável a qualquer momento.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {actionStatus && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {actionStatus}
            </div>
          )}

          {/* Quick Stats / Active Grants */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <span>Compartilhamentos Registrados:</span>
              <span className="px-2 py-0.5 bg-slate-800 text-teal-300 rounded-full font-mono">
                {grants.filter((g) => g.status === "active").length} ativos
              </span>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? "Cancelar" : "Nova Permissão"}</span>
            </button>
          </div>

          {/* Form to add grant */}
          {showAddForm && (
            <form
              onSubmit={handleCreateGrant}
              className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 animate-fadeIn"
            >
              <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Conceder Acesso Específico
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Nome da Pessoa ou Instituição:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mãe / Cuidadora Ana, Escola Municipal..."
                    value={grantedToName}
                    onChange={(e) => setGrantedToName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Relação / Vínculo:</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                  >
                    <option value="mae_pai_responsavel">Pai, Mãe ou Responsável Legal</option>
                    <option value="cuidador">Cuidador(a) Familiar ou Profissional</option>
                    <option value="professor_aee">Professor(a) Especialista AEE</option>
                    <option value="escola">Escola / Coordenação Pedagógica</option>
                    <option value="outro">Outro Apoio</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Contexto:</label>
                  <select
                    value={context}
                    onChange={(e) => setContext(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                  >
                    <option value="familia_cuidador">👨‍👩‍👧 Contexto Família & Cuidadores</option>
                    <option value="escola_educador">🏫 Contexto Escola & AEE</option>
                    <option value="geral">🌐 Geral</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">O que deseja compartilhar:</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                  >
                    <option value="plano_funcional">📋 Plano Individual de Apoio Funcional</option>
                    <option value="estrategias_comunicacao">💬 Estratégias de Comunicação & AAC</option>
                    <option value="necessidades_sensoriais">🌱 Necessidades Sensoriais & Desescalada</option>
                    <option value="rotina_escolar">🏫 Rotina e Acomodações Escolares</option>
                    <option value="observacoes_cuidador">👨‍👩‍👧 Observações de Cuidador</option>
                    <option value="diario_pessoal">🔒 Diário Íntimo Pessoal (Apenas com consentimento expresso)</option>
                  </select>
                </div>
              </div>

              {resourceType === "diario_pessoal" && (
                <div className="p-3 bg-amber-950/60 border border-amber-700/80 rounded-xl text-xs text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Atenção: Nível Máximo de Privacidade
                  </div>
                  <p>
                    O diário íntimo pessoal contém registros espontâneos e sentimentos privados. Você tem
                    o direito de manter esse diário estritamente reservado. Compartilhe apenas com
                    alguém de extrema confiança.
                  </p>
                  <label className="flex items-center gap-2 font-medium cursor-pointer pt-1 text-slate-200">
                    <input
                      type="checkbox"
                      checked={confirmedPersonalDiary}
                      onChange={(e) => setConfirmedPersonalDiary(e.target.checked)}
                      className="rounded border-slate-600 text-teal-600 focus:ring-0"
                    />
                    Estou ciente e autorizo expressamente este compartilhamento.
                  </label>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Observações / Propósito (Opcional):</label>
                <input
                  type="text"
                  placeholder="Ex: Para reuniões pedagógicas bimestrais ou alinhamento de rotina"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Confirmar e Conceder
                </button>
              </div>
            </form>
          )}

          {/* Grants List */}
          <div className="space-y-3">
            {grants.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <Lock className="w-8 h-8 text-teal-400 mx-auto opacity-70" />
                <p className="text-sm font-semibold text-slate-300">
                  Nenhum compartilhamento ativo no momento
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Todos os seus dados estão protegidos sob seu controle individual. Quando desejar,
                  conceda acesso a itens específicos para apoiar a escola ou cuidadores.
                </p>
              </div>
            ) : (
              grants.map((g) => {
                const isActive = g.status === "active";
                return (
                  <div
                    key={g.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isActive
                        ? "bg-slate-950 border-slate-800 hover:border-slate-700"
                        : "bg-slate-950/40 border-slate-900 opacity-60"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{g.grantedToName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isActive
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-rose-950 text-rose-300 border border-rose-800"
                          }`}
                        >
                          {isActive ? "Ativo" : "Revogado"}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300">
                          {g.context === "escola_educador"
                            ? "Escola"
                            : g.context === "familia_cuidador"
                            ? "Família"
                            : "Geral"}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-teal-400 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5" />
                        {getResourceLabel(g.resourceType)}
                      </p>

                      {g.description && (
                        <p className="text-xs text-slate-400 italic">"{g.description}"</p>
                      )}

                      <p className="text-[10px] text-slate-500">
                        Concedido em: {new Date(g.createdAt).toLocaleDateString("pt-BR")}
                        {g.revokedAt && ` • Revogado em: ${new Date(g.revokedAt).toLocaleDateString("pt-BR")}`}
                      </p>
                    </div>

                    {isActive && (
                      <button
                        onClick={() => handleRevoke(g.id)}
                        className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-center"
                        title="Revogar acesso imediatamente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revogar</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>Auditoria contínua de acessos ativa</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
