import React, { useState, useEffect, useCallback } from "react";
import { CalendarCheck, Plus, Trash2, CheckCircle2, Clock, Play, Pause, RotateCcw, Sparkles, Image, Bell, BellRing, Upload, Camera } from "lucide-react";
import { RoutineTask } from "../types";
import { useFocusTimer } from "../hooks/useFocusTimer";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { auditService } from "../services/auditService";

export const RoutinePlanner: React.FC<{ isDark?: boolean }> = ({ isDark = true }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [activeSlot, setActiveSlot] = useState<"manha" | "tarde" | "noite">("manha");
  const [isLoading, setIsLoading] = useState(false);

  // Form states for new task
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<RoutineTask["category"]>("trabalho");
  const [newMinutes, setNewMinutes] = useState(30);
  const [newReminderTime, setNewReminderTime] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  // Preset Visual Cards / Photos
  const presetPhotos = [
    { label: "💧 Água / Hidratação", url: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80" },
    { label: "🎧 Pausa Sensorial / Abafador", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80" },
    { label: "🥗 Refeição / Lanche", url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&auto=format&fit=crop&q=80" },
    { label: "💻 Trabalho / Foco", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop&q=80" },
    { label: "📚 Leitura / Estudo", url: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80" },
    { label: "🛋️ Descanso / Mente Calma", url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&auto=format&fit=crop&q=80" },
  ];

  // Micro-steps breakdown tool state
  const [breakdownInput, setBreakdownInput] = useState("");
  const [generatedSteps, setGeneratedSteps] = useState<string[]>([]);
  const [isGeneratingSteps, setIsGeneratingSteps] = useState(false);

  // Notifications state
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);

  // Sensory Pause & Focus Timer (Persistent across modules and sessions)
  const {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    formatTime,
  } = useFocusTimer();

  const isTimerRunning = timerState.isRunning;
  const timerSeconds = timerState.remainingSeconds;
  const timerMode = timerState.mode;

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsAllowed(true);
    }
  }, []);

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotificationsAllowed(true);
          new Notification("🔔 NeuroConecta", {
            body: "Notificações inteligentes ativadas com sucesso para a sua rotina!",
          });
        }
      });
    } else {
      alert("Seu navegador não suporta Notificações do sistema, mas os alertas visuais continuarão funcionando!");
    }
  };

  // Load tasks from Supabase
  const loadTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("routine_tasks")
        .select("*")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[RoutinePlanner] Erro ao buscar rotina no Supabase:", error);
        return;
      }

      if (data && data.length > 0) {
        setTasks(
          data.map((row: any) => ({
            id: row.id,
            timeSlot: row.time_slot,
            title: row.title,
            category: row.category,
            completed: !!row.completed,
            estimatedMinutes: row.estimated_minutes || 15,
            reminderTime: row.reminder_time,
            imageUrl: row.image_url,
            steps: row.steps || [],
          }))
        );
      } else {
        setTasks([]);
      }
    } catch (e) {
      console.error("[RoutinePlanner] Falha de rede ao carregar rotina:", e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    if (!user) {
      alert("É necessário estar autenticado para gravar tarefas de rotina.");
      return;
    }

    const taskId = crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`;
    const newTask: RoutineTask = {
      id: taskId,
      timeSlot: activeSlot,
      title: newTitle.trim(),
      category: newCategory,
      completed: false,
      estimatedMinutes: Number(newMinutes) || 15,
      reminderTime: newReminderTime.trim() || undefined,
      imageUrl: newImageUrl || undefined,
      steps: generatedSteps.length > 0 ? generatedSteps : undefined,
    };

    // Grava estritamente no Supabase primeiro
    const { error } = await supabase.from("routine_tasks").insert({
      id: newTask.id,
      owner_user_id: user.id,
      title: newTask.title,
      time_slot: newTask.timeSlot,
      category: newTask.category,
      completed: newTask.completed,
      estimated_minutes: newTask.estimatedMinutes,
      reminder_time: newTask.reminderTime || null,
      image_url: newTask.imageUrl || null,
      steps: newTask.steps || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[RoutinePlanner] Erro ao gravar tarefa no Supabase:", error);
      alert(`Erro ao salvar tarefa no Supabase: ${error.message}`);
      return;
    }

    await auditService.log({
      actorUserId: user.id,
      action: "TASK_CREATED",
      entityType: "routine_task",
      entityId: newTask.id,
      afterData: { title: newTask.title, timeSlot: newTask.timeSlot },
      source: "RoutinePlanner.handleAddTask",
    });

    setTasks((prev) => [...prev, newTask]);
    setNewTitle("");
    setNewReminderTime("");
    setNewImageUrl("");
    setGeneratedSteps([]);
  };

  const handleToggleComplete = async (id: string) => {
    if (!user) return;
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    const newCompleted = !current.completed;

    const { error } = await supabase
      .from("routine_tasks")
      .update({ completed: newCompleted, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("owner_user_id", user.id);

    if (error) {
      console.error("[RoutinePlanner] Erro ao atualizar tarefa:", error);
      alert(`Erro ao atualizar tarefa: ${error.message}`);
      return;
    }

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)));
  };

  const handleDeleteTask = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("routine_tasks")
      .delete()
      .eq("id", id)
      .eq("owner_user_id", user.id);

    if (error) {
      console.error("[RoutinePlanner] Erro ao excluir tarefa:", error);
      alert(`Erro ao excluir tarefa: ${error.message}`);
      return;
    }

    await auditService.log({
      actorUserId: user.id,
      action: "TASK_DELETED",
      entityType: "routine_task",
      entityId: id,
      source: "RoutinePlanner.handleDeleteTask",
    });

    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Micro-steps generator
  const handleGenerateBreakdown = () => {
    if (!breakdownInput.trim()) return;
    setIsGeneratingSteps(true);
    setTimeout(() => {
      const steps = [
        `Preparar o ambiente silencioso para "${breakdownInput}"`,
        `Separar apenas os materiais/links necessários`,
        `Executar a primeira etapa por 10 minutos sem interrupção`,
        `Fazer uma breve pausa para checar progresso`,
        `Finalizar e guardar materiais`,
      ];
      setGeneratedSteps(steps);
      setNewTitle(breakdownInput);
      setIsGeneratingSteps(false);
    }, 600);
  };

  const filteredTasks = tasks.filter((t) => t.timeSlot === activeSlot);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className={`rounded-2xl p-6 border shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-teal-500 dark:text-teal-400" />
            <span>Rotina Visual & Lembretes Inteligentes</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Acompanhe suas etapas do dia com fotos visuais reais, lembretes suaves e micro-passos para vencer a paralisia executiva.
          </p>
        </div>

        {/* Notifications & Sensory Timer Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={requestNotificationPermission}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
              notificationsAllowed
                ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30"
                : isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
            }`}
          >
            {notificationsAllowed ? <BellRing className="w-4 h-4 text-teal-500" /> : <Bell className="w-4 h-4" />}
            <span>{notificationsAllowed ? "Lembretes Ativos" : "Ativar Notificações"}</span>
          </button>

          {/* Sensory Timer Widget */}
          <div className={`border rounded-2xl p-3 flex items-center gap-3 text-xs sm:text-sm ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
          }`}>
            <div className="text-center">
              <button
                type="button"
                onClick={() => switchMode(timerMode === "foco" ? "pausa" : "foco")}
                title="Clique para alternar entre Bloco de Foco (25m) e Pausa Sensorial (5m)"
                className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 tracking-wider hover:underline flex items-center gap-1"
              >
                <span>{timerMode === "foco" ? "Foco (25m)" : "Pausa (5m)"}</span>
              </button>
              <div className={`text-xl font-extrabold font-mono ${isDark ? "text-slate-100" : "text-slate-900"}`}>{formatTime(timerSeconds)}</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => (isTimerRunning ? pauseTimer() : startTimer())}
                className={`p-2 rounded-xl transition shadow-sm ${
                  isTimerRunning
                    ? "bg-amber-600 hover:bg-amber-500 text-white animate-pulse"
                    : "bg-teal-600 hover:bg-teal-500 text-white"
                }`}
                title={isTimerRunning ? "Pausar Timer (continua salvo ao sair da aba)" : "Iniciar Timer de Foco"}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={resetTimer}
                className={`p-2 rounded-xl transition ${isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"}`}
                title="Reiniciar Duração Original"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Micro-Breakdown Helper */}
      <div className={`border rounded-2xl p-5 space-y-4 shadow-md ${
        isDark ? "bg-slate-900/90 border-teal-800/60" : "bg-white border-teal-200"
      }`}>
        <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-teal-700 dark:text-teal-300">
          <Sparkles className="w-5 h-5 text-teal-500 animate-pulse" />
          <span>Decompositor de Tarefas Complexas (Micro-Passos Visuais)</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Sente paralisia executiva diante de uma tarefa grande? Digite o nome da tarefa para quebrá-la em etapas minúsculas e fáceis de iniciar:
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={breakdownInput}
            onChange={(e) => setBreakdownInput(e.target.value)}
            placeholder="Ex: Arrumar o quarto, Escrever relatório, Fazer compras..."
            className={`flex-1 px-4 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 ${
              isDark ? "bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
            }`}
          />
          <button
            onClick={handleGenerateBreakdown}
            disabled={isGeneratingSteps || !breakdownInput.trim()}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2"
          >
            {isGeneratingSteps ? "Gerando..." : "Gerar Passos Visuais"}
          </button>
        </div>

        {generatedSteps.length > 0 && (
          <div className={`p-4 border rounded-xl space-y-2 ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Passos Sugeridos para Adicionar à Rotina:</h4>
            <ol className="list-decimal list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1">
              {generatedSteps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Time Slot Tabs */}
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: "manha", label: "🌅 Manhã" },
            { id: "tarde", label: "☀️ Tarde" },
            { id: "noite", label: "🌙 Noite" },
          ].map((slot) => (
            <button
              key={slot.id}
              onClick={() => setActiveSlot(slot.id as any)}
              className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition ${
                activeSlot === slot.id
                  ? "bg-teal-600 text-white shadow"
                  : isDark
                  ? "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                  : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>

        {/* Task Visual List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className={`p-8 text-center border rounded-2xl text-xs sm:text-sm ${
              isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"
            }`}>
              Nenhuma tarefa cadastrada para o período da <strong>{activeSlot}</strong>. Adicione uma nova tarefa com foto abaixo.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition flex flex-col space-y-3 ${
                  task.completed
                    ? isDark ? "bg-slate-950/60 border-slate-800 opacity-60 line-through" : "bg-slate-100 border-slate-200 opacity-60 line-through"
                    : isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  {/* Task details & optional Photo */}
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className={`p-2 rounded-xl transition flex-shrink-0 mt-1 ${
                        task.completed
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : isDark ? "bg-slate-800 text-slate-400 hover:text-slate-200" : "bg-slate-100 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    {/* Image Preview Card if present */}
                    {task.imageUrl && (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border flex-shrink-0 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
                        <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`font-bold text-base ${isDark ? "text-slate-100" : "text-slate-900"}`}>{task.title}</h4>
                        {task.reminderTime && (
                          <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {task.reminderTime}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium capitalize block">
                        {task.category.replace("_", " ")} • {task.estimatedMinutes} min
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition self-end sm:self-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Steps if present */}
                {task.steps && task.steps.length > 0 && (
                  <div className="pl-11 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Etapas:</p>
                    <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                      {task.steps.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Task Form with Photo Upload and Presets */}
        <div className={`p-5 rounded-2xl space-y-4 border shadow-lg ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`}>
            <Camera className="w-4 h-4 text-teal-500" />
            <span>Adicionar Nova Atividade com Foto na {activeSlot}:</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nome da atividade (Ex: Beber água, Almoço)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={`sm:col-span-2 px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm ${
                isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />

            <div className="flex gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className={`w-full px-3 py-2 border rounded-xl text-xs ${
                  isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                <option value="trabalho">Trabalho/Estudo</option>
                <option value="pausa_sensorial">Pausa Sensorial</option>
                <option value="autocuidado">Autocuidado</option>
                <option value="refeicao">Refeição/Água</option>
                <option value="lazer">Lazer</option>
              </select>

              <input
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                className={`px-2 py-2 border rounded-xl text-xs font-mono ${
                  isDark ? "bg-slate-950 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
                title="Horário do lembrete"
              />
            </div>
          </div>

          {/* Photo Presets & Upload */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Escolha uma Foto de Referência Visual ou Faça Upload:</label>
            
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
              {presetPhotos.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setNewImageUrl(preset.url)}
                  className={`flex-shrink-0 flex items-center gap-2 p-1.5 rounded-xl border text-xs transition ${
                    newImageUrl === preset.url
                      ? "bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-300 ring-2 ring-teal-500"
                      : isDark
                      ? "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-lg object-cover" />
                  <span className="text-[11px] pr-1.5">{preset.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700" : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
              }`}>
                <Upload className="w-4 h-4 text-teal-500" />
                <span>Carregar Imagem Real do seu Aparelho</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              {newImageUrl && (
                <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400">
                  <span className="font-bold">✓ Imagem selecionada</span>
                  <button onClick={() => setNewImageUrl("")} className="text-slate-400 hover:text-rose-500">
                    Remover
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleAddTask}
            className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Tarefa na Rotina</span>
          </button>
        </div>

      </div>

    </div>
  );
};

