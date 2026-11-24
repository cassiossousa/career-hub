export const SKILLS_TAG_PATTERN = /<!--\s*skills:(.+?)-->/g;

export function parseSkillTagNames(raw: string): string[] {
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
