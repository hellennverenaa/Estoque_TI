export type ApiClientOptions = {
  baseURL?: string;
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const trimSlash = (value: string) => value.replace(/\/+$/, '');

const defaultBaseURL = (() => {
  const envUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;
  return envUrl ? trimSlash(envUrl) : '';
})();

const buildUrl = (path: string, baseURL: string) => {
  if (!baseURL) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${baseURL}${path}`;
  return `${baseURL}/${path}`;
};

const toQueryString = (params?: Record<string, unknown>) => {
  if (!params) return '';
  const search = new URLSearchParams();

  for (const [key, raw] of Object.entries(params)) {
    if (raw === undefined || raw === null || raw === '') continue;
    search.set(key, String(raw));
  }

  const str = search.toString();
  return str ? `?${str}` : '';
};

export const createApiClient = (options: ApiClientOptions = {}) => {
  const baseURL = options.baseURL ?? defaultBaseURL;

  const request = async <T>(
    method: string,
    path: string,
    {
      body,
      params,
      headers,
      signal
    }: {
      body?: unknown;
      params?: Record<string, unknown>;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    } = {}
  ): Promise<T> => {
    const url = buildUrl(`${path}${toQueryString(params)}`, baseURL);

    const res = await fetch(url, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(headers ?? {})
      },
      body: body ? JSON.stringify(body) : undefined,
      signal
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

    if (!res.ok) {
      const message =
        (payload && typeof payload === 'object' && 'message' in (payload as any) && String((payload as any).message)) ||
        `Erro na requisição (${res.status})`;
      throw new ApiError(message, res.status, payload);
    }

    return payload as T;
  };

  return {
    get: <T>(path: string, params?: Record<string, unknown>, signal?: AbortSignal) =>
      request<T>('GET', path, { params, signal }),

    post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
      request<T>('POST', path, { body, signal }),

    patch: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
      request<T>('PATCH', path, { body, signal }),

    delete: <T>(path: string, signal?: AbortSignal) => request<T>('DELETE', path, { signal })
  };
};

export const apiClient = createApiClient();
