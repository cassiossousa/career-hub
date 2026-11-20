import type { SkillCategory } from './types/portfolio';
import type { Skill, SkillCreate, SkillPatch } from './types/skills';

/** Editable row in the skills table; `id` is null for not-yet-created rows. */
export interface SkillRowDraft {
  id: number | null;
  name: string;
  group: SkillCategory;
}

/** Mirrors the backend `name_key`: casefolded, whitespace-collapsed name. */
export function skillNameKey(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function toRowDrafts(skills: readonly Skill[]): SkillRowDraft[] {
  return skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    group: skill.group,
  }));
}

export interface SkillChanges {
  creates: SkillCreate[];
  updates: { id: number; patch: SkillPatch }[];
  deletes: number[];
}

/**
 * Diffs draft rows against the server catalog. Blank-name rows never create
 * or update; a persisted row keeps its id in `seenIds` even when blank so it
 * is not mistaken for a deletion.
 */
type RowChange =
  | { kind: 'create'; value: SkillCreate }
  | { kind: 'update'; id: number; patch: SkillPatch };

function changedPatch(
  existing: Skill | undefined,
  name: string,
  group: SkillCategory,
): SkillPatch | null {
  if (existing === undefined) return null;
  const patch: SkillPatch = {};
  if (existing.name !== name) patch.name = name;
  if (existing.group !== group) patch.group = group;
  return patch.name === undefined && patch.group === undefined ? null : patch;
}

function classifyRow(
  row: SkillRowDraft,
  originalById: ReadonlyMap<number, Skill>,
): RowChange | null {
  const name = row.name.trim();
  if (name === '') return null;
  if (row.id === null) {
    return { kind: 'create', value: { name, group: row.group } };
  }
  const patch = changedPatch(originalById.get(row.id), name, row.group);
  return patch === null ? null : { kind: 'update', id: row.id, patch };
}

export function diffSkillRows(
  original: readonly Skill[],
  rows: readonly SkillRowDraft[],
): SkillChanges {
  const originalById = new Map(original.map((skill) => [skill.id, skill]));
  const seenIds = new Set<number>();
  const creates: SkillCreate[] = [];
  const updates: { id: number; patch: SkillPatch }[] = [];

  for (const row of rows) {
    if (row.id !== null) seenIds.add(row.id);
    const change = classifyRow(row, originalById);
    if (change?.kind === 'create') creates.push(change.value);
    if (change?.kind === 'update') {
      updates.push({ id: change.id, patch: change.patch });
    }
  }

  const deletes = original
    .filter((skill) => !seenIds.has(skill.id))
    .map((skill) => skill.id);
  return { creates, updates, deletes };
}

/** First normalized duplicate name across draft rows, or null. */
export function findDuplicateSkillName(
  rows: readonly SkillRowDraft[],
): string | null {
  const seen = new Set<string>();
  for (const row of rows) {
    const key = skillNameKey(row.name);
    if (key === '') continue;
    if (seen.has(key)) return row.name.trim();
    seen.add(key);
  }
  return null;
}
