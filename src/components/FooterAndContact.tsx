import React, { useState } from "react";
import neuroconectaLogo from "../assets/logo";
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  Building2, 
  ShieldCheck, 
  ExternalLink, 
  Send, 
  X, 
  CheckCircle2, 
  Sparkles,
  Printer,
  Heart
} from "lucide-react";

interface FooterAndContactProps {
  isDark?: boolean;
}

export const FooterAndContact: React.FC<FooterAndContactProps> = ({ isDark = true }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Dúvida / Suporte NeuroConecta",
    message: ""
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) return;

    // Direct WhatsApp pre-fill link
    const text = encodeURIComponent(
      `Olá SISTEMASTOP!\nMeu nome é: ${contactForm.name}\nE-mail: ${contactForm.email}\nTelefone: ${contactForm.phone}\nAssunto: ${contactForm.subject}\n\nMensagem: ${contactForm.message}`
    );
    window.open(`https://wa.me/5588996739128?text=${text}`, "_blank");

    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setShowContactModal(false);
      setContactForm({ name: "", email: "", phone: "", subject: "Dúvida / Suporte NeuroConecta", message: "" });
    }, 2500);
  };

  return (
    <footer className="mt-12 bg-slate-950 border-t border-slate-800 text-slate-300 text-xs py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Main Brand & Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Col 1: SISTEMASTOP Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img 
                src="/sistemastop_logo.svg" 
                alt="SISTEMASTOP Logo" 
                className="w-12 h-12 object-contain rounded-xl p-1 bg-emerald-950/80 border border-emerald-800/80" 
              />
              <div>
                <h3 className="text-base font-extrabold text-white tracking-wide flex items-center gap-1.5">
                  SISTEMASTOP
                </h3>
                <p className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Soluções Tecnológicas &amp; Inovação
                </p>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Desenvolvimento de ecossistemas digitais acessíveis, plataformas de saúde mental, acessibilidade neuroafirmativa e sistemas de alta performance.
            </p>
          </div>

          {/* Col 2: NeuroConecta Branding */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-white rounded-xl border border-teal-200 shadow-sm shrink-0">
                <img 
                  src={neuroconectaLogo} 
                  alt="NeuroConecta Logo" 
                  className="w-10 h-10 object-contain aspect-square" 
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-teal-300">
                  NeuroConecta
                </h3>
                <p className="text-[11px] text-slate-300 font-medium leading-snug">
                  Tecnologia assistiva, acessibilidade e comunicação para autonomia, inclusão e apoio em diferentes contextos da vida.
                </p>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Recursos para pessoas, famílias, cuidadores e educadores, com arquitetura orientada à privacidade, compartilhamento controlado e respeito à neurodiversidade.
            </p>
          </div>

          {/* Col 3: Fale Conosco Direct Data */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
              <Building2 className="w-4 h-4" /> Fale Conosco • SISTEMASTOP
            </h4>

            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Rua Doutor Rolim, 366 - Bairro Independência, Crato - CE, CEP 63.119-060</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href="https://wa.me/5588996739128" target="_blank" rel="noreferrer" className="hover:text-emerald-300 underline font-semibold">
                  +55 (88) 99673-9128 (WhatsApp) | Central
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300 font-semibold">
                  Canal Oficial de Atendimento &amp; Suporte
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowContactModal(true)}
              className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950/40"
            >
              <MessageCircle className="w-4 h-4" /> Enviar Mensagem Direta
            </button>
          </div>

        </div>

        {/* Bottom Rights & Copyright */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} SISTEMASTOP Soluções Tecnológicas. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Privacidade & Acessibilidade
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Crato - Ceará - Brasil</span>
          </div>
        </div>

      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100 relative">
            
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800/80"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <img src="/sistemastop_logo.svg" alt="SISTEMASTOP" className="w-10 h-10 object-contain" />
              <div>
                <h3 className="text-lg font-bold text-white">Fale Conosco • SISTEMASTOP</h3>
                <p className="text-xs text-emerald-400 font-medium">Atendimento ao cliente, parcerias e suporte do NeuroConecta</p>
              </div>
            </div>

            {messageSent ? (
              <div className="p-6 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-emerald-200">Redirecionando para o WhatsApp...</h4>
                <p className="text-xs text-slate-300">Sua mensagem foi formatada e aberta no canal oficial de suporte da SISTEMASTOP.</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Seu Nome</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome completo"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(88) 99999-9999"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">E-mail</label>
                  <input
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Assunto</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Mensagem</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Escreva sua dúvida, sugestão ou solicitação de suporte para a SISTEMASTOP..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-4 h-4" /> Enviar Mensagem para o WhatsApp da SISTEMASTOP
                </button>

              </form>
            )}

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-white">📍 Sede da Empresa:</p>
              <p>Rua Doutor Rolim, 366 - Bairro Independência, Crato - CE CEP 63.119-060</p>
              <p>📍 Central de Atendimento e Suporte Técnico | 📞 <span className="text-emerald-400">+55 (88) 99673-9128</span></p>
            </div>

          </div>
        </div>
      )}

    </footer>
  );
};
