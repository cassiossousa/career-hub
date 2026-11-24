import { SKILL_CATEGORIES } from './jobOptions';
import type { SkillCategory } from './types/portfolio';
import type {
  Skill,
  SkillCreate,
  SkillGroupLabels,
  SkillPatch,
} from './types/skills';

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

/** Editable label row: either a catalog skill or a skill group. */
export type LabelEntry =
  | {
      kind: 'skill';
      skillId: number;
      name: string;
      group: SkillCategory;
      labels: Record<string, string>;
    }
  | { kind: 'group'; group: SkillCategory; labels: Record<string, string> };

/** Trims label values and drops blank locales (mirrors the backend cleaner). */
export function cleanLabelMap(
  labels: Readonly<Record<string, string>>,
): Record<string, string> {
  const cleaned: Record<string, string> = {};
  for (const [locale, label] of Object.entries(labels)) {
    const value = label.trim();
    if (value !== '') cleaned[locale] = value;
  }
  return cleaned;
}

export function labelEntryKey(entry: LabelEntry): string {
  return entry.kind === 'skill'
    ? `skill:${entry.skillId}`
    : `group:${entry.group}`;
}

export function toLabelEntries(
  skills: readonly Skill[],
  groupLabels: readonly SkillGroupLabels[],
): LabelEntry[] {
  const labelsByGroup = new Map(
    groupLabels.map((entry) => [entry.group, entry.labels]),
  );
  return [
    ...skills.map((skill) => ({
      kind: 'skill' as const,
      skillId: skill.id,
      name: skill.name,
      group: skill.group,
      labels: { ...skill.labels },
    })),
    ...SKILL_CATEGORIES.map((group) => ({
      kind: 'group' as const,
      group,
      labels: { ...labelsByGroup.get(group) },
    })),
  ];
}

/** Pending label edits keyed by `labelEntryKey`, values are full label maps. */
export type LabelEdits = Record<string, Record<string, string>>;

/** Merges pending edits over server entries for display. */
export function applyLabelEdits(
  entries: readonly LabelEntry[],
  edits: LabelEdits,
): LabelEntry[] {
  return entries.map((entry) => {
    const edit = edits[labelEntryKey(entry)];
    return edit === undefined ? entry : { ...entry, labels: { ...edit } };
  });
}

export interface LabelChanges {
  skillUpdates: { id: number; labels: Record<string, string> }[];
  groupUpdates: { group: SkillCategory; labels: Record<string, string> }[];
}

function sameLabels(
  a: Readonly<Record<string, string>>,
  b: Readonly<Record<string, string>>,
): boolean {
  const left = cleanLabelMap(a);
  const right = cleanLabelMap(b);
  const leftKeys = Object.keys(left);
  return (
    leftKeys.length === Object.keys(right).length &&
    leftKeys.every((key) => left[key] === right[key])
  );
}

/**
 * Turns pending edits into API updates. Edits that match the server labels
 * (e.g. reverted changes) are skipped; blank labels are stripped so the API
 * sees a clean replace map.
 */
export function diffLabelEdits(
  entries: readonly LabelEntry[],
  edits: LabelEdits,
): LabelChanges {
  const byKey = new Map(entries.map((entry) => [labelEntryKey(entry), entry]));
  const skillUpdates: LabelChanges['skillUpdates'] = [];
  const groupUpdates: LabelChanges['groupUpdates'] = [];

  for (const [key, rawLabels] of Object.entries(edits)) {
    const entry = byKey.get(key);
    if (entry === undefined || sameLabels(entry.labels, rawLabels)) continue;
    const labels = cleanLabelMap(rawLabels);
    if (entry.kind === 'skill') {
      skillUpdates.push({ id: entry.skillId, labels });
    } else {
      groupUpdates.push({ group: entry.group, labels });
    }
  }
  return { skillUpdates, groupUpdates };
}
