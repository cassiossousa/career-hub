import type { Translation } from '../types/i18n';

export type SkillCategory = keyof Omit<Translation['skills'], 'title'>;

export const skills: Record<SkillCategory, string[]> = {
  frontend: [
    'React',
    'TypeScript',
    'JavaScript',
    'Angular',
    'Next.js',
    'React Native',
    'Material UI',
    'Styled Components',
  ],

  backend: [
    'Node.js',
    'Python',
    'Django',
    'Flask',
    'Pyramid',
    'Ruby on Rails',
    'Java',
    'Spring Boot',
  ],

  databases: ['PostgreSQL', 'MongoDB', 'Redis', 'DynamoDB', 'Elasticsearch'],

  distributed: ['Kafka', 'RabbitMQ', 'GraphQL'],

  cloud: ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Heroku', 'CI/CD'],

  testing: [
    'Cypress',
    'Datadog',
    'Grafana',
    'Jest',
    'Kibana',
    'Mocha',
    'Pytest',
    'Sentry',
    'Vitest',
  ],
};

const extraSkillCategories: Record<string, SkillCategory> = {
  Svelte: 'frontend',
  ExtJS: 'frontend',
  Scala: 'backend',
  'Play Framework': 'backend',
};

const skillCategoryByName = new Map<string, SkillCategory>([
  ...Object.entries(extraSkillCategories),
  ...(Object.entries(skills) as [SkillCategory, string[]][]).flatMap(
    ([category, names]) => names.map((name) => [name, category] as const),
  ),
]);

export function findSkillCategory(name: string): SkillCategory | undefined {
  return skillCategoryByName.get(name);
}

export interface SkillGroup {
  category: SkillCategory;
  items: string[];
}

interface RoleWithBulletSkills {
  bullets: readonly {
    skills: readonly { category: SkillCategory; name: string }[];
  }[];
}

function addMentionedSkill(
  mentioned: Map<SkillCategory, string[]>,
  skill: { category: SkillCategory; name: string },
) {
  const items = mentioned.get(skill.category);
  if (items) {
    items.push(skill.name);
  } else {
    mentioned.set(skill.category, [skill.name]);
  }
}

export function collectSkillGroups(
  roles: readonly RoleWithBulletSkills[],
): SkillGroup[] {
  const mentioned = new Map<SkillCategory, string[]>();

  for (const role of roles) {
    for (const bullet of role.bullets) {
      for (const skill of bullet.skills) {
        addMentionedSkill(mentioned, skill);
      }
    }
  }

  return (Object.keys(skills) as SkillCategory[]).map<SkillGroup>(
    (category) => ({
      category,
      items: [
        ...new Set([...skills[category], ...(mentioned.get(category) ?? [])]),
      ],
    }),
  );
}
