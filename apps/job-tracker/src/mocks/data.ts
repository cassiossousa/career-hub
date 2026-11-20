import type { Application } from '../services/types/application';
import type { Job, JobCreate } from '../services/types/job';
import type {
  Portfolio,
  PortfolioContent,
  SkillCategory,
} from '../services/types/portfolio';
import type { Resume } from '../services/types/resume';
import type { Skill } from '../services/types/skills';

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86400000).toISOString();

const dateDaysAgo = (days: number) =>
  new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

export const seedJobs: Job[] = [
  {
    id: 1,
    source: 'gupy',
    externalId: 'gupy-1001',
    url: 'https://jobs.example.com/gupy/1001',
    title: 'Frontend Developer',
    company: 'Nubank',
    location: 'Remote',
    area: 'frontend',
    level: 'mid',
    contractType: 'CLT',
    description:
      'Build delightful React interfaces for millions of users.\n\n- React + TypeScript\n- Design systems\n- Accessibility',
    remote: true,
    salaryMin: 12000,
    salaryMax: 18000,
    currency: 'BRL',
    postedAt: daysAgo(1),
    lastSeenAt: daysAgo(0),
    requirements: [
      { text: 'React', classification: 'proven', weight: 9 },
      { text: 'TypeScript', classification: 'proven', weight: 8 },
      { text: 'Accessibility', classification: 'partial', weight: 6 },
      { text: 'GraphQL', classification: 'unproven', weight: 5 },
    ],
    filterResult: 'passed',
    createdAt: daysAgo(1),
  },
  {
    id: 2,
    source: 'solides',
    externalId: 'sol-2002',
    url: 'https://jobs.example.com/solides/2002',
    title: 'Fullstack Engineer',
    company: 'Loft',
    location: 'São Paulo',
    area: 'fullstack',
    level: 'senior',
    contractType: 'CLT',
    description: 'End-to-end product engineering across web and API.',
    remote: false,
    salaryMin: 15000,
    salaryMax: 22000,
    currency: 'BRL',
    postedAt: daysAgo(3),
    lastSeenAt: daysAgo(1),
    requirements: [
      { text: 'Node.js', classification: 'proven', weight: 8 },
      { text: 'PostgreSQL', classification: 'equivalent', weight: 7 },
      { text: 'AWS', classification: 'partial', weight: 6 },
    ],
    filterResult: 'passed',
    createdAt: daysAgo(3),
  },
  {
    id: 3,
    source: 'remote',
    externalId: null,
    url: 'https://jobs.example.com/remote/3003',
    title: 'Junior Frontend Developer',
    company: 'Automattic',
    location: 'Worldwide',
    area: 'frontend',
    level: 'junior',
    contractType: 'Contract',
    description: 'Help build WordPress.com interfaces.',
    remote: true,
    salaryMin: null,
    salaryMax: null,
    currency: 'USD',
    postedAt: daysAgo(10),
    lastSeenAt: daysAgo(2),
    requirements: [
      { text: 'JavaScript', classification: 'proven', weight: 7 },
      { text: 'CSS', classification: 'proven', weight: 6 },
    ],
    filterResult: 'filtered_level',
    createdAt: daysAgo(10),
  },
  {
    id: 4,
    source: 'manual',
    externalId: null,
    url: 'https://jobs.example.com/manual/4004',
    title: 'Backend Engineer',
    company: 'Stone',
    location: 'Remote',
    area: 'backend',
    level: 'senior',
    contractType: 'PJ',
    description: 'Design payment infrastructure at scale.',
    remote: true,
    salaryMin: null,
    salaryMax: null,
    currency: 'BRL',
    postedAt: daysAgo(45),
    lastSeenAt: daysAgo(5),
    requirements: [
      { text: 'Go', classification: 'unproven', weight: 8 },
      { text: 'Kubernetes', classification: 'partial', weight: 6 },
    ],
    filterResult: 'passed',
    createdAt: daysAgo(45),
  },
];

export const seedApplications: Application[] = [
  {
    id: 1,
    jobId: 1,
    portfolioId: 1,
    status: 'applied',
    notes: 'Strong React match, tailor resume before interview.',
    appliedAt: dateDaysAgo(2),
    statusChangedAt: daysAgo(2),
    createdAt: daysAgo(2),
  },
  {
    id: 2,
    jobId: 2,
    portfolioId: 1,
    status: 'screening',
    notes: null,
    appliedAt: dateDaysAgo(5),
    statusChangedAt: daysAgo(1),
    createdAt: daysAgo(5),
  },
  {
    id: 3,
    jobId: 3,
    portfolioId: 1,
    status: 'saved',
    notes: null,
    appliedAt: null,
    statusChangedAt: daysAgo(3),
    createdAt: daysAgo(3),
  },
];

const enContent: PortfolioContent = {
  basics: {
    fullName: 'Cassio Sousa',
    headline: 'Senior Frontend Engineer',
    subtitle: 'React · TypeScript · Design systems',
    username: 'cassiossousa',
    location: 'Remote',
    avatarUrl: null,
    links: [
      { kind: 'github', url: 'https://github.com/cassiossousa', label: null },
      {
        kind: 'linkedin',
        url: 'https://linkedin.com/in/cassiossousa',
        label: null,
      },
    ],
  },
  experience: [
    {
      company: 'Acme Corp',
      role: 'Senior Frontend Engineer',
      location: 'Remote',
      start: '2021-03',
      end: null,
      bullets: [
        {
          text: 'Led migration to React + TypeScript across 3 products',
          skills: ['React', 'TypeScript'],
        },
        {
          text: 'Built accessible component library used by 40 engineers',
          skills: ['Accessibility', 'Design systems'],
        },
      ],
    },
  ],
  skillGroups: [
    {
      category: 'frontend',
      items: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Accessibility'],
    },
    {
      category: 'backend',
      items: ['Node.js', 'PostgreSQL', 'REST'],
    },
    {
      category: 'cloud',
      items: ['AWS', 'Docker'],
    },
  ],
  projects: [
    {
      slug: 'career-hub',
      title: 'Career Hub',
      summary: 'Job tracker and portfolio monorepo',
      highlights: ['React', 'TypeScript', 'Vite'],
      repoUrl: 'https://github.com/cassiossousa/career-hub',
      demoUrl: null,
      featured: true,
      technologies: ['React', 'TypeScript'],
      topics: ['portfolio', 'job-search'],
      category: 'fullstack',
      stars: 12,
    },
  ],
};

const ptBRContent: PortfolioContent = {
  ...enContent,
  basics: {
    ...enContent.basics,
    headline: 'Engenheiro Frontend Sênior',
    subtitle: 'React · TypeScript · Design systems',
  },
};

export const seedPortfolio: Portfolio = {
  id: 1,
  filters: {
    levels: ['mid', 'senior'],
    areas: ['frontend', 'fullstack'],
    locations: [],
    remoteOnly: false,
  },
  documents: {
    en: enContent,
    'pt-BR': ptBRContent,
  },
  createdAt: daysAgo(30),
  updatedAt: daysAgo(1),
};

export const seedResume: Resume = {
  id: 1,
  applicationId: 1,
  locale: 'en',
  summary: 'Senior Frontend Engineer with 8 years building React products.',
  basics: enContent.basics,
  experience: enContent.experience ?? [],
  education: [
    {
      institution: 'Universidade de São Paulo',
      degree: 'B.Sc. Computer Science',
      fieldOfStudy: 'Software Engineering',
      start: '2013-02',
      end: '2017-12',
      details: null,
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Developer',
      issuer: 'Amazon',
      url: null,
      year: 2022,
    },
  ],
  languages: [
    { name: 'Portuguese', proficiency: 'Native' },
    { name: 'English', proficiency: 'C1' },
  ],
  projects: enContent.projects ?? [],
  skillGroups: enContent.skillGroups ?? [],
  submittedAt: null,
  createdAt: daysAgo(2),
  updatedAt: daysAgo(2),
};

const SEED_SKILL_ENTRIES: readonly (readonly [string, SkillCategory])[] = [
  ['React', 'frontend'],
  ['TypeScript', 'frontend'],
  ['JavaScript', 'frontend'],
  ['Angular', 'frontend'],
  ['Next.js', 'frontend'],
  ['React Native', 'frontend'],
  ['Material UI', 'frontend'],
  ['Styled Components', 'frontend'],
  ['Svelte', 'frontend'],
  ['ExtJS', 'frontend'],
  ['Node.js', 'backend'],
  ['Python', 'backend'],
  ['Django', 'backend'],
  ['Flask', 'backend'],
  ['Pyramid', 'backend'],
  ['Ruby on Rails', 'backend'],
  ['Java', 'backend'],
  ['Spring Boot', 'backend'],
  ['Scala', 'backend'],
  ['Play Framework', 'backend'],
  ['PostgreSQL', 'databases'],
  ['MongoDB', 'databases'],
  ['Redis', 'databases'],
  ['DynamoDB', 'databases'],
  ['Elasticsearch', 'databases'],
  ['Kafka', 'distributed'],
  ['RabbitMQ', 'distributed'],
  ['GraphQL', 'distributed'],
  ['Docker', 'cloud'],
  ['Kubernetes', 'cloud'],
  ['AWS', 'cloud'],
  ['GCP', 'cloud'],
  ['Heroku', 'cloud'],
  ['CI/CD', 'cloud'],
  ['Cypress', 'testing'],
  ['Datadog', 'testing'],
  ['Grafana', 'testing'],
  ['Jest', 'testing'],
  ['Kibana', 'testing'],
  ['Mocha', 'testing'],
  ['Pytest', 'testing'],
  ['Sentry', 'testing'],
  ['Vitest', 'testing'],
];

export const seedSkills: Skill[] = SEED_SKILL_ENTRIES.map(
  ([name, group], index) => ({
    id: index + 1,
    name,
    group,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1),
  }),
);

export function toJob(body: JobCreate, id: number): Job {
  const now = new Date().toISOString();
  return {
    id,
    source: body.source,
    externalId: body.externalId ?? null,
    url: body.url,
    title: body.title,
    company: body.company,
    location: body.location,
    area: body.area,
    level: body.level,
    contractType: body.contractType ?? null,
    description: body.description ?? '',
    remote: body.remote ?? false,
    salaryMin: body.salaryMin ?? null,
    salaryMax: body.salaryMax ?? null,
    currency: body.currency ?? 'BRL',
    postedAt: body.postedAt ?? null,
    lastSeenAt: null,
    requirements: body.requirements ?? [],
    filterResult: body.filterResult ?? 'unevaluated',
    createdAt: now,
  };
}
