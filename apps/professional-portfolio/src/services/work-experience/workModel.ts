import type { ContentEntry } from '../../types/content';
import type { Locale, Translation } from '../../types/i18n';
import { findSkillCategory, type SkillCategory } from '../skills';
import { parseSkillTagNames, SKILLS_TAG_PATTERN } from './skillTags';

interface WorkBulletSkill {
  category: SkillCategory;
  name: string;
}

interface WorkBullet {
  line: string;
  skills: WorkBulletSkill[];
}

export interface WorkRole {
  company: string;
  title: string;
  location?: string;
  start?: string;
  end?: string;
  period: string;
  bullets: WorkBullet[];
}

interface WorkRoleValidationError {
  field: string;
  message: string;
}

function parseBulletSkills(raw: string): WorkBulletSkill[] {
  const skills: WorkBulletSkill[] = [];

  for (const name of parseSkillTagNames(raw)) {
    const category = findSkillCategory(name);
    if (!category) {
      console.warn(`Unknown skill "${name}" in work experience content`);
      continue;
    }
    if (!skills.some((skill) => skill.name === name)) {
      skills.push({ category, name });
    }
  }

  return skills;
}

function parseBullet(line: string): WorkBullet {
  const skills: WorkBulletSkill[] = [];
  const text = line
    .replace(SKILLS_TAG_PATTERN, (_match, raw: string) => {
      skills.push(...parseBulletSkills(raw));
      return '';
    })
    .trim();

  return { line: text, skills };
}

function parseBullets(content: string): WorkBullet[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseBullet)
    .filter((bullet) => bullet.line !== '');
}

function validateDate(dateString?: string): Date | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildPeriod(
  start: string | undefined,
  end: string | undefined,
  t: Translation,
  locale: Locale,
): string {
  if (!start) return '';

  const startDate = validateDate(start);
  const endDate = validateDate(end);

  if (!startDate) return start; // Return as-is if invalid

  const startStr = startDate.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
  });

  if (!end) return `${startStr} - ${t.workExperience.present}`;

  if (!endDate) return `${startStr} - ${end}`; // Return end as-is if invalid

  const endStr = endDate.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
  });

  return `${startStr} - ${endStr}`;
}

function dateOrderError(
  start: string | undefined,
  end: string | undefined,
): WorkRoleValidationError | null {
  if (!start || !end) return null;

  const startDate = validateDate(start);
  const endDate = validateDate(end);

  if (startDate && endDate && startDate > endDate) {
    return { field: 'end', message: 'End date must be after start date' };
  }

  return null;
}

function validateWorkRole(entry: ContentEntry): WorkRoleValidationError[] {
  const errors: WorkRoleValidationError[] = [];
  const { company, role, start, end } = entry.frontmatter;

  if (!company || company.trim() === '') {
    errors.push({ field: 'company', message: 'Company is required' });
  }

  if (!role || role.trim() === '') {
    errors.push({ field: 'role', message: 'Role title is required' });
  }

  if (start && !validateDate(start)) {
    errors.push({ field: 'start', message: 'Invalid start date format' });
  }

  if (end && !validateDate(end)) {
    errors.push({ field: 'end', message: 'Invalid end date format' });
  }

  const orderError = dateOrderError(start, end);
  if (orderError) errors.push(orderError);

  return errors;
}

export function mapContentToWorkRoles(
  entries: ContentEntry[],
  t: Translation,
  locale: Locale,
): WorkRole[] {
  const validRoles: WorkRole[] = [];

  for (const entry of entries) {
    const { company, role, location, start, end } = entry.frontmatter;

    // Validate before processing
    const errors = validateWorkRole(entry);
    if (errors.length > 0) {
      console.warn(`Invalid work entry for ${company || 'unknown'}:`, errors);
      continue;
    }

    validRoles.push({
      company: company ?? '',
      title: role ?? '',
      location,
      start,
      end,
      period: buildPeriod(start, end, t, locale),
      bullets: parseBullets(entry.content),
    });
  }

  return validRoles;
}

export function sortRolesByStart(roles: WorkRole[]): WorkRole[] {
  return roles.toSorted((a, b) => {
    const aDate = validateDate(a.start);
    const bDate = validateDate(b.start);

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    return bDate.getTime() - aDate.getTime();
  });
}
