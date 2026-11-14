import type { DemoClimateResponse, LiveClimateResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
// The backend waits up to 120 s for NASA on the first call for a new place.
const TIMEOUT_MS = 90_000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS), ...init });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError")
      throw new Error("NASA took too long to answer. Wait a moment, then try again.");
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

const post = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const getLiveClimate = (latitude: number, longitude: number) =>
  request<LiveClimateResponse>("/climate/", post({ latitude, longitude }));
