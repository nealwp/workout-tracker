import type { ExerciseData } from "@irondog/shared";
import { tokenStore } from "@/lib/secureStore";
import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function silentRefresh(): Promise<boolean> {
  const refreshToken = await tokenStore.getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return false;

  const data = await res.json();
  await tokenStore.setAccessToken(data.accessToken);
  await tokenStore.setRefreshToken(data.refreshToken);
  return true;
}

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await tokenStore.getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (!refreshPromise) {
      refreshPromise = silentRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;
    if (refreshed) {
      const newToken = await tokenStore.getAccessToken();
      return fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      });
    }

    throw new AuthError("Session expired");
  }

  return res;
}

export async function signInWithGoogle(idToken: string) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Sign in failed");
  return data;
}

export async function fetchMe() {
  const res = await authFetch("/auth/me");
  return res.json();
}

export async function signOutServer(refreshToken: string) {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function createWorkout() {
  const res = await authFetch("/workouts", {
    method: "POST",
  });
  return res.json();
}

export async function addExerciseToWorkout(
  workoutId: string,
  exercise: ExerciseData
) {
  const res = await authFetch(`/workouts/${workoutId}/exercises`, {
    method: "POST",
    body: JSON.stringify(exercise),
  });
  return res.json();
}
