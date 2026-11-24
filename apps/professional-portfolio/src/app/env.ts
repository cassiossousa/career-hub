const value: unknown = import.meta.env.VITE_API_URL;

/** Absolute origin of the job-tracker API; '' means same-origin `/api`
 *  (vite dev/preview proxy). Required for deployed builds. */
export const apiBaseUrl = typeof value === 'string' ? value : '';
