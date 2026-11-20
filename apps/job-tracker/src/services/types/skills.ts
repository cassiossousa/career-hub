import type { SkillCategory } from './portfolio';

/** Canonical technical-skill catalog row (mirrors GET /api/skills). */
export interface Skill {
  id: number;
  name: string;
  group: SkillCategory;
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
}

export interface SkillPatch {
  name?: string | undefined;
  group?: SkillCategory | undefined;
}
