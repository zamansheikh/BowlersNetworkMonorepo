// ============================================================================
// BowlersNetwork — API Client (Native Fetch)
// ============================================================================
// Thin wrapper around fetch for calling the external backend API.
// The backend is a third-party service accessed via NEXT_PUBLIC_API_URL.
//
// Why native fetch instead of Axios:
// Next.js App Router is built around fetch — it enables built-in caching,
// revalidation, deduplication, and streaming. Axios bypasses all of this.
// ============================================================================

import type { AuthResponse, User, LoginPayload, SignupPayload } from "@bowlersnetwork/types";

const TOKEN_KEY = "access_token";

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: unknown
  ) {
    super(`${status} ${statusText}`);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function createApiClient(baseUrl: string) {
  async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, headers: customHeaders, ...rest } = options;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    // Attach Bearer token if available
    const token = getToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers,
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);

      if (response.status === 401 && typeof window !== "undefined") {
        clearToken();
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }

      throw new ApiError(response.status, response.statusText, errorBody);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  return {
    get: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>(endpoint, { ...options, method: "GET" }),

    post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
      request<T>(endpoint, { ...options, method: "POST", body }),

    put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
      request<T>(endpoint, { ...options, method: "PUT", body }),

    patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
      request<T>(endpoint, { ...options, method: "PATCH", body }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>(endpoint, { ...options, method: "DELETE" }),
  };
}

// Default client — reads base URL from environment variable
// Each app sets NEXT_PUBLIC_API_URL in its .env.local
export const api = createApiClient(
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend.bowlersnetwork.com"
);

export { createApiClient };

// --- Typed API Functions (expand per domain as features are built) ------------

export const authApi = {
  login: (data: LoginPayload) => api.post<AuthResponse>("/api/auth/login", data),
  signup: (data: SignupPayload) => api.post<AuthResponse>("/api/auth/signup", data),
  logout: () => api.post<void>("/api/auth/logout"),
  me: () => api.get<User>("/api/auth/me"),
};

export { ApiError as default };
