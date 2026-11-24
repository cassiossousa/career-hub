import axios, { type AxiosError } from 'axios';
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

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (API_KEY) {
  apiClient.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${API_KEY}`;
    return config;
  });
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    const data: ErrorResponse | undefined = error.response?.data;
    if (data?.error) {
      return Promise.reject(new ApiErrorWrapper(data.error));
    }
    return Promise.reject(error);
  },
);

class ApiErrorWrapper extends Error {
  code: string;
  details?: unknown;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiError';
    this.code = apiError.code;
    this.details = apiError.details;
  }
}

export function isApiError(error: unknown): error is ApiErrorWrapper {
  return error instanceof ApiErrorWrapper;
}
