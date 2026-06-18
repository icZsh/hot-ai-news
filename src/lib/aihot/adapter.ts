import { ZodError } from "zod";
import {
  normalizeDailyIndex,
  normalizeDailyReport,
  normalizeItemsResponse,
} from "./normalizers";
import type {
  AdapterResult,
  AihotError,
  NormalizedDailyIndex,
  NormalizedDailyReport,
  NormalizedItemsResponse,
} from "./types";

const DEFAULT_BASE_URL = "https://aihot.virxact.com";
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

type FetchOptions = {
  revalidate?: number;
  timeoutMs?: number;
  retries?: number;
};

type ItemsOptions = FetchOptions & {
  mode?: "selected" | "all";
  category?: string;
  take?: number;
  cursor?: string;
};

const baseUrl = process.env.AIHOT_BASE_URL ?? DEFAULT_BASE_URL;
const userAgent = process.env.AIHOT_USER_AGENT ?? DEFAULT_USER_AGENT;

export async function fetchSelectedItems(
  options: ItemsOptions = {},
): Promise<AdapterResult<NormalizedItemsResponse>> {
  const params = new URLSearchParams();
  params.set("mode", options.mode ?? "selected");
  params.set("take", String(options.take ?? 80));

  if (options.category && options.category !== "all") {
    params.set("category", options.category);
  }

  if (options.cursor) {
    params.set("cursor", options.cursor);
  }

  return fetchAndNormalize(
    `/api/public/items?${params.toString()}`,
    normalizeItemsResponse,
    options,
  );
}

export async function fetchLatestDaily(
  options: FetchOptions = {},
): Promise<AdapterResult<NormalizedDailyReport>> {
  return fetchAndNormalize(
    "/api/public/daily",
    normalizeDailyReport,
    options,
  );
}

export async function fetchDailyBySourceDate(
  sourceDate: string,
  options: FetchOptions = {},
): Promise<AdapterResult<NormalizedDailyReport>> {
  return fetchAndNormalize(
    `/api/public/daily/${encodeURIComponent(sourceDate)}`,
    normalizeDailyReport,
    options,
  );
}

export async function fetchDailyIndex(
  options: FetchOptions = {},
): Promise<AdapterResult<NormalizedDailyIndex>> {
  return fetchAndNormalize(
    "/api/public/dailies?take=10",
    normalizeDailyIndex,
    options,
  );
}

async function fetchAndNormalize<T>(
  path: string,
  normalize: (input: unknown, fetchedAt?: string) => T,
  options: FetchOptions,
): Promise<AdapterResult<T>> {
  try {
    const payload = await fetchJson(path, options);
    return {
      ok: true,
      data: normalize(payload),
    };
  } catch (error) {
    return {
      ok: false,
      error: toAihotError(error),
    };
  }
}

async function fetchJson(path: string, options: FetchOptions): Promise<unknown> {
  const url = new URL(path, baseUrl);
  const retries = options.retries ?? 1;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": userAgent,
        },
        signal: AbortSignal.timeout(options.timeoutMs ?? 8000),
        next: {
          revalidate: options.revalidate ?? 300,
        },
      });

      if (!response.ok) {
        throw httpError(response);
      }

      return response.json();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !shouldRetry(error)) {
        break;
      }
    }
  }

  throw lastError;
}

function shouldRetry(error: unknown): boolean {
  if (error instanceof ZodError) {
    return false;
  }

  if (typeof error === "object" && error && "status" in error) {
    const status = Number((error as { status?: number }).status);
    return status >= 500 || status === 408 || status === 429;
  }

  return true;
}

function httpError(response: Response): Error & { status?: number } {
  const error = new Error(`AI HOT request failed with ${response.status}`) as Error & {
    status?: number;
  };
  error.status = response.status;
  return error;
}

function toAihotError(error: unknown): AihotError {
  if (error instanceof ZodError) {
    return {
      code: "parse_error",
      message: "AI HOT 返回字段变化，暂时无法解析。",
    };
  }

  if (error instanceof DOMException && error.name === "TimeoutError") {
    return {
      code: "remote_timeout",
      message: "AI HOT 响应超时，稍后再试。",
    };
  }

  if (typeof error === "object" && error && "status" in error) {
    const status = Number((error as { status?: number }).status);

    if (status >= 400 && status < 500) {
      return {
        code: "remote_4xx",
        message: `AI HOT 暂时拒绝了请求（${status}）。`,
      };
    }

    if (status >= 500) {
      return {
        code: "remote_5xx",
        message: `AI HOT 服务暂时不可用（${status}）。`,
      };
    }
  }

  return {
    code: "unknown",
    message: error instanceof Error ? error.message : "未知错误。",
  };
}
