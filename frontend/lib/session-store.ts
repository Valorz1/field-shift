import { useSyncExternalStore } from "react";

// Volatile in-memory session store. Refreshing the page clears this data.
export type FarmSession = { farmName?: string; latitude?: number; longitude?: number; crop?: string };
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
