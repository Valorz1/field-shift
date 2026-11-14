import { useSyncExternalStore } from "react";

// Volatile in-memory session store. Refreshing the page clears this data.
// aiLevel: how much the assistant may do. 1 advice only, 2 compare the plans, 3 seasonal planning.
// Not set means level 2, the backend's default.
export type AiLevel = 1 | 2 | 3;
export type FarmSession = { farmName?: string; latitude?: number; longitude?: number; crop?: string; aiLevel?: AiLevel };
export const DEFAULT_AI_LEVEL: AiLevel = 2;
const EMPTY: FarmSession = {};
let currentSession = EMPTY;
const listeners = new Set<() => void>();
const set = (next: FarmSession) => {
  currentSession = next;
  listeners.forEach((listener) => listener());
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};
export const getSession = () => ({ ...currentSession });
export const updateSession = (patch: Partial<FarmSession>) => set({ ...currentSession, ...patch });
export const clearSession = () => set(EMPTY);
export const useSession = () => useSyncExternalStore(subscribe, () => currentSession, () => EMPTY);
