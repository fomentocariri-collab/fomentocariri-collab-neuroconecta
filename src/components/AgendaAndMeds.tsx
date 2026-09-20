import React, { useState, useEffect, useCallback } from "react";
import { 
  Calendar, 
  Pill, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Trophy, 
  Flame, 
  Award, 
  Download, 
  Sparkles, 
  AlertCircle,
  Check,
  Bell,
  Heart,
  Stethoscope,
  School,
  CalendarCheck
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { auditService } from "../services/auditService";

export interface AgendaEvent {
  id: string;
  title: string;
  category: "consulta" | "terapia" | "escola" | "medicamento" | "evento";
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  professionalOrPlace?: string;
  notes?: string;
  completed: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string; // ex: "10mg", "1 comprimido"
  time: string; // ex: "08:00"
  frequency: string; // ex: "Diário", "12 em 12h"
  takenToday: boolean;
  lastTakenDate?: string;
  notes?: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export const AgendaAndMeds: React.FC<{ isDark?: boolean }> = ({ isDark = true }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"agenda" | "meds" | "conquistas">("agenda");

  // State: Agenda Events
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventCategory, setNewEventCategory] = useState<AgendaEvent["category"]>("consulta");
  const [newEventDate, setNewEventDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newEventTime, setNewEventTime] = useState("09:00");
  const [newEventPlace, setNewEventPlace] = useState("");
  const [newEventNotes, setNewEventNotes] = useState("");

  // State: Medications
  const [meds, setMeds] = useState<Medication[]>([]);
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedTime, setNewMedTime] = useState("08:00");
  const [newMedFrequency, setNewMedFrequency] = useState("Diário");

  // State: Gamification
  const [streakDays, setStreakDays] = useState(3);
  const [badges, setBadges] = useState<AchievementBadge[]>([
    { id: "b1", title: "Primeiro Passo", description: "Configurou suas preferências e iniciou sua jornada no aplicativo.", icon: "🌟", unlocked: true, unlockedDate: "01/08/2026" },
    { id: "b2", title: "Pausa & Autocuidado", description: "Experimentou uma pausa sensorial no seu próprio ritmo.", icon: "🎧", unlocked: true, unlockedDate: "02/08/2026" },
    { id: "b3", title: "Construção de Rotina", description: "Organizou atividades e etapas no planejador de rotina visual.", icon: "📅", unlocked: true, unlockedDate: "03/08/2026" },
    { id: "b4", title: "Gestão da Rotina", description: "Personalizou seus horários e lembretes de suporte para o dia a dia.", icon: "🧭", unlocked: false },
    { id: "b5", title: "Voz & Autonomia", description: "Explorou cartões ou scripts na biblioteca de Comunicação Alternativa (CAA).", icon: "💬", unlocked: false },
    { id: "b6", title: "Autoconhecimento", description: "Registrou suas preferências sensoriais e formas favoritas de participação.", icon: "🌱", unlocked: false },
  ]);

  // Load events from Supabase
  const loadEvents = useCallback(async () => {
    if (!user) {
      setEvents([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("agenda_events")
        .select("*")
        .eq("owner_user_id", user.id)
        .order("date", { ascending: true });

      if (error) {
        console.error("[Agenda] Erro ao buscar eventos no Supabase:", error);
        return;
      }

      if (data && data.length > 0) {
        setEvents(
          data.map((row: any) => ({
            id: row.id,
            title: row.title,
            category: row.category,
            date: row.date,
            time: row.time,
            professionalOrPlace: row.professional_or_place,
            notes: row.notes,
            completed: !!row.completed,
          }))
        );
      } else {
        setEvents([]);
      }
    } catch (e) {
      console.error("[Agenda] Falha ao carregar eventos:", e);
    }
  }, [user]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Load medications from localStorage (transient / client preference)
  useEffect(() => {
    try {
      const storedMeds = localStorage.getItem("neuroconecta_medications");
      if (storedMeds) {
        const parsed: Medication[] = JSON.parse(storedMeds);
        const todayStr = new Date().toLocaleDateString("pt-BR");
        const resetMeds = parsed.map((m) => {
          if (m.lastTakenDate !== todayStr) {
            return { ...m, takenToday: false };
          }
          return m;
        });
        setMeds(resetMeds);
      } else {
        const defaultMeds: Medication[] = [
          { id: "m1", name: "Suplemento de Magnésio & B6", dosage: "1 cápsula", time: "08:00", frequency: "Diário (Manhã)", takenToday: false },
          { id: "m2", name: "Melatonina", dosage: "3mg", time: "21:30", frequency: "Diário (Noite)", takenToday: false },
        ];
        setMeds(defaultMeds);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveMeds = (updated: Medication[]) => {
    setMeds(updated);
    try {
      localStorage.setItem("neuroconecta_medications", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Add Agenda Event directly to Supabase
  const handleAddEvent = async () => {
    if (!newEventTitle.trim()) return;
    if (!user) {
      alert("É necessário estar autenticado para agendar compromissos.");
      return;
    }

    const eventId = crypto.randomUUID ? crypto.randomUUID() : `ev-${Date.now()}`;
    const newEv: AgendaEvent = {
      id: eventId,
      title: newEventTitle.trim(),
      category: newEventCategory,
      date: newEventDate,
      time: newEventTime,
      professionalOrPlace: newEventPlace.trim() || undefined,
      notes: newEventNotes.trim() || undefined,
      completed: false,
    };

    const { error } = await supabase.from("agenda_events").insert({
      id: newEv.id,
      owner_user_id: user.id,
      title: newEv.title,
      category: newEv.category,
      date: newEv.date,
      time: newEv.time,
      professional_or_place: newEv.professionalOrPlace || null,
      notes: newEv.notes || null,
      completed: newEv.completed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[Agenda] Erro ao gravar evento no Supabase:", error);
      alert(`Erro ao salvar compromisso no Supabase: ${error.message}`);
      return;
    }

    await auditService.log({
      actorUserId: user.id,
      action: "EVENT_CREATED",
      entityType: "agenda_event",
      entityId: newEv.id,
      afterData: { title: newEv.title, date: newEv.date },
      source: "AgendaAndMeds.handleAddEvent",
    });

    setEvents((prev) => [...prev, newEv]);
    setNewEventTitle("");
    setNewEventPlace("");
    setNewEventNotes("");
  };

  const handleToggleEvent = async (id: string) => {
    if (!user) return;
    const current = events.find((e) => e.id === id);
    if (!current) return;
    const newCompleted = !current.completed;

    const { error } = await supabase
      .from("agenda_events")
      .update({ completed: newCompleted, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("owner_user_id", user.id);

    if (error) {
      console.error("[Agenda] Erro ao atualizar status do evento:", error);
      alert(`Erro ao atualizar evento: ${error.message}`);
      return;
    }

    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, completed: newCompleted } : e)));
  };

  const handleDeleteEvent = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("agenda_events")
      .delete()
      .eq("id", id)
      .eq("owner_user_id", user.id);

    if (error) {
      console.error("[Agenda] Erro ao excluir evento:", error);
      alert(`Erro ao excluir compromisso: ${error.message}`);
      return;
    }

    await auditService.log({
      actorUserId: user.id,
      action: "EVENT_DELETED",
      entityType: "agenda_event",
      entityId: id,
      source: "AgendaAndMeds.handleDeleteEvent",
    });

    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Add Medication
  const handleAddMed = () => {
    if (!newMedName.trim()) return;
    const newM: Medication = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || "1 dose",
      time: newMedTime,
      frequency: newMedFrequency,
      takenToday: false,
    };
    saveMeds([...meds, newM]);
    setNewMedName("");
    setNewMedDosage("");
  };

  const handleToggleMedTaken = (id: string) => {
    const todayStr = new Date().toLocaleDateString("pt-BR");
    const updated = meds.map((m) => {
      if (m.id === id) {
        const newTaken = !m.takenToday;
        return {
          ...m,
          takenToday: newTaken,
          lastTakenDate: newTaken ? todayStr : m.lastTakenDate,
        };
      }
      return m;
    });
    saveMeds(updated);

    // Unlock badge if all meds taken
    const allTaken = updated.length > 0 && updated.every((m) => m.takenToday);
    if (allTaken) {
      setBadges((prev) =>
        prev.map((b) => (b.id === "b4" ? { ...b, unlocked: true, unlockedDate: todayStr } : b))
      );
    }
  };

  const handleDeleteMed = (id: string) => {
    saveMeds(meds.filter((m) => m.id !== id));
  };

  // Export event to .ics format
  const handleExportICS = (event: AgendaEvent) => {
    const dateFormatted = event.date.replace(/-/g, "");
    const timeFormatted = event.time.replace(":", "") + "00";
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//NeuroConecta//Agenda//PT",
      "BEGIN:VEVENT",
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.notes || "Compromisso NeuroConecta"}`,
      `LOCATION:${event.professionalOrPlace || "A definir"}`,
      `DTSTART:${dateFormatted}T${timeFormatted}`,
      `DTEND:${dateFormatted}T${timeFormatted}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `compromisso_${event.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className={`rounded-2xl p-6 border shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-teal-500 dark:text-teal-400" />
            <span>Agenda Integrada, Medicamentos & Conquistas</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Acompanhe compromissos, lembretes de rotina diária e celebre seus passos em organização, comunicação e autonomia.
          </p>
        </div>

        {/* Gamification Streak Mini Widget */}
        <div className={`flex items-center gap-3 p-3 rounded-2xl border ${
          isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
            <Flame className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">Sequência Ativa</span>
            <div className="text-lg font-extrabold">{streakDays} Dias Seguidos!</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: "agenda", label: "📅 Agenda & Consultas", icon: Calendar },
          { id: "meds", label: "💊 Lembrete de Medicamentos", icon: Pill },
          { id: "conquistas", label: "🏆 Conquistas & Metas", icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition whitespace-nowrap ${
                isActive
                  ? "bg-teal-600 text-white shadow-md"
                  : isDark
                  ? "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                  : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: AGENDA & CONSULTAS */}
      {activeTab === "agenda" && (
        <div className="space-y-6">
          
          {/* Events List */}
          <div className="space-y-3">
            <h3 className={`text-base font-bold flex items-center justify-between ${
              isDark ? "text-slate-100" : "text-slate-900"
            }`}>
              <span>Compromissos Agendados ({events.length})</span>
            </h3>

            {events.length === 0 ? (
              <div className={`p-8 text-center border rounded-2xl text-xs sm:text-sm ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"
              }`}>
                Nenhum compromisso agendado. Adicione consultas, terapias ou reuniões escolares abaixo.
              </div>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    ev.completed
                      ? isDark ? "bg-slate-950/60 border-slate-800 opacity-60 line-through" : "bg-slate-100 border-slate-200 opacity-60 line-through"
                      : isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleEvent(ev.id)}
                      className={`p-2 rounded-xl transition mt-0.5 ${
                        ev.completed
                          ? "bg-emerald-500/20 text-emerald-500"
                          : isDark ? "bg-slate-800 text-slate-400 hover:text-slate-200" : "bg-slate-100 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                          ev.category === "terapia" ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20" :
                          ev.category === "consulta" ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20" :
                          ev.category === "escola" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20" :
                          "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
                        }`}>
                          {ev.category}
                        </span>
                        <h4 className="font-bold text-sm sm:text-base">{ev.title}</h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-teal-500" /> {ev.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-teal-500" /> {ev.time}
                        </span>
                        {ev.professionalOrPlace && (
                          <span className="text-teal-600 dark:text-teal-400 font-sans font-medium">
                            📍 {ev.professionalOrPlace}
                          </span>
                        )}
                      </div>

                      {ev.notes && (
                        <p className="text-xs italic text-slate-600 dark:text-slate-300">"{ev.notes}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleExportICS(ev)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                        isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700" : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                      }`}
                      title="Sincronizar / Baixar para Calendário (.ics)"
                    >
                      <Download className="w-3.5 h-3.5 text-teal-500" />
                      <span>.ICS</span>
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Event Form */}
          <div className={`p-5 rounded-2xl border space-y-4 shadow-lg ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Agendar Novo Compromisso:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Título (Ex: Consulta T.O, Reunião PEI)..."
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className={`sm:col-span-2 px-3.5 py-2 border rounded-xl text-xs ${
                  isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />

              <select
                value={newEventCategory}
                onChange={(e) => setNewEventCategory(e.target.value as any)}
                className={`px-3 py-2 border rounded-xl text-xs ${
                  isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                <option value="terapia">Terapia</option>
                <option value="consulta">Consulta Médica</option>
                <option value="escola">Escola / PEI</option>
                <option value="evento">Evento Social</option>
              </select>

              <div className="flex gap-2">
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className={`w-full px-2 py-2 border rounded-xl text-xs font-mono ${
                    isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className={`px-2 py-2 border rounded-xl text-xs font-mono ${
                    isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              <input
                type="text"
                placeholder="Local ou Profissional (Ex: Dr. Silva / Clínica X)..."
                value={newEventPlace}
                onChange={(e) => setNewEventPlace(e.target.value)}
                className={`sm:col-span-2 px-3.5 py-2 border rounded-xl text-xs ${
                  isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />

              <input
                type="text"
                placeholder="Anotações / Lembretes importantes..."
                value={newEventNotes}
                onChange={(e) => setNewEventNotes(e.target.value)}
                className={`sm:col-span-2 px-3.5 py-2 border rounded-xl text-xs ${
                  isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>

            <button
              onClick={handleAddEvent}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition shadow"
            >
              Adicionar Compromisso à Agenda
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: MEDICAMENTOS */}
      {activeTab === "meds" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className={`text-base font-bold flex items-center justify-between ${
              isDark ? "text-slate-100" : "text-slate-900"
            }`}>
              <span>Lembrete de Medicamentos & Suplementos Diários ({meds.length})</span>
            </h3>

            {meds.length === 0 ? (
              <div className={`p-8 text-center border rounded-2xl text-xs sm:text-sm ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"
              }`}>
                Nenhum medicamento cadastrado. Adicione suas medicações e dosagens diárias para acompanhar tomadas.
              </div>
            ) : (
              meds.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    m.takenToday
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleMedTaken(m.id)}
                      className={`p-2.5 rounded-xl transition mt-0.5 ${
                        m.takenToday
                          ? "bg-emerald-600 text-white shadow"
                          : isDark ? "bg-slate-800 text-slate-400 hover:text-slate-200" : "bg-slate-100 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base">{m.name}</h4>
                        <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                          {m.dosage}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" /> Horário: {m.time}
                        </span>
                        <span>Frequência: {m.frequency}</span>
                      </div>

                      {m.takenToday && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          ✓ Tomado hoje ({m.lastTakenDate})
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMed(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition self-end sm:self-center"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Medication Form */}
          <div className={`p-5 rounded-2xl border space-y-4 shadow-lg ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Medicamento / Suplemento:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Nome do remédio/suplemento..."
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                className={`px-3.5 py-2 border rounded-xl text-xs ${
                  isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />

              <input
                type="text"
                placeholder="Dosagem (Ex: 10mg, 1 cp)..."
                value={newMedDosage}
                onChange={(e) => setNewMedDosage(e.target.value)}
                className={`px-3.5 py-2 border rounded-xl text-xs ${
                  isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />

              <input
                type="time"
                value={newMedTime}
                onChange={(e) => setNewMedTime(e.target.value)}
                className={`px-3 py-2 border rounded-xl text-xs font-mono ${
                  isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />

              <select
                value={newMedFrequency}
                onChange={(e) => setNewMedFrequency(e.target.value)}
                className={`px-3 py-2 border rounded-xl text-xs ${
                  isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                <option value="Diário (Manhã)">Diário (Manhã)</option>
                <option value="Diário (Tarde)">Diário (Tarde)</option>
                <option value="Diário (Noite)">Diário (Noite)</option>
                <option value="De 12 em 12h">De 12 em 12h</option>
                <option value="Conforme necessário">Conforme necessário</option>
              </select>
            </div>

            <button
              onClick={handleAddMed}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition shadow"
            >
              Cadastrar Medicamento
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: CONQUISTAS & METAS */}
      {activeTab === "conquistas" && (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border space-y-4 shadow-xl ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  <span>Galeria de Conquistas NeuroConecta</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Reconhecimento positivo pelos seus passos diários em autorregulação, organização, rotina e autoconhecimento.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase font-bold">Desbloqueadas:</span>
                <div className="text-xl font-extrabold text-teal-600 dark:text-teal-400 font-mono">
                  {badges.filter((b) => b.unlocked).length} / {badges.length}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                    b.unlocked
                      ? isDark ? "bg-slate-950 border-teal-800/80 shadow-md" : "bg-slate-50 border-teal-200 shadow-md"
                      : isDark ? "bg-slate-950/40 border-slate-800/60 opacity-40 grayscale" : "bg-slate-100 border-slate-200 opacity-40 grayscale"
                  }`}
                >
                  <div className="text-3xl flex-shrink-0">{b.icon}</div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">{b.title}</h4>
                      {b.unlocked && <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">{b.description}</p>
                    {b.unlockedDate && (
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono block">
                        Conquistado em {b.unlockedDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
