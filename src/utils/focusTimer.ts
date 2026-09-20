// NeuroConecta • Persistent Focus Timer Utility
// Armazena e calcula o tempo do cronômetro com base em timestamps reais (wall-clock time),
// garantindo que o cronômetro continue correndo mesmo ao navegar entre abas ou sair da Rotina Visual.

export interface FocusTimerState {
  mode: "foco" | "pausa";
  isRunning: boolean;
  targetEndTime: number | null; // Timestamp ms em que o bloco atual deve terminar
  remainingSeconds: number; // Segundos restantes quando pausado ou no momento atual
  totalDurationSeconds: number; // Duração total configurada (ex: 25*60 para foco, 5*60 para pausa)
  lastUpdated: number;
}

const STORAGE_KEY = "neuroconecta_focus_timer_state";
const DEFAULT_FOCO_SECONDS = 25 * 60;
const DEFAULT_PAUSA_SECONDS = 5 * 60;

export const FOCUS_TIMER_EVENT = "neuroconecta_focus_timer_tick";

export function getInitialFocusTimerState(): FocusTimerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: FocusTimerState = JSON.parse(raw);
      if (parsed.isRunning && parsed.targetEndTime) {
        const now = Date.now();
        const left = Math.max(0, Math.ceil((parsed.targetEndTime - now) / 1000));
        return {
          ...parsed,
          remainingSeconds: left,
          isRunning: left > 0,
        };
      }
      return parsed;
    }
  } catch (e) {
    console.error("Erro ao carregar estado do timer de foco:", e);
  }

  return {
    mode: "foco",
    isRunning: false,
    targetEndTime: null,
    remainingSeconds: DEFAULT_FOCO_SECONDS,
    totalDurationSeconds: DEFAULT_FOCO_SECONDS,
    lastUpdated: Date.now(),
  };
}

export function saveFocusTimerState(state: FocusTimerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(FOCUS_TIMER_EVENT, { detail: state }));
  } catch (e) {
    console.error("Erro ao salvar estado do timer de foco:", e);
  }
}

export function startFocusTimer(currentState: FocusTimerState): FocusTimerState {
  const now = Date.now();
  const currentRemaining = currentState.remainingSeconds > 0 
    ? currentState.remainingSeconds 
    : (currentState.mode === "foco" ? DEFAULT_FOCO_SECONDS : DEFAULT_PAUSA_SECONDS);

  const newState: FocusTimerState = {
    ...currentState,
    isRunning: true,
    remainingSeconds: currentRemaining,
    targetEndTime: now + currentRemaining * 1000,
    lastUpdated: now,
  };

  saveFocusTimerState(newState);
  return newState;
}

export function pauseFocusTimer(currentState: FocusTimerState): FocusTimerState {
  let left = currentState.remainingSeconds;
  if (currentState.isRunning && currentState.targetEndTime) {
    left = Math.max(0, Math.ceil((currentState.targetEndTime - Date.now()) / 1000));
  }

  const newState: FocusTimerState = {
    ...currentState,
    isRunning: false,
    remainingSeconds: left,
    targetEndTime: null,
    lastUpdated: Date.now(),
  };

  saveFocusTimerState(newState);
  return newState;
}

export function resetFocusTimer(mode: "foco" | "pausa" = "foco"): FocusTimerState {
  const duration = mode === "foco" ? DEFAULT_FOCO_SECONDS : DEFAULT_PAUSA_SECONDS;
  const newState: FocusTimerState = {
    mode,
    isRunning: false,
    remainingSeconds: duration,
    targetEndTime: null,
    totalDurationSeconds: duration,
    lastUpdated: Date.now(),
  };

  saveFocusTimerState(newState);
  return newState;
}

export function switchFocusTimerMode(nextMode: "foco" | "pausa"): FocusTimerState {
  const duration = nextMode === "foco" ? DEFAULT_FOCO_SECONDS : DEFAULT_PAUSA_SECONDS;
  const newState: FocusTimerState = {
    mode: nextMode,
    isRunning: false,
    remainingSeconds: duration,
    targetEndTime: null,
    totalDurationSeconds: duration,
    lastUpdated: Date.now(),
  };

  saveFocusTimerState(newState);
  return newState;
}
