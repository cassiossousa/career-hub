import type { Schemas, Wire } from './contract';

/** Canonical technical-skill catalog row (mirrors GET /api/skills). */
export type Skill = Wire<Schemas['SkillResponse']>;

export type SkillListPage = Wire<Schemas['SkillListResponse']>;

export type SkillCreate = Wire<Schemas['SkillCreate']>;

export type SkillPatch = Wire<Schemas['SkillPatch']>;

/** Per-locale display labels for one skill group (mirrors GET /api/skill-group-labels). */
export type SkillGroupLabels = Wire<Schemas['SkillGroupLabelsResponse']>;

export type SkillGroupLabelsList = Wire<
  Schemas['SkillGroupLabelsListResponse']
>;
