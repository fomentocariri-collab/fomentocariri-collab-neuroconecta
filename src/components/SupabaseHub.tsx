import React, { useState, useEffect } from "react";
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  Server, 
  Key, 
  ShieldCheck, 
  HardDrive, 
  Download, 
  Settings, 
  Layers, 
  CheckCircle, 
  Info,
  RotateCcw,
  Shield,
  Activity,
  UserCheck,
  Lock,
  Clock
} from "lucide-react";
import { 
  supabase, 
  SUPABASE_SQL_SCHEMA, 
  checkSupabaseHealth, 
  SupabaseHealthReport, 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  resetSupabaseConfig 
} from "../lib/supabase";
import { useCurrentUser } from "../contexts/AuthContext";
import { dataSyncService } from "../services/dataSyncService";
import { auditService, StoredAuditEvent } from "../services/auditService";

export const SupabaseHub: React.FC = () => {
  const { user, userProfile, isAuthenticated, isSuperAdmin } = useCurrentUser();

  const [healthReport, setHealthReport] = useState<SupabaseHealthReport | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Audit Logs
  const [auditEvents, setAuditEvents] = useState<StoredAuditEvent[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Custom configuration modal / drawer state
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [customKey, setCustomKey] = useState("");
  const [configSuccessMsg, setConfigSuccessMsg] = useState("");

  const runHealthCheck = async () => {
    setIsChecking(true);
    try {
      const report = await checkSupabaseHealth();
      setHealthReport(report);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsChecking(false);
    }
  };

  const loadAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const targetUserId = user?.id || userProfile.id;
      const events = await auditService.listForUser(targetUserId);
      setAuditEvents(events);
    } catch (e) {
      console.warn("Erro ao carregar auditoria:", e);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    const config = getSupabaseConfig();
    setCustomUrl(config.url);
    setCustomKey(config.anonKey);
    runHealthCheck();
    loadAuditLogs();
  }, [user?.id]);

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveCustomConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customKey.trim()) return;
    saveSupabaseConfig(customUrl.trim(), customKey.trim());
    setConfigSuccessMsg("Credenciais salvas com sucesso! Testando nova conexão...");
    setTimeout(() => {
      setConfigSuccessMsg("");
      setShowConfigForm(false);
      runHealthCheck();
    }, 1200);
  };

  const handleResetToDefaultConfig = () => {
    resetSupabaseConfig();
    const config = getSupabaseConfig();
    setCustomUrl(config.url);
    setCustomKey(config.anonKey);
    setConfigSuccessMsg("Restaurado para a configuração base.");
    setTimeout(() => {
      setConfigSuccessMsg("");
      setShowConfigForm(false);
      runHealthCheck();
    }, 1200);
  };

  const handleExportFullBackup = () => {
    const backup: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("neuroconecta_")) {
        try {
          backup[key] = JSON.parse(localStorage.getItem(key) || "null");
        } catch {
          backup[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neuroconecta_backup_local_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSyncAllData = async () => {
    setSyncing(true);
    const logs: string[] = [];
    logs.push("⏳ [NC-A1] Verificando integridade e conectividade com Supabase...");

    const targetUserId = user?.id || (isAuthenticated ? userProfile.id : null);
    if (!targetUserId) {
      logs.push("⚠️ Usuário em modo visitante (sem login Supabase Auth). Conecte-se para sincronizar com persistência na nuvem vinculada ao seu ID canônico.");
      setSyncLogs(logs);
      setSyncing(false);
      return;
    }

    logs.push(`🔑 Identificador Canônico (auth.users.id): ${targetUserId}`);

    const freshHealth = await checkSupabaseHealth();
    setHealthReport(freshHealth);

    if (freshHealth.status === "offline_mitigated" || freshHealth.status === "error") {
      logs.push("🛡️ [Mitigação Ativa] Endpoint Supabase remoto não respondeu no tempo limite.");
      logs.push("✅ Dados seguros no armazenamento local. Nenhuma perda de registros.");
      setSyncLogs(logs);
      setSyncing(false);
      return;
    }

    try {
      logs.push("🚀 Executando migração e sincronização segura com políticas de RLS...");
      const result = await dataSyncService.syncFullBidirectional(targetUserId);
      logs.push(`✅ Registros legados migrados: ${result.migratedLegacyCount}`);
      logs.push("🎉 Sincronização canônica concluída com êxito!");
      await loadAuditLogs();
    } catch (e: any) {
      logs.push(`⚠️ Aviso durante sincronização: ${e.message}`);
    }

    setSyncLogs(logs);
    setSyncing(false);
  };

  const status = healthReport?.status || "offline_mitigated";

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> Banco de Dados & Armazenamento
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-xs font-bold">
              Arquitetura NC-A1
            </span>
            {healthReport?.isCustom && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px] font-bold">
                Endpoint Customizado
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            Diagnóstico, Governança & Auditoria Supabase
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitoramento de sessão canônica, integridade RLS, trilha imutável de auditoria e contingência offline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfigForm(!showConfigForm)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            Configurar Endpoint
          </button>
          <button
            onClick={runHealthCheck}
            disabled={isChecking}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin text-white" : ""}`} />
            {isChecking ? "Verificando..." : "Testar Conexão"}
          </button>
        </div>
      </div>

      {/* NC-A1 Architectural Principles Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-950 border border-teal-800 text-teal-300 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Regras Arquiteturais Canônicas (NC-A1)
              </h2>
              <p className="text-[11px] text-slate-400">
                Conformidade de identidade permanente, isolamento por dispositivo e segurança LGPD.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
            Ativo & Vigente
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider block">
              1. Dispositivo
            </span>
            <p className="text-slate-200 font-semibold">Mero Meio de Acesso</p>
            <p className="text-[11px] text-slate-400">
              Trocar de celular, tablet ou PC não recria conta nem esvazia perfis.
            </p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-teal-400 font-extrabold uppercase text-[10px] tracking-wider block">
              2. Supabase Auth
            </span>
            <p className="text-slate-200 font-semibold">Identidade Canônica</p>
            <p className="text-[11px] text-slate-400">
              <code className="text-teal-300">auth.users.id</code> é o identificador único e persistente do usuário.
            </p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-cyan-400 font-extrabold uppercase text-[10px] tracking-wider block">
              3. Supabase DB + RLS
            </span>
            <p className="text-slate-200 font-semibold">Fonte Oficial dos Dados</p>
            <p className="text-[11px] text-slate-400">
              Row Level Security garante que cada usuário só acessa o que é seu.
            </p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider block">
              4. Trilha de Auditoria
            </span>
            <p className="text-slate-200 font-semibold">Eventos Imutáveis</p>
            <p className="text-[11px] text-slate-400">
              Tabela <code className="text-emerald-300">audit_events</code> registra quem, quando e o que alterou.
            </p>
          </div>
        </div>
      </div>

      {/* Active Session Identity Status */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-800/60 rounded-3xl space-y-3 shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-teal-950 border border-teal-700/80 text-teal-300 rounded-2xl shrink-0 mt-0.5">
            <UserCheck className="w-5 h-5 text-teal-400" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">
                  Estado da Identidade Atual
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  isAuthenticated 
                    ? "bg-emerald-950 text-emerald-300 border-emerald-700" 
                    : "bg-amber-950 text-amber-300 border-amber-700"
                }`}>
                  {isAuthenticated ? "Sessão Canônica Supabase" : "Modo Visitante Local"}
                </span>
              </div>
              {isAuthenticated && user?.id && (
                <span className="font-mono text-[11px] text-teal-300 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                  UUID: {user.id}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isAuthenticated ? (
                <>
                  Você está autenticado como <strong>{userProfile.preferredName}</strong> ({user?.email || userProfile.email}). Seus dados são sincronizados no Supabase e associados ao seu identificador exclusivo, protegidos por RLS.
                </>
              ) : (
                <>
                  Você está operando em <strong>Modo Local / Visitante</strong>. Conecte sua conta para garantir persistência entre computadores e celulares diferentes.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Local Storage Integrity Metrics */}
        {healthReport?.totalLocalRecords && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Tarefas de Rotina:</span>
              <span className="font-bold text-teal-300 text-sm">{healthReport.totalLocalRecords.routineTasks} salvas</span>
            </div>
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Testes Psicométricos:</span>
              <span className="font-bold text-teal-300 text-sm">{healthReport.totalLocalRecords.testHistory} registros</span>
            </div>
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Perfil & Acomodações:</span>
              <span className="font-bold text-emerald-300 text-sm">{isAuthenticated ? "Sincronizado" : "Local"}</span>
            </div>
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Motor Local:</span>
              <span className="font-bold text-emerald-400 text-sm flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> 100% Operacional
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Config Drawer if toggled */}
      {showConfigForm && (
        <form onSubmit={handleSaveCustomConfig} className="bg-slate-900 border border-cyan-800/80 rounded-3xl p-5 space-y-4 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-200 flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              Configuração de Conexão Supabase Própria
            </h3>
            <span className="text-[11px] text-slate-400">Insira suas chaves do console Supabase</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL do Projeto (Endpoint HTTPS):
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://exemplo.supabase.co"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Chave Anônima Pública (anon key):
              </label>
              <input
                type="text"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                required
              />
            </div>
          </div>

          {configSuccessMsg && (
            <p className="text-xs text-emerald-400 font-semibold">{configSuccessMsg}</p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetToDefaultConfig}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Padrão
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfigForm(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition shadow-sm"
              >
                Salvar Credenciais
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Sync & Backup Trigger Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Sync Trigger Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-md flex flex-col justify-between">
          <div className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-teal-400" />
              Sincronização Canônica (NC-A1)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Executa a sincronização segura e idempotente entre os registros locais e as tabelas oficiais com RLS no Supabase.
            </p>
          </div>
          
          <button
            onClick={handleSyncAllData}
            disabled={syncing}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar com Nuvem Supabase"}
          </button>
        </div>

        {/* Local Backup Export Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-md flex flex-col justify-between">
          <div className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" />
              Exportar Backup Local (JSON)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Baixe uma cópia integral de segurança com 1 clique para garantia adicional de custódia dos dados.
            </p>
          </div>

          <button
            onClick={handleExportFullBackup}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Baixar Backup Local
          </button>
        </div>

      </div>

      {/* Sync Logs */}
      {syncLogs.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs font-mono space-y-1.5 text-slate-300 shadow-inner">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[11px] text-slate-400">
            <span>Log da Operação de Sincronização:</span>
            <button onClick={() => setSyncLogs([])} className="hover:text-slate-200">Limpar</button>
          </div>
          {syncLogs.map((log, idx) => (
            <p key={idx}>{log}</p>
          ))}
        </div>
      )}

      {/* Audit Log Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Trilha de Auditoria Recente (<code className="text-xs text-teal-300">public.audit_events</code>)
            </h2>
            <p className="text-xs text-slate-400">
              Registros imutáveis de ações relevantes realizadas no sistema, incluindo migrações e atualizações de perfil.
            </p>
          </div>
          <button
            onClick={loadAuditLogs}
            disabled={isLoadingAudit}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAudit ? "animate-spin" : ""}`} />
            <span>Atualizar Trilha</span>
          </button>
        </div>

        {auditEvents.length === 0 ? (
          <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            Nenhum evento registrado ainda na sessão corrente.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
            {auditEvents.slice(0, 15).map((evt) => (
              <div 
                key={evt.id} 
                className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200">{evt.action}</span>
                    <span className="text-slate-400 ml-2 font-mono text-[11px]">({evt.entity_type})</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0 font-mono">
                  <span>{new Date(evt.created_at).toLocaleString("pt-BR")}</span>
                  <span className="hidden sm:inline px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {evt.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SQL Script for Table Creation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-400" />
              Script SQL Canônico (NC-A1) para Supabase
            </h2>
            <p className="text-xs text-slate-400">
              Copie este código e execute no <strong>SQL Editor</strong> do painel Supabase para provisionar as tabelas com RLS e triggers de auditoria.
            </p>
          </div>
          <button
            onClick={handleCopySQL}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold rounded-xl text-xs flex items-center gap-2 transition border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiado!" : "Copiar SQL NC-A1"}
          </button>
        </div>

        <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
          {SUPABASE_SQL_SCHEMA}
        </pre>
      </div>

    </div>
  );
};
