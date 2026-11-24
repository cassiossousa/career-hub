import { setupWorker } from 'msw/browser';
import { env } from '../app/env';
import { handlers, unhandledApiGuard } from './handlers';

export const worker = setupWorker(
  ...handlers,
  // Production demo builds hard-block any /api/* request without a real
  // handler — the public demo must never reach the backend.
  ...(env.isDev ? [] : [unhandledApiGuard]),
);
