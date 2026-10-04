import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, RotateCcw, Home, Sparkles, ShieldCheck } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary capturou uma falha de renderização:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCacheAndReload = () => {
    try {
      // Remove any custom Supabase configs or potential corrupted cache
      localStorage.removeItem("neuroconecta_supabase_custom_config");
      localStorage.removeItem("neuroconecta_hidden_modules");
      localStorage.removeItem("neuroconecta_sidebar_collapsed");
      console.log("Cache de inicialização limpo com sucesso.");
    } catch (e) {
      console.warn("Erro ao limpar localStorage:", e);
    }
    window.location.reload();
  };

  private handleClearAllAndFreshStart = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = window.location.origin;
  };

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || "Erro desconhecido de execução.";
      
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
          <div className="max-w-xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-fadeIn">
            {/* Header Icon */}
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Title & Explanation */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-700/50">
                Recuperação Automática Ativa
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                O aplicativo encontrou uma oscilação temporária
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Para evitar a "tela branca" no seu navegador ou painel de Preview, o sistema de proteção resiliente do NeuroConecta manteve sua sessão segura.
              </p>
            </div>

            {/* Error Message Details */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-left space-y-1">
              <p className="text-[11px] font-semibold text-slate-400">Detalhe técnico registrado:</p>
              <code className="text-xs text-rose-300 font-mono block break-words bg-slate-950 p-2 rounded-xl border border-rose-950">
                {errorMsg}
              </code>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-teal-900/30 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" /> Recarregar Página
              </button>

              <button
                onClick={this.handleResetCacheAndReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> Restaurar Configuração Padrão
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-teal-400">
                <ShieldCheck className="w-4 h-4" />
                <span>NeuroConecta • Proteção Resiliente</span>
              </div>
              <button
                onClick={this.handleClearAllAndFreshStart}
                className="text-slate-500 hover:text-slate-300 underline"
              >
                Limpar todo o cache local
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
