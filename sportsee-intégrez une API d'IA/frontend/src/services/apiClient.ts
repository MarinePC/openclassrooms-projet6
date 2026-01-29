// src/services/apiClient.ts
"use client";

import { getAuthToken } from "@/services/authToken";

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

function getToken(): string | null {
  return getAuthToken();
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    ...(init?.headers ?? {}),
  };

  if (token) {
    (headers as any).Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const body = await parseJsonSafe(res);

  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      message:
        (body &&
          typeof body === "object" &&
          body !== null &&
          "message" in body &&
          String((body as any).message)) ||
        res.statusText ||
        "Request failed",
      details: body,
    };
    throw err;
  }

  return body as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(data ?? {}),
      headers: { "Content-Type": "application/json" },
    }),
};
