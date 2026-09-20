import React, { useState, useEffect } from "react";
import {
  FileText,
  X,
  Printer,
  Copy,
  Check,
  Sparkles,
  Save,
  Plus,
  Trash2,
  ShieldCheck,
  HeartHandshake,
  VolumeX,
  MessageSquare,
  Clock,
  HelpCircle,
  Users,
} from "lucide-react";
import { FunctionalSupportPlan, UserProfile } from "../types";
import { Lote1Api } from "../services/lote1Client";

interface FunctionalPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

export const FunctionalPlanModal: React.FC<FunctionalPlanModalProps> = ({
  isOpen,
  onClose,
  userProfile,
}) => {
  const subjectId = userProfile.email || "user-local";
  const [plan, setPlan] = useState<FunctionalSupportPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);

  // Form Fields
  const [commPrefs, setCommPrefs] = useState<string[]>([]);
  const [newCommPref, setNewCommPref] = useState("");

  const [overloadSigns, setOverloadSigns] = useState<string[]>([]);
  const [newOverloadSign, setNewOverloadSign] = useState("");

  const [strategies, setStrategies] = useState<string[]>([]);
  const [newStrategy, setNewStrategy] = useState("");

  const [avoids, setAvoids] = useState<string[]>([]);
  const [newAvoid, setNewAvoid] = useState("");

  const [transitionAlerts, setTransitionAlerts] = useState("");
  const [breakProtocol, setBreakProtocol] = useState("");

  const [schoolAccs, setSchoolAccs] = useState<string[]>([]);
  const [newSchoolAcc, setNewSchoolAcc] = useState("");

  const loadPlan = async () => {
    setLoading(true);
    const data = await Lote1Api.getFunctionalPlan(subjectId, userProfile);
    setPlan(data);
    setCommPrefs(data.communicationPreferences || []);
    setOverloadSigns(data.sensoryOverloadSigns || []);
    setStrategies(data.helpfulStrategies || []);
    setAvoids(data.whatToAvoid || []);
    setTransitionAlerts(data.transitionAlerts || "");
    setBreakProtocol(data.breakRequestProtocol || "");
    setSchoolAccs(data.schoolAccommodationsAgreed || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadPlan();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!plan) return;
    setLoading(true);
    const updated = await Lote1Api.updateFunctionalPlan(
      {
        ...plan,
        communicationPreferences: commPrefs,
        sensoryOverloadSigns: overloadSigns,
        helpfulStrategies: strategies,
        whatToAvoid: avoids,
        transitionAlerts,
        breakRequestProtocol: breakProtocol,
        schoolAccommodationsAgreed: schoolAccs,
        subjectName: userProfile.preferredName,
      },
      userProfile
    );
    setPlan(updated);
    setIsEditing(false);
    setSavedStatus(true);
    setLoading(false);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  const generateFormattedText = () => {
    const pName = userProfile.preferredName || "Pessoa no Centro";
    return `=====================================================
PLANO INDIVIDUAL DE APOIO FUNCIONAL
NEUROCONECTA • SUPORTE NEUROAFIRMATIVO
(Documento de Apoio Cotidiano / Não é Laudo Médico)
=====================================================
Titular: ${pName}
Versão do Plano: v${plan?.version || 1}
Última Atualização: ${new Date().toLocaleDateString("pt-BR")}

1. COMO ME COMUNICO MELHOR:
${commPrefs.map((i, idx) => `• ${i}`).join("\n")}

2. COMO PERCEBO A SOBRECARGA SENSORIAL (SINAIS DE ALERTA):
${overloadSigns.map((i, idx) => `• ${i}`).join("\n")}

3. O QUE COSTUMA ME AJUDAR A RECUPERAR A CALMA:
${strategies.map((i, idx) => `• ${i}`).join("\n")}

4. O QUE DEVE SER EVITADO ABSOLUTAMENTE:
${avoids.map((i, idx) => `• ${i}`).join("\n")}

5. COMO ME AVISAR SOBRE TRANSIÇÕES E MUDANÇAS:
${transitionAlerts}

6. COMO POSSO PEDIR UMA PAUSA NO AMBIENTE:
${breakProtocol}

7. ACOMODAÇÕES ESCOLARES / ROTINA ACORDADAS:
${schoolAccs.map((i, idx) => `• ${i}`).join("\n")}

=====================================================
Documento gerado via NeuroConecta sob autonomia da pessoa/família.
=====================================================`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateFormattedText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(
        `<pre style="font-family: sans-serif; white-space: pre-wrap; line-height: 1.6; padding: 24px; font-size: 14px; max-width: 800px; margin: 0 auto;">${generateFormattedText()}</pre>`
      );
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950 text-cyan-400 rounded-2xl border border-cyan-800">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">
                  Plano Individual de Apoio Funcional
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 text-[10px] font-bold">
                  v{plan?.version || 1}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Resumo prático para alinhamento com escola, faculdade, trabalho e família.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copiado!" : "Copiar"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Disclaimer Neuroafirmativo */}
        <div className="px-5 py-3 bg-cyan-950/40 border-b border-cyan-900/50 flex items-center gap-2 text-xs text-cyan-200">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Documento Funcional Neuroafirmativo:</strong> Este plano registra necessidades
            práticas e estratégias de convivência acordadas. Não substitui laudo médico pericial.
          </span>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {savedStatus && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" /> Plano atualizado e nova versão salva com sucesso!
            </div>
          )}

          {/* Toggle View / Edit */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {isEditing ? "Modo de Edição & Atualização" : "Visualização do Plano Ativo"}
            </span>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                isEditing
                  ? "bg-slate-800 text-slate-300"
                  : "bg-teal-600 hover:bg-teal-500 text-white shadow-sm"
              }`}
            >
              {isEditing ? "Cancelar Edição" : "Editar Plano"}
            </button>
          </div>

          {/* SECTION 1: COMUNICAÇÃO */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-teal-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-400" />
              1. Como me comunico melhor:
            </h3>

            <div className="space-y-2">
              {commPrefs.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                >
                  <span>• {item}</span>
                  {isEditing && (
                    <button
                      onClick={() => setCommPrefs(commPrefs.filter((_, i) => i !== idx))}
                      className="text-rose-400 hover:text-rose-300 text-[10px] px-2 py-0.5"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Adicionar preferência comunicativa..."
                  value={newCommPref}
                  onChange={(e) => setNewCommPref(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                />
                <button
                  onClick={() => {
                    if (newCommPref.trim()) {
                      setCommPrefs([...commPrefs, newCommPref.trim()]);
                      setNewCommPref("");
                    }
                  }}
                  className="px-3 py-1.5 bg-teal-600 text-white font-bold rounded-xl text-xs"
                >
                  Adicionar
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: SINAIS DE SOBRECARGA */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
              <VolumeX className="w-4 h-4 text-amber-400" />
              2. Como percebo a sobrecarga sensorial (Sinais de Alerta):
            </h3>

            <div className="space-y-2">
              {overloadSigns.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                >
                  <span>• {item}</span>
                  {isEditing && (
                    <button
                      onClick={() => setOverloadSigns(overloadSigns.filter((_, i) => i !== idx))}
                      className="text-rose-400 hover:text-rose-300 text-[10px] px-2 py-0.5"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Adicionar sinal de sobrecarga..."
                  value={newOverloadSign}
                  onChange={(e) => setNewOverloadSign(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                />
                <button
                  onClick={() => {
                    if (newOverloadSign.trim()) {
                      setOverloadSigns([...overloadSigns, newOverloadSign.trim()]);
                      setNewOverloadSign("");
                    }
                  }}
                  className="px-3 py-1.5 bg-teal-600 text-white font-bold rounded-xl text-xs"
                >
                  Adicionar
                </button>
              </div>
            )}
          </div>

          {/* SECTION 3: O QUE AJUDA */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              3. O que costuma me ajudar a recuperar a calma:
            </h3>

            <div className="space-y-2">
              {strategies.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                >
                  <span>• {item}</span>
                  {isEditing && (
                    <button
                      onClick={() => setStrategies(strategies.filter((_, i) => i !== idx))}
                      className="text-rose-400 hover:text-rose-300 text-[10px] px-2 py-0.5"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Adicionar estratégia benéfica..."
                  value={newStrategy}
                  onChange={(e) => setNewStrategy(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                />
                <button
                  onClick={() => {
                    if (newStrategy.trim()) {
                      setStrategies([...strategies, newStrategy.trim()]);
                      setNewStrategy("");
                    }
                  }}
                  className="px-3 py-1.5 bg-teal-600 text-white font-bold rounded-xl text-xs"
                >
                  Adicionar
                </button>
              </div>
            )}
          </div>

          {/* SECTION 4: O QUE EVITAR */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-rose-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              4. O que deve ser evitado absolutamente:
            </h3>

            <div className="space-y-2">
              {avoids.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                >
                  <span>• {item}</span>
                  {isEditing && (
                    <button
                      onClick={() => setAvoids(avoids.filter((_, i) => i !== idx))}
                      className="text-rose-400 hover:text-rose-300 text-[10px] px-2 py-0.5"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Adicionar atitude a evitar..."
                  value={newAvoid}
                  onChange={(e) => setNewAvoid(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                />
                <button
                  onClick={() => {
                    if (newAvoid.trim()) {
                      setAvoids([...avoids, newAvoid.trim()]);
                      setNewAvoid("");
                    }
                  }}
                  className="px-3 py-1.5 bg-teal-600 text-white font-bold rounded-xl text-xs"
                >
                  Adicionar
                </button>
              </div>
            )}
          </div>

          {/* SECTION 5: TRANSIÇÕES & SINAL COMBINADO PARA PAUSA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                5. Aviso de Transições:
              </h3>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={transitionAlerts}
                  onChange={(e) => setTransitionAlerts(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                />
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed">{transitionAlerts}</p>
              )}
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <h3 className="font-bold text-sm text-purple-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                6. Sinal Combinado e Estratégia de Apoio para Pausa:
              </h3>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={breakProtocol}
                  onChange={(e) => setBreakProtocol(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                />
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed">{breakProtocol}</p>
              )}
            </div>
          </div>

          {/* SECTION 6: ACOMODAÇÕES ESCOLARES */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="font-bold text-sm text-blue-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              7. Acomodações Escolares e de Rotina Acordadas:
            </h3>

            <div className="space-y-2">
              {schoolAccs.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                >
                  <span>• {item}</span>
                  {isEditing && (
                    <button
                      onClick={() => setSchoolAccs(schoolAccs.filter((_, i) => i !== idx))}
                      className="text-rose-400 hover:text-rose-300 text-[10px] px-2 py-0.5"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Adicionar acomodação acordada..."
                  value={newSchoolAcc}
                  onChange={(e) => setNewSchoolAcc(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                />
                <button
                  onClick={() => {
                    if (newSchoolAcc.trim()) {
                      setSchoolAccs([...schoolAccs, newSchoolAcc.trim()]);
                      setNewSchoolAcc("");
                    }
                  }}
                  className="px-3 py-1.5 bg-teal-600 text-white font-bold rounded-xl text-xs"
                >
                  Adicionar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Atualizado por: {plan?.updatedBy || "Titular"} • v{plan?.version || 1}
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Nova Versão</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
