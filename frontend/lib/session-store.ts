import { useSyncExternalStore } from "react";

// Volatile in-memory session store. Refreshing the page clears this data.
// aiLevel: how much the assistant may do. 1 advice only, 2 compare the plans, 3 seasonal planning.
// Not set means level 2, the backend's default.
export type AiLevel = 1 | 2 | 3;
// The farmer's own answers about the farm (lib/farm-profile.ts). Kept with the rest of the session, in memory only.
export type Priority =
  | "water"
  | "organic-matter"
  | "nitrogen"
  | "erosion"
  | "pests"
  | "forage"
  | "market"
  | "small-change";
export type WaterAccess = "rain-only" | "some" | "full";
export type KitAccess = "own" | "contractor" | "none";
export type MarketAccess = "yes" | "unsure" | "no";
export type SoilType = "sandy" | "loam" | "clay" | "unsure";
export type FarmProfile = {
  priorities?: Priority[];
  water?: WaterAccess;
  kit?: KitAccess;
  market?: MarketAccess;
  soilType?: SoilType;
  // Soil organic matter (%) from the farmer's own lab report. Optional.
  organicMatter?: number;
};
export type FarmSession = {
  farmName?: string;
  latitude?: number;
  longitude?: number;
  crop?: string;
  aiLevel?: AiLevel;
  profile?: FarmProfile;
};
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
export const updateProfile = (patch: Partial<FarmProfile>) =>
  set({ ...currentSession, profile: { ...currentSession.profile, ...patch } });
export const clearSession = () => set(EMPTY);
export const useSession = () => useSyncExternalStore(subscribe, () => currentSession, () => EMPTY);
