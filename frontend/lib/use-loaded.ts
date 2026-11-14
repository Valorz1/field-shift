"use client";

import { useEffect, useState } from "react";

// One request per key per page load, shared by every component that asks for it. Memory only.
const cache = new Map<string, Promise<unknown>>();

type Loaded<T> = { key: string | null; data?: T; error?: string };

// key says what is being loaded; null means "nothing to load yet".
export function useLoaded<T>(key: string | null, load: () => Promise<T>) {
  const [loaded, setLoaded] = useState<Loaded<T>>({ key });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (key === null) return;
    let stale = false;
    let request = cache.get(key) as Promise<T> | undefined;
    if (!request) {
      request = load();
      request.catch(() => cache.delete(key)); // a failed request can be tried again
      cache.set(key, request);
    }
    request.then(
      (data) => stale || setLoaded({ key, data }),
      (error: Error) => stale || setLoaded({ key, error: error.message }),
    );
    return () => {
      stale = true;
    };
    // load is rebuilt on every render; key says when the request really changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const current = loaded.key === key ? loaded : { key };
  return {
    data: current.data,
    error: current.error,
    retry: () => {
      setLoaded({ key });
      setAttempt((n) => n + 1);
    },
  };
}
