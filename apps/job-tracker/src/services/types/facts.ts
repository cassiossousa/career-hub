import type { Schemas, Wire } from './contract';

export const FACT_CATEGORIES = [
  'identity',
  'contact',
  'work_authorization',
  'compensation',
  'logistics',
  'links',
  'demographics',
  'preferences',
] as const satisfies readonly Schemas['FactCategory'][];

export type FactCategory = Schemas['FactCategory'];

export const FACT_SENSITIVITIES = [
  'normal',
  'pii',
] as const satisfies readonly Schemas['FactSensitivity'][];

export type FactSensitivity = Schemas['FactSensitivity'];

/** Canonical profile fact row (mirrors GET /api/facts). */
export type ProfileFact = Wire<Schemas['ProfileFactResponse']>;

export type ProfileFactListPage = Wire<Schemas['ProfileFactListResponse']>;

export type ProfileFactUpsert = Wire<Schemas['ProfileFactUpsert']>;
