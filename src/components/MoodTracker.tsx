import React, { useState, useEffect } from "react";
import {
  Smile,
  Frown,
  Meh,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  HeartPulse,
  Lock,
  Users,
  School,
  ShieldCheck,
  Share2,
  Tag,
  Clock,
  UserCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ExtendedMoodLogEntry, UserProfile } from "../types";
import { Lote1Api } from "../services/lote1Client";

interface MoodTrackerProps {
  isDark?: boolean;
  userProfile?: UserProfile;
  onOpenShareModal?: () => void;
}

const fallbackProfile: UserProfile = {
  preferredName: "Você",
  pronouns: "",
  diagnosisStatus: "investigacao",
  currentFocus: "rotina",
  supportLevel: "nao_especificado",
  lowStimulationMode: false,
  userRole: "pcd",
  emergencyContacts: [],
  onboardingCompleted: true,
};

export const MoodTracker: React.FC<MoodTrackerProps> = ({
  isDark = true,
  userProfile = fallbackProfile,
  onOpenShareModal,
}) => {
  const profile = userProfile || fallbackProfile;
  const subjectId = profile.email || "user-local";
  const [logs, setLogs] = useState<ExtendedMoodLogEntry[]>([]);
  const [deniedCount, setDeniedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filter tabs
  const [activeFilter, setActiveFilter] = useState<"todos" | "personal" | "caregiver" | "school">("todos");

  // New entry form state
  const [selectedMood, setSelectedMood] = useState<ExtendedMoodLogEntry["mood"]>("calmo");
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [sensoryLevel, setSensoryLevel] = useState<number>(2);
  const [notes, setNotes] = useState<string>("");
  const [triggerTag, setTriggerTag] = useState<string>("");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [contextTag, setContextTag] = useState<ExtendedMoodLogEntry["contextTag"]>("geral");

  // Default entry type depends on user role
  const defaultEntryType =
    profile.userRole === "cuidador_educador" && profile.professionalRoleType === "educador"
      ? "school_note"
      : profile.userRole === "cuidador_educador"
      ? "caregiver_observation"
      : "personal";

  const [entryType, setEntryType] = useState<"personal" | "caregiver_observation" | "school_note">(defaultEntryType);

  // Load logs via API + Local fallback
  const fetchLogs = async () => {
    setLoading(true);
    const res = await Lote1Api.getDiaryEntries(subjectId, profile);
    setLogs(res.entries);
    setDeniedCount(res.deniedPersonalEntriesCount);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [subjectId, profile.userRole]);

  const handleAddTriggerTag = () => {
    if (!triggerTag.trim()) return;
    if (!selectedTriggers.includes(triggerTag.trim())) {
      setSelectedTriggers([...selectedTriggers, triggerTag.trim()]);
    }
    setTriggerTag("");
  };

  const handleRemoveTriggerTag = (tag: string) => {
    setSelectedTriggers(selectedTriggers.filter((t) => t !== tag));
  };

  const handleSaveEntry = async () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const newEntry: ExtendedMoodLogEntry = {
      id: `log-${Date.now()}`,
      subjectId,
      entryType,
      authorId: profile.email || "local",
      authorName: profile.preferredName || "Usuário",
      authorRole:
        profile.userRole === "cuidador_educador" && profile.professionalRoleType === "educador"
          ? "Educador / Escola"
          : profile.userRole === "cuidador_educador"
          ? "Cuidador / Família"
          : "Pessoa no Centro",
      date: dateStr,
      time: timeStr,
      mood: selectedMood,
      energyLevel,
      sensoryLevel,
      notes: notes.trim(),
      triggers: selectedTriggers,
      contextTag,
      createdAt: now.toISOString(),
    };

    await Lote1Api.createDiaryEntry(newEntry, profile);
    setNotes("");
    setSelectedTriggers([]);
    await fetchLogs();
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    await Lote1Api.deleteDiaryEntry(id, subjectId, profile);
    await fetchLogs();
  };

  const moodOptions: { id: ExtendedMoodLogEntry["mood"]; label: string; icon: any; color: string }[] = [
    { id: "excelente", label: "Excelente", icon: Smile, color: "text-emerald-400 bg-emerald-950 border-emerald-700" },
    { id: "calmo", label: "Calmo / Regulado", icon: HeartPulse, color: "text-teal-400 bg-teal-950 border-teal-700" },
    { id: "neutro", label: "Neutro", icon: Meh, color: "text-slate-300 bg-slate-900 border-slate-700" },
    { id: "sobrecarregado", label: "Sobrecarregado", icon: AlertTriangle, color: "text-amber-400 bg-amber-950 border-amber-700" },
    { id: "exausto", label: "Exausto / Burnout", icon: Frown, color: "text-rose-400 bg-rose-950 border-rose-700" },
  ];

  // Filter logs for view
  const filteredLogs = logs.filter((log) => {
    if (activeFilter === "todos") return true;
    if (activeFilter === "personal") return !log.entryType || log.entryType === "personal";
    if (activeFilter === "caregiver") return log.entryType === "caregiver_observation";
    if (activeFilter === "school") return log.entryType === "school_note";
    return true;
  });

  // Chart data formatting
  const chartData = [...logs]
    .reverse()
    .slice(-14)
    .map((entry) => ({
      label: `${entry.date} ${entry.time}`,
      Energia: entry.energyLevel,
      Sensorial: entry.sensoryLevel,
      tipo:
        entry.entryType === "school_note"
          ? "Escola"
          : entry.entryType === "caregiver_observation"
          ? "Cuidador"
          : "Diário Íntimo",
    }));

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-xs font-bold">
              Autopercepção & Registros Contextualizados
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-teal-400" />
            Diário de Humor, Energia & Observações
          </h1>
          <p className="text-sm text-slate-400">
            Acompanhe o ritmo do seu bem-estar diário com distinção nítida entre seu diário íntimo e notas de apoio.
          </p>
        </div>

        {onOpenShareModal && (
          <button
            onClick={onOpenShareModal}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <Share2 className="w-4 h-4 text-teal-400" />
            <span>Gerenciar Privacidade & Compartilhamento</span>
          </button>
        )}
      </div>

      {/* Privacy Notice Card */}
      <div className="p-4 bg-teal-950/40 border border-teal-900/60 rounded-2xl flex items-start gap-3 text-xs text-teal-200">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <p className="font-semibold text-teal-300">
            Garantia de Privacidade: Diário Íntimo Protegido por Padrão
          </p>
          <p className="text-slate-300">
            Os registros marcados como <strong>Diário Íntimo Pessoal</strong> pertencem exclusivamente à pessoa no centro e
            <strong> não</strong> são compartilhados automaticamente com escola ou familiares. Observações de cuidadores e notas escolares
            possuem autoria explícita e contexto delimitado.
          </p>
        </div>
      </div>

      {/* Denied Entries Notice */}
      {deniedCount > 0 && (
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            Existem <strong>{deniedCount}</strong> registro(s) no Diário Íntimo Pessoal resguardados pelo titular e não acessíveis neste papel.
          </span>
        </div>
      )}

      {/* NEW ENTRY FORM */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-teal-400" /> Novo Registro de Estado & Vivência
          </h2>

          {/* Type Selector with Clear Distinctions */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Tipo:</span>
            <select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-semibold"
            >
              <option value="personal">🔒 Diário Íntimo Pessoal (Privacidade Máxima)</option>
              <option value="caregiver_observation">👨‍👩‍👧 Observação do Cuidador / Família</option>
              <option value="school_note">🏫 Observação Escolar / AEE</option>
            </select>
          </div>
        </div>

        {/* Informative pill about active entry type */}
        <div className="text-xs py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-400" />
            <span>
              Autor: <strong>{userProfile.preferredName || "Você"}</strong> ({userProfile.userRole || "Pessoa no Centro"})
            </span>
          </div>
          <span className="text-[11px] text-slate-400 italic">
            {entryType === "personal"
              ? "Privado para você"
              : entryType === "caregiver_observation"
              ? "Observação de apoio cotidiano"
              : "Contexto pedagógico escolar"}
          </span>
        </div>

        {/* Mood Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400">Como você está se sentindo agora?</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {moodOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedMood === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedMood(opt.id)}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition ${
                    isSelected
                      ? opt.color + " ring-2 ring-teal-500 shadow-md font-bold scale-[1.02]"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders for Energy and Sensory Levels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Energy Slider */}
          <div className="space-y-2 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">Bateria Social / Nível de Energia:</span>
              <span className="text-teal-400 font-bold text-sm">{energyLevel} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Esgotado (1)</span>
              <span>Moderado (3)</span>
              <span>Energizado (5)</span>
            </div>
          </div>

          {/* Sensory Overload Slider */}
          <div className="space-y-2 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">Nível de Estímulo / Sobrecarga Sensorial:</span>
              <span className="text-amber-400 font-bold text-sm">{sensoryLevel} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={sensoryLevel}
              onChange={(e) => setSensoryLevel(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Tranquilo (1)</span>
              <span>Sobrecarga Leve (3)</span>
              <span>Crítico / Meltdown (5)</span>
            </div>
          </div>
        </div>

        {/* Context Tag and Triggers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Contexto da Atividade:</label>
            <select
              value={contextTag}
              onChange={(e) => setContextTag(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
            >
              <option value="geral">Geral / Dia a dia</option>
              <option value="vitoria">Vitória / Conquista Regulada</option>
              <option value="rotina">Rotina Doméstica / Cuidado</option>
              <option value="sala_de_aula">Sala de Aula / Estudos</option>
              <option value="intervalo">Recreio / Intervalo / Pausa</option>
              <option value="gatilho">Episódio de Gatilho / Estresse</option>
              <option value="comunicacao">Tentativa de Comunicação / AAC</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-400">Gatilhos ou Fatores Notáveis (Opcional):</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Barulho, Fone abafador, Luz fluorescente, Prova..."
                value={triggerTag}
                onChange={(e) => setTriggerTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTriggerTag();
                  }
                }}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddTriggerTag}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Inserir
              </button>
            </div>
            {selectedTriggers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedTriggers.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-slate-800 text-teal-300 text-xs rounded-lg flex items-center gap-1 border border-slate-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTriggerTag(tag)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Text Note */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Anotações detalhadas:</label>
          <textarea
            rows={3}
            placeholder={
              entryType === "personal"
                ? "Como foi sua experiência? O que sentiu no corpo? (Espaço íntimo e protegido)"
                : entryType === "caregiver_observation"
                ? "Descreva a resposta comportamental observada, estratégias que ajudaram e o contexto familiar..."
                : "Descreva a participação pedagógica, interações com pares ou adaptações realizadas em aula..."
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveEntry}
            disabled={loading}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Salvar Registro</span>
          </button>
        </div>
      </div>

      {/* CHART SECTION */}
      {chartData.length > 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                Acompanhamento & Autopercepção Sensorial
              </h2>
              <p className="text-[11px] text-slate-400">
                Visualização temporal de tendências para suporte funcional (não constitui diagnóstico médico).
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-teal-400">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Energia
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Estímulo Sensorial
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[1, 5]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "11px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Energia"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#14b8a6" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Sensorial"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#f59e0b" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* FILTER TABS FOR ENTRIES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex overflow-x-auto no-scrollbar gap-2">
            {[
              { id: "todos", label: "🌟 Todos os Registros" },
              { id: "personal", label: "🔒 Meu Diário Íntimo" },
              { id: "caregiver", label: "👨‍👩‍👧 Observações de Cuidador" },
              { id: "school", label: "🏫 Observações Escolares" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  activeFilter === tab.id
                    ? "bg-teal-950 text-teal-200 border border-teal-700"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400">
            {filteredLogs.length} registro(s) encontrado(s)
          </span>
        </div>

        {/* LOGS LIST */}
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 text-xs">
              Nenhum registro encontrado nesta categoria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isPersonal = !log.entryType || log.entryType === "personal";
              const isCaregiver = log.entryType === "caregiver_observation";
              const isSchool = log.entryType === "school_note";

              return (
                <div
                  key={log.id}
                  className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 hover:border-slate-700 transition shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {log.date} às {log.time}
                      </span>

                      {/* Entry Type Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          isPersonal
                            ? "bg-purple-950 text-purple-300 border-purple-800"
                            : isCaregiver
                            ? "bg-amber-950 text-amber-300 border-amber-800"
                            : "bg-cyan-950 text-cyan-300 border-cyan-800"
                        }`}
                      >
                        {isPersonal
                          ? "🔒 Diário Íntimo"
                          : isCaregiver
                          ? "👨‍👩‍👧 Cuidador"
                          : "🏫 Escola"}
                      </span>

                      {/* Context Tag */}
                      {log.contextTag && (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded-md font-medium">
                          {log.contextTag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">
                        Por: <strong className="text-slate-300">{log.authorName || "Pessoa"}</strong>
                      </span>

                      <button
                        onClick={() => handleDeleteEntry(log.id)}
                        className="text-slate-500 hover:text-rose-400 transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mood & Levels */}
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200 capitalize">
                      <span>Humor:</span>
                      <span className="text-teal-400 font-bold">{log.mood}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span>Energia:</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-teal-300">
                        {log.energyLevel}/5
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span>Sensorial:</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-amber-300">
                        {log.sensoryLevel}/5
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {log.notes && (
                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                      {log.notes}
                    </p>
                  )}

                  {/* Triggers Tags */}
                  {log.triggers && log.triggers.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {log.triggers.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-950 text-slate-400 rounded-md text-[10px] border border-slate-800"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
