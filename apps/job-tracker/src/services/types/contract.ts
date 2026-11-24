import type { components } from '../api/generated/openapi';

/**
 * Contract type helpers bridging the generated OpenAPI types
 * (`services/api/generated/openapi.ts`, synced from job-tracker-api's
 * committed `openapi.json`) and this app's hand-written zod validators.
 */

export type Schemas = components['schemas'];

/**
 * Recursively rewrites a generated contract type so every optional property
 * also admits `undefined` (`k?: T` -> `k?: T | undefined`).
 *
 * `exactOptionalPropertyTypes` forbids assigning explicit `undefined` to
 * `k?: T`, while zod's `.optional()`/`.nullish()` always produce
 * `T | undefined` — without this mapping every `satisfies z.ZodType<T>`
 * check against a generated type would fail. Index signatures are left
 * strict so `Record<string, number>` contract fields stay `number`, not
 * `number | undefined`.
 */
export type Wire<T> = T extends readonly (infer U)[]
  ? Wire<U>[]
  : T extends object
    ? {
        [K in keyof T]: string extends K
          ? Wire<T[K]>
          : number extends K
            ? Wire<T[K]>
            : undefined extends T[K]
              ? Wire<T[K]> | undefined
              : Wire<T[K]>;
      }
    : T;
