import type { DemoClimateResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { cache: "no-store", ...init });
  } catch {
    throw new Error("Could not reach the Field Shift server. Check it is running, then try again.");
  }
  if (!response.ok) {
    const detail = await response
      .json()
      .then((body) => body?.detail)
      .catch(() => undefined);
    throw new Error(typeof detail === "string" ? detail : `The Field Shift server answered with an error (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export const getHealth = () => request<{ status: string }>("/health");

export const getDemoClimate = (farm: string) => request<DemoClimateResponse>(`/climate/demo/${farm}`);
