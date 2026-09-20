import React, { useState } from "react";
import { ShieldAlert, Phone, Moon, VolumeX, MessageSquare, X, HeartHandshake, CheckCircle2 } from "lucide-react";
import { UserProfile } from "../types";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  toggleLowStimMode: () => void;
}

// Normalizador seguro de telefone para WhatsApp
function normalizeWhatsAppPhone(rawPhone?: string): string {
  if (!rawPhone) return "";
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  toggleLowStimMode,
}) => {
  const [activeTab, setActiveTab] = useState<"passos" | "fones" | "contatos" | "mensagem">("passos");
  const [step, setStep] = useState(1);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [selectedContactPhone, setSelectedContactPhone] = useState<string>("");

  const defaultMsg = userProfile.preferredName
    ? `Olá, aqui é ${userProfile.preferredName}. Estou passando por um momento de sobrecarga e preciso de alguns minutos em um ambiente mais silencioso, com menos estímulos e sem cobranças. Logo estarei bem.`
    : `Olá. Estou passando por um momento de sobrecarga e preciso de alguns minutos em um ambiente mais silencioso, com menos estímulos e sem cobranças. Agradeço sua compreensão.`;

  const [customMessage, setCustomMessage] = useState<string>(defaultMsg);

  if (!isOpen) return null;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  const handleWhatsAppAlert = () => {
    const encoded = encodeURIComponent(customMessage);
    const normalizedPhone = normalizeWhatsAppPhone(selectedContactPhone);
    const targetUrl = normalizedPhone 
      ? `https://wa.me/${normalizedPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(targetUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Calmo */}
        <div className="bg-rose-950/70 border-b border-rose-800/50 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-900/60 text-rose-300 rounded-xl border border-rose-700/50">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-rose-100 flex items-center gap-2">
                Apoio em Crise & Sobrecarga
              </h2>
              <p className="text-xs text-rose-200/80">
                Respire no seu tempo. Vamos reduzir os estímulos e ajudar você a passar por este momento.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action quick bar */}
        <div className="bg-slate-950 p-3 flex flex-wrap gap-2 border-b border-slate-800 justify-around text-xs sm:text-sm">
          <button
            onClick={toggleLowStimMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
              userProfile.lowStimulationMode
                ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
          >
            <Moon className="w-4 h-4" />
            {userProfile.lowStimulationMode ? "Modo Escuro Ativo" : "Escurecer Tela"}
          </button>

          <button
            onClick={() => setActiveTab("passos")}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeTab === "passos"
                ? "bg-teal-900 text-teal-200 border-teal-600"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
          >
            🧘 Calma Passo a Passo
          </button>

          <button
            onClick={() => setActiveTab("contatos")}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeTab === "contatos"
                ? "bg-teal-900 text-teal-200 border-teal-600"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
          >
            📞 Telefones de Apoio
          </button>

          <button
            onClick={() => setActiveTab("mensagem")}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeTab === "mensagem"
                ? "bg-teal-900 text-teal-200 border-teal-600"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
          >
            💬 Enviar Alerta Rápido
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === "passos" && (
            <div className="space-y-6">
              <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-teal-400 uppercase tracking-wider">
                  <span>Passo {step} de 4</span>
                  <span>Guia de Acolhimento</span>
                </div>

                {step === 1 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-teal-200 flex items-center gap-2">
                      <VolumeX className="w-5 h-5 text-teal-400" />
                      1. Reduza os estímulos imediatamente
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Se for confortável, reduza estímulos visuais olhando para um ponto fixo, diminuindo a luz do ambiente ou fechando os olhos. Se tiver abafadores ou fones de ouvido, coloque-os. Se estiver em local movimentado, procure um canto com menos circulação ou vire-se para o lado oposto ao fluxo de pessoas.
                    </p>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-teal-200 flex items-center gap-2">
                      <HeartHandshake className="w-5 h-5 text-teal-400" />
                      2. Sem cobrança de fala ou explicação
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Você não precisa falar nem se justificar agora. Não tente forçar conversas nem raciocínios complexos. A dificuldade temporária para falar ou responder é uma reação comum de proteção do sistema nervoso sob sobrecarga.
                    </p>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-teal-200">
                      3. Pressão profunda & Movimentos de autorregulação (Stimming)
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Se pressão profunda costuma ajudar você e já é uma estratégia conhecida no seu plano de apoio, utilize uma opção confortável e segura (como cruzar os braços com firmeza ao redor do corpo ou apoiar peso nas pernas). Movimentos de autorregulação (stimming) são naturais e legítimos: balance o corpo, mexa as mãos ou segure um objeto sensorial de apoio.
                    </p>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-teal-200">
                      4. Lembrete: Dê a si mesmo o tempo necessário
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      A sobrecarga (meltdown ou shutdown) é uma resposta neurobiológica ao excesso de estímulos ou cansaço acumulado, não uma falha pessoal. Permita-se fazer pausas sem julgamento até que seu ritmo comece a se restabelecer.
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-slate-700/60">
                  <button
                    disabled={step === 1}
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-lg text-slate-200 transition"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={step === 4}
                    onClick={() => setStep(step + 1)}
                    className="px-4 py-2 text-sm bg-teal-600 hover:bg-teal-500 disabled:opacity-40 rounded-lg text-white transition font-medium"
                  >
                    Próximo Passo
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "contatos" && (
            <div className="space-y-4">
              {/* Painel de Discernimento Neuroafirmativo (Item 8 do Adendo) */}
              <div className="p-4 bg-slate-950/90 border border-slate-700/70 rounded-2xl space-y-3 text-xs">
                <h4 className="font-bold text-teal-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  🧭 Identifique o tipo de apoio necessário neste momento
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-slate-300">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-teal-400 block">Sobrecarga Sensorial</strong>
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      Excesso de ruído, luz ou demandas. Foco: reduzir estímulos, suspender cobrança de fala e dar tempo de recuperação.
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-emerald-400 block">Sofrimento Emocional</strong>
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      Angústia, tristeza profunda ou crise de ansiedade. Foco: escuta acolhedora, contatos de confiança ou ligação ao CVV (188).
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-rose-400 block">Risco ou Emergência Médica</strong>
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      Risco à integridade física imediata ou emergência de saúde. Foco: acionamento imediato de serviços de emergência (192/193).
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-base font-semibold text-slate-200">Linhas de Emergência e Apoio (Gratuitas)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="tel:188"
                  className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 group-hover:text-emerald-300">CVV - Apoio Emocional</h4>
                      <p className="text-xs text-slate-400">Atendimento 24h gratuito</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">188</span>
                </a>

                <a
                  href="tel:192"
                  className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-950 text-rose-400 rounded-lg">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 group-hover:text-rose-300">SAMU - Emergência</h4>
                      <p className="text-xs text-slate-400">Socorro médico urgente</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-rose-400">192</span>
                </a>
              </div>

              {/* Contatos Pessoais */}
              <div className="pt-3 border-t border-slate-800">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Seus Contatos de Apoio Salvos:</h4>
                {userProfile.emergencyContacts && userProfile.emergencyContacts.length > 0 ? (
                  <div className="space-y-2">
                    {userProfile.emergencyContacts.map((c, idx) => (
                      <div key={idx} className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-200 text-sm">{c.name} ({c.relationship})</p>
                          <p className="text-xs text-slate-400">{c.phone}</p>
                        </div>
                        <a
                          href={`tel:${c.phone}`}
                          className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-xs text-white rounded-md flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" /> Ligar
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Nenhum contato pessoal cadastrado ainda. Você pode adicionar seus familiares/amigos no menu do perfil no topo do app.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "mensagem" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-200">Mensagem Funcional de Pedido de Apoio</h3>
                <p className="text-xs text-slate-300">
                  Edite a mensagem conforme sua necessidade antes de enviar. O envio exige sempre sua ação explícita:
                </p>
              </div>

              {/* Seletor de Destinatário opcional */}
              {userProfile.emergencyContacts && userProfile.emergencyContacts.length > 0 && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-300">Destinatário cadastrado (opcional):</label>
                  <select
                    value={selectedContactPhone}
                    onChange={(e) => setSelectedContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="">Abrir WhatsApp geral (escolher contato no aplicativo)</option>
                    {userProfile.emergencyContacts.map((c, i) => (
                      <option key={i} value={c.phone}>
                        {c.name} ({c.relationship}) - {c.phone}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mensagem Editável */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300">Texto da mensagem:</label>
                  <button
                    type="button"
                    onClick={() => setCustomMessage(defaultMsg)}
                    className="text-teal-400 hover:text-teal-300 underline"
                  >
                    Restaurar texto padrão
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed font-sans focus:border-teal-500 focus:outline-none"
                  placeholder="Digite sua mensagem de pedido de apoio..."
                />
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400">
                🛡️ <strong>Privacidade:</strong> Esta mensagem foca apenas em necessidades práticas imediatas (silêncio, menos estímulos, tempo) sem expor diagnósticos, CID ou dados médicos sensíveis.
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs sm:text-sm font-medium border border-slate-700 flex items-center gap-2 transition"
                >
                  {copiedMessage ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <MessageSquare className="w-4 h-4" />}
                  {copiedMessage ? "Copiado com sucesso!" : "Copiar Texto"}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppAlert}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  Enviar via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition"
          >
            Concluir / Voltar
          </button>
        </div>

      </div>
    </div>
  );
};
