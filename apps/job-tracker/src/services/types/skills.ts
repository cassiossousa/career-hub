import type { SkillCategory } from './portfolio';

/** Canonical technical-skill catalog row (mirrors GET /api/skills). */
export interface Skill {
  id: number;
  name: string;
  group: SkillCategory;
  labels: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface SkillListPage {
  skills: Skill[];
  total: number;
}

export interface SkillCreate {
  name: string;
  group: SkillCategory;
  labels?: Record<string, string> | undefined;
}

export interface SkillPatch {
  name?: string | undefined;
  group?: SkillCategory | undefined;
  labels?: Record<string, string> | undefined;
}

/** Per-locale display labels for one skill group (mirrors GET /api/skill-group-labels). */
export interface SkillGroupLabels {
  group: SkillCategory;
  labels: Record<string, string>;
}

export interface SkillGroupLabelsList {
  groups: SkillGroupLabels[];
}
