import { env } from '../../app/env';
import { isMockApiEnabled } from '../../app/mockApi';

const usingMockApi = isMockApiEnabled(env);
const API_URL = usingMockApi ? '' : env.apiUrl;
const API_KEY = usingMockApi ? '' : env.apiKey;

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

interface ErrorResponse {
  error: ApiError;
}

interface ApiResponse<T> {
  data: T;
}

export class ApiErrorWrapper extends Error {
  code: string;
  details?: unknown;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiError';
    this.code = apiError.code;
    this.details = apiError.details;
  }
}

/** The request never reached the server (DNS, offline, CORS, aborted). */
export class UnreachableError extends Error {
  constructor() {
    super('Network request failed');
    this.name = 'UnreachableError';
  }
}

export function isApiError(error: unknown): error is ApiErrorWrapper {
  return error instanceof ApiErrorWrapper;
}

export function isUnreachableError(error: unknown): error is UnreachableError {
  return error instanceof UnreachableError;
}

// Resolve to an absolute URL so the configured API_URL origin is honored
// even when the page is served from a different one.
function resolveUrl(url: string): string {
  const base = API_URL === '' ? globalThis.location.origin : API_URL;
  return new URL(url, base).toString();
}

// XHR keeps the client dependency-free and gives MSW a transport it
// intercepts in both the browser (msw/browser) and Jest (msw/node) setups.
function request<T>(
  method: string,
  url: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, resolveUrl(url));
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (API_KEY) {
      xhr.setRequestHeader('Authorization', `Bearer ${API_KEY}`);
    }
    xhr.addEventListener('load', () => {
      // Status 0 means no HTTP response was received (MSW network-error
      // mocks surface this way under XHR).
      if (xhr.status === 0) {
        reject(new UnreachableError());
        return;
      }
      const text = xhr.responseText;
      let data: unknown = null;
      if (text !== '') {
        try {
          data = JSON.parse(text);
        } catch {
          data = null;
        }
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ data: data as T });
        return;
      }
      const envelope = (data as ErrorResponse | null)?.error;
      if (envelope !== undefined) {
        reject(new ApiErrorWrapper(envelope));
      } else {
        reject(new Error(`Request failed with status ${xhr.status}`));
      }
    });
    xhr.addEventListener('error', () => {
      reject(new UnreachableError());
    });
    xhr.send(body === undefined ? null : JSON.stringify(body));
  });
}

export const apiClient = {
  get: <T = unknown>(url: string) => request<T>('GET', url),
  post: <T = unknown>(url: string, data?: unknown) =>
    request<T>('POST', url, data),
  put: <T = unknown>(url: string, data?: unknown) =>
    request<T>('PUT', url, data),
  patch: <T = unknown>(url: string, data?: unknown) =>
    request<T>('PATCH', url, data),
  delete: <T = unknown>(url: string) => request<T>('DELETE', url),
};
