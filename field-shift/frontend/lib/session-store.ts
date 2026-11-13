// Volatile in-memory session store. Refreshing the page clears this data.
export type FarmSession = { farmName?: string; latitude?: number; longitude?: number; crop?: string };
let currentSession: FarmSession = {};
export const getSession = () => ({ ...currentSession });
export const updateSession = (patch: Partial<FarmSession>) => { currentSession = { ...currentSession, ...patch }; };
export const clearSession = () => { currentSession = {}; };
