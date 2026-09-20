import { SavedTestResult } from "../types";

const GLOBAL_HISTORY_KEY = "neuroconecta_global_assessments_db";
const LOCAL_USER_HISTORY_KEY = "neuroconecta_test_history";

export const getGlobalTestHistory = (): SavedTestResult[] => {
  try {
    const stored = localStorage.getItem(GLOBAL_HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Erro ao carregar histórico global de autoavaliações:", e);
  }
  return [];
};

export const getUserTestHistory = (userId?: string): SavedTestResult[] => {
  const all = getGlobalTestHistory();
  if (!userId) return all;
  return all.filter((item) => item.userId === userId || !item.userId);
};

export const saveTestResultToStore = (result: SavedTestResult): SavedTestResult[] => {
  try {
    const all = getGlobalTestHistory();
    const updated = [result, ...all.filter((i) => i.id !== result.id)];
    localStorage.setItem(GLOBAL_HISTORY_KEY, JSON.stringify(updated));
    localStorage.setItem(LOCAL_USER_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Erro ao salvar resultado no banco de dados local:", e);
    return [];
  }
};

export const clearAllTestHistory = (): SavedTestResult[] => {
  try {
    localStorage.removeItem(GLOBAL_HISTORY_KEY);
    localStorage.removeItem(LOCAL_USER_HISTORY_KEY);
  } catch (e) {
    console.error(e);
  }
  return [];
};

