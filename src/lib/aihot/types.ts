export type AihotCategory =
  | "ai-models"
  | "ai-products"
  | "industry"
  | "paper"
  | "tip";

export type NormalizedItem = {
  id: string;
  title: string;
  titleEn?: string;
  url: string;
  sourceName: string;
  publishedAt?: string;
  summary?: string;
  category?: AihotCategory;
  raw?: unknown;
};

export type NormalizedItemsResponse = {
  count: number;
  hasNext: boolean;
  nextCursor: string | null;
  items: NormalizedItem[];
  fetchedAt: string;
};

export type NormalizedDailyItem = {
  title: string;
  summary?: string;
  sourceName?: string;
  sourceUrl: string;
  raw?: unknown;
};

export type NormalizedDailySection = {
  label: string;
  items: NormalizedDailyItem[];
};

export type NormalizedDailyReport = {
  sourceDate: string;
  localDate: string;
  timezone: string;
  generatedAt?: string;
  windowStart?: string;
  windowEnd?: string;
  leadTitle?: string;
  leadParagraph?: string;
  sections: NormalizedDailySection[];
  fetchedAt: string;
  raw?: unknown;
};

export type NormalizedDailyIndexItem = {
  sourceDate: string;
  localDate: string;
  generatedAt?: string;
  leadTitle?: string;
  leadParagraph?: string;
};

export type NormalizedDailyIndex = {
  count: number;
  items: NormalizedDailyIndexItem[];
  fetchedAt: string;
};

export type AdapterResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: AihotError;
    };

export type AihotError = {
  message: string;
  code:
    | "remote_timeout"
    | "remote_4xx"
    | "remote_5xx"
    | "parse_error"
    | "unknown";
};
