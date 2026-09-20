import React from "react";
import { Lock, LogIn, UserPlus, Heart, Shield, Sparkles, Brain, Stethoscope, Building2, GraduationCap, Users } from "lucide-react";
import neuroconectaLogo from "../assets/logo";

interface LandingCoverScreenProps {
  onOpenAuth: () => void;
  isDark?: boolean;
}

export const LandingCoverScreen: React.FC<LandingCoverScreenProps> = ({
  onOpenAuth,
  isDark = false,
}) => {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8 animate-fadeIn bg-slate-50 text-slate-900">
      
      {/* Top Bar Logo */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white border border-teal-200 rounded-2xl shadow-md">
            <img 
              src={neuroconectaLogo} 
              alt="NeuroConecta Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain aspect-square"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-teal-900">
              NeuroConecta
            </h1>
            <p className="text-[11px] font-extrabold text-teal-700 tracking-wide">
              SISTEMASTOP • Conexões que acolhem, informam e transformam.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-2xl font-extrabold text-xs sm:text-sm shadow-lg shadow-teal-700/20 flex items-center gap-2 transition active:scale-95"
        >
          <LogIn className="w-4 h-4" />
          <span>Entrar / Cadastrar</span>
        </button>
      </div>

      {/* Main Hero Card with Prominent Logo Visual on Pure White Box */}
      <div className="max-w-4xl mx-auto w-full my-auto py-8 sm:py-12 space-y-8 text-center">
        
        {/* Large Central Brand Logo Box - PURE WHITE BACKGROUND FOR MAXIMUM LOGO VISIBILITY */}
        <div className="relative inline-block group">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 opacity-20 blur-xl group-hover:opacity-40 transition duration-500"></div>
          <div className="relative p-6 sm:p-8 bg-white border-2 border-teal-200/90 rounded-3xl shadow-xl flex flex-col items-center justify-center gap-4 max-w-lg mx-auto">
            <div className="p-4 bg-white border border-slate-100 rounded-2xl w-full flex items-center justify-center">
              <img 
                src={neuroconectaLogo} 
                alt="NeuroConecta Logo Oficial" 
                className="w-64 h-64 sm:w-80 sm:h-80 object-contain aspect-square"
              />
            </div>
            <div className="space-y-1.5 text-center">
              <span className="text-[10px] uppercase font-black tracking-widest text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Privacidade & Autonomia
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Tecnologia Assistiva & Acessibilidade
              </h2>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Seja bem-vindo ao NeuroConecta
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Tecnologia assistiva, acessibilidade e comunicação para autonomia, inclusão e apoio em diferentes contextos da vida. Recursos para pessoas, famílias, cuidadores e educadores.
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <span>✨ Não é necessário laudo formal para utilizar os recursos de rotina, comunicação alternativa e autorregulação.</span>
          </div>
        </div>

        {/* Module Features Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-left">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-sm hover:shadow-md transition">
            <div className="text-teal-700 p-2 bg-teal-50 rounded-xl w-fit border border-teal-200">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-900">Copiloto IA</h3>
            <p className="text-[11px] text-slate-500 font-medium">Organização, comunicação e apoio à autonomia.</p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-sm hover:shadow-md transition">
            <div className="text-violet-700 p-2 bg-violet-50 rounded-xl w-fit border border-violet-200">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-900">Autorregulação & Apoio</h3>
            <p className="text-[11px] text-slate-500 font-medium">Rotinas sensoriais, diário funcional e bem-estar.</p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-sm hover:shadow-md transition">
            <div className="text-amber-700 p-2 bg-amber-50 rounded-xl w-fit border border-amber-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-900">Educação & PEI</h3>
            <p className="text-[11px] text-slate-500 font-medium">Minutas de PEI e inclusão escolar DUA.</p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-sm hover:shadow-md transition">
            <div className="text-cyan-700 p-2 bg-cyan-50 rounded-xl w-fit border border-cyan-200">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-900">Acessibilidade</h3>
            <p className="text-[11px] text-slate-500 font-medium">Acomodações funcionais e comunicação assertiva.</p>
          </div>
        </div>

      </div>

      {/* Footer Copyright */}
      <div className="max-w-6xl mx-auto w-full text-center py-4 border-t border-slate-200 text-xs text-slate-500 font-medium">
        <p>© 2026 NeuroConecta • SISTEMASTOP. Todos os direitos reservados. Arquitetura orientada à privacidade e respeito à neurodiversidade.</p>
      </div>

    </div>
  );
};
