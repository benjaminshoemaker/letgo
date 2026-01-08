export type ApiErrorPayload = {
  error: string;
  code?: string;
  details?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await res.json().catch(() => null)) as ApiErrorPayload | T | null;

  if (!res.ok) {
    const payload = data as ApiErrorPayload | null;
    const details = payload?.details;
    const message =
      typeof details === "string" && details.trim().length > 0
        ? details
        : payload?.error ?? res.statusText;

    throw new ApiError(message, res.status, payload?.code, details);
  }

  return data as T;
}
