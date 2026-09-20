import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  FocusTimerState,
  getInitialFocusTimerState,
  startFocusTimer,
  pauseFocusTimer,
  resetFocusTimer,
  switchFocusTimerMode,
  saveFocusTimerState,
  FOCUS_TIMER_EVENT,
} from "../utils/focusTimer";

interface FocusTimerContextType {
  timerState: FocusTimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  switchMode: (mode: "foco" | "pausa") => void;
  formatTime: (secs: number) => string;
}

const FocusTimerContext = createContext<FocusTimerContextType | undefined>(undefined);

// Sensory-friendly gentle chime for neurodivergent comfort (smooth sine wave with soft envelope)
function playGentleChime(mode: "foco" | "pausa") {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Frequencies: 528Hz (solfeggio / calm) for pause, 440Hz for focus
    const freq = mode === "pausa" ? 528 : 440;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.3);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.85);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1000);
  } catch {
    // AudioContext blocked or not allowed by browser autoplay policy
  }
}

export const FocusTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timerState, setTimerState] = useState<FocusTimerState>(getInitialFocusTimerState);
  const stateRef = useRef(timerState);
  stateRef.current = timerState;

  // Cross-tab and window sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "neuroconecta_focus_timer_state") {
        setTimerState(getInitialFocusTimerState());
      }
    };

    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<FocusTimerState>;
      if (customEvent.detail) {
        setTimerState(customEvent.detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(FOCUS_TIMER_EVENT, handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(FOCUS_TIMER_EVENT, handleCustom);
    };
  }, []);

  // Central continuous interval ticker running at the root of the app
  useEffect(() => {
    let interval: any = null;

    if (timerState.isRunning && timerState.targetEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const current = stateRef.current;
        if (!current.isRunning || !current.targetEndTime) return;

        const left = Math.max(0, Math.ceil((current.targetEndTime - now) / 1000));

        if (left <= 0) {
          // Timer finished
          clearInterval(interval);
          const nextMode: "foco" | "pausa" = current.mode === "foco" ? "pausa" : "foco";
          const nextDuration = nextMode === "foco" ? 25 * 60 : 5 * 60;

          const finishedState: FocusTimerState = {
            mode: nextMode,
            isRunning: false,
            targetEndTime: null,
            remainingSeconds: nextDuration,
            totalDurationSeconds: nextDuration,
            lastUpdated: Date.now(),
          };

          saveFocusTimerState(finishedState);
          setTimerState(finishedState);

          // Gentle sensory chime
          playGentleChime(nextMode);

          // System Notification if granted
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(
              nextMode === "pausa" ? "⏱️ Pausa Sensorial Iniciada!" : "🔔 Retorno ao Bloco de Foco!",
              {
                body:
                  nextMode === "pausa"
                    ? "Excelente trabalho! Descanse os olhos, alongue-se ou tome um copo de água."
                    : "Sua pausa sensorial terminou. Você pode retornar ao bloco de foco calmo.",
                icon: "/favicon.ico",
              }
            );
          }
        } else {
          setTimerState((prev) => {
            const updated = {
              ...prev,
              remainingSeconds: left,
              lastUpdated: now,
            };
            return updated;
          });
        }
      }, 500); // 500ms ticker for crisp, smooth second counting
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, timerState.targetEndTime, timerState.mode]);

  const handleStart = useCallback(() => {
    setTimerState((prev) => startFocusTimer(prev));
  }, []);

  const handlePause = useCallback(() => {
    setTimerState((prev) => pauseFocusTimer(prev));
  }, []);

  const handleReset = useCallback(() => {
    setTimerState((prev) => resetFocusTimer(prev.mode));
  }, []);

  const handleSwitchMode = useCallback((mode: "foco" | "pausa") => {
    setTimerState(() => switchFocusTimerMode(mode));
  }, []);

  const formatTime = useCallback((secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  return (
    <FocusTimerContext.Provider
      value={{
        timerState,
        startTimer: handleStart,
        pauseTimer: handlePause,
        resetTimer: handleReset,
        switchMode: handleSwitchMode,
        formatTime,
      }}
    >
      {children}
    </FocusTimerContext.Provider>
  );
};

export function useFocusTimer(): FocusTimerContextType {
  const context = useContext(FocusTimerContext);
  if (!context) {
    // Fallback if rendered outside provider: safe local state
    return {
      timerState: getInitialFocusTimerState(),
      startTimer: () => {},
      pauseTimer: () => {},
      resetTimer: () => {},
      switchMode: () => {},
      formatTime: (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
      },
    };
  }
  return context;
}
