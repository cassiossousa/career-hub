/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute origin of the job-tracker API (e.g. https://api.example.com).
   *  Empty/undefined means same-origin `/api` — used by the vite dev/preview
   *  proxy. Required for deployed builds. */
  readonly VITE_API_URL?: string;
}
