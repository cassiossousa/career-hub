import { resumePdfDocumentSchema } from '@career-hub/ui/pdf';
import {
  type ResumePreviewCopy,
  toPortfolioPdfDocument,
  toResumePdfDocument,
} from './resumePreview';
import type { PortfolioContent } from './types/portfolio';
import type { ResumeDocument } from './types/resume';

const copy: ResumePreviewCopy = {
  presentLabel: 'Present',
  linkKindLabels: {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    website: 'Website',
    email: 'Email',
    other: 'Other',
  },
  skillCategoryLabels: {
    frontend: 'Frontend',
    backend: 'Backend',
    databases: 'Databases',
    distributed: 'Distributed systems',
    cloud: 'Cloud',
    testing: 'Testing',
  },
};

function makeDoc(overrides: Partial<ResumeDocument> = {}): ResumeDocument {
  return {
    locale: 'en',
    summary: 'Summary text',
    basics: {
      fullName: 'Cassio Sousa',
      headline: 'Engineer',
      subtitle: '',
      location: 'Remote',
      links: [],
    },
    ...overrides,
  };
}

describe('toResumePdfDocument', () => {
  it('maps basics and filters out empty links', () => {
    const doc = makeDoc({
      basics: {
        fullName: 'Cassio Sousa',
        headline: 'Engineer',
        subtitle: 'Subtitle',
        location: 'Remote',
        links: [
          { kind: 'github', url: 'https://github.com/cassio', label: null },
          { kind: 'website', url: '   ', label: 'Site' },
          { kind: 'email', url: 'mailto:a@b.c', label: 'Mail' },
        ],
      },
    });

    const result = toResumePdfDocument(doc, 'en', copy);

    expect(result.basics.fullName).toBe('Cassio Sousa');
    expect(result.basics.headline).toBe('Engineer');
    expect(result.basics.subtitle).toBe('Subtitle');
    expect(result.basics.links).toEqual([
      { label: 'GitHub', url: 'https://github.com/cassio' },
      { label: 'Mail', url: 'mailto:a@b.c' },
    ]);
  });

  it('formats experience periods and uses the present label', () => {
    const doc = makeDoc({
      experience: [
        {
          company: 'Acme',
          role: 'Dev',
          location: 'Remote',
          start: '2021-03',
          end: null,
          bullets: [{ text: 'Did things', skills: ['React'] }],
        },
        {
          company: 'Old Co',
          role: 'Junior',
          start: '2019-01',
          end: '2021-02',
        },
      ],
    });

    const result = toResumePdfDocument(doc, 'en', copy);
    const [current, past] = result.experience ?? [];

    expect(current?.period).toBe('Mar 2021 – Present');
    expect(current?.bullets).toEqual(['Did things']);
    expect(past?.period).toBe('Jan 2019 – Feb 2021');
  });

  it('honors the explicit present flag and keeps legacy end-null entries ongoing', () => {
    const doc = makeDoc({
      experience: [
        // New documents carry an explicit flag.
        {
          company: 'Current',
          role: 'Dev',
          start: '2021-03',
          end: null,
          present: true,
        },
        {
          company: 'Undated end',
          role: 'Dev',
          start: '2020-01',
          end: null,
          present: false,
        },
        // Pre-flag documents omit ``present``; end=null stays "Present".
        { company: 'Legacy', role: 'Dev', start: '2018-05', end: null },
      ],
    });

    const result = toResumePdfDocument(doc, 'en', copy);
    const [current, undated, legacy] = result.experience ?? [];

    expect(current?.period).toBe('Mar 2021 – Present');
    expect(undated?.period).toBe('Jan 2020');
    expect(legacy?.period).toBe('May 2018 – Present');
  });

  it('drops experience entries left completely empty by the editor', () => {
    const doc = makeDoc({
      experience: [
        {
          company: '',
          role: '',
          location: null,
          start: '',
          end: null,
          bullets: [],
        },
        { company: 'Acme', role: 'Dev', start: '2021-03', end: null },
      ],
    });

    const result = toResumePdfDocument(doc, 'en', copy);

    expect(result.experience).toHaveLength(1);
    expect(result.experience?.[0]?.company).toBe('Acme');
  });

  it('passes through unparseable dates instead of dropping them', () => {
    const doc = makeDoc({
      experience: [
        { company: 'Acme', role: 'Dev', start: 'unknown', end: null },
      ],
    });

    const result = toResumePdfDocument(doc, 'en', copy);

    expect(result.experience?.[0]?.period).toBe('unknown – Present');
  });

  it('localizes month names through Intl', () => {
    const doc = makeDoc({
      experience: [
        { company: 'Acme', role: 'Dev', start: '2021-03', end: null },
      ],
    });

    const en = toResumePdfDocument(doc, 'en', copy);
    const pt = toResumePdfDocument(doc, 'pt-BR', copy);

    expect(en.experience?.[0]?.period).toContain('Mar 2021');
    expect(pt.experience?.[0]?.period).toContain('2021');
    expect(pt.experience?.[0]?.period).not.toBe(en.experience?.[0]?.period);
  });

  it('omits education period when no dates are set', () => {
    const doc = makeDoc({
      education: [
        {
          institution: 'MIT',
          degree: 'BSc',
          fieldOfStudy: 'CS',
          start: null,
          end: null,
          details: null,
        },
        {
          institution: 'USP',
          degree: 'MSc',
          start: '2018-02',
          end: '2020-12',
        },
      ],
    });

    const result = toResumePdfDocument(doc, 'en', copy);
    const [noDates, withDates] = result.education ?? [];

    expect(noDates?.period).toBeUndefined();
    expect(noDates?.fieldOfStudy).toBe('CS');
    expect(noDates?.details).toBeUndefined();
    expect(withDates?.period).toBe('Feb 2018 – Dec 2020');
  });

  it('prefers project highlights and falls back to summary', () => {
    const doc = makeDoc({
      projects: [
        {
          slug: 'a',
          title: 'With highlights',
          summary: 'ignored',
          highlights: ['h1', 'h2'],
        },
        { slug: 'b', title: 'Summary only', summary: 'Just a summary' },
        { slug: 'c', title: 'Empty', summary: '' },
      ],
    });

    const result = toResumePdfDocument(doc, 'en', copy);

    expect(result.projects?.[0]?.highlights).toEqual(['h1', 'h2']);
    expect(result.projects?.[1]?.highlights).toEqual(['Just a summary']);
    expect(result.projects?.[2]?.highlights).toEqual([]);
  });

  it('translates skill group categories and defaults missing items', () => {
    const doc = makeDoc({
      skillGroups: [
        { category: 'frontend', items: ['React'] },
        { category: 'cloud' },
      ],
    });

    const result = toResumePdfDocument(doc, 'en', copy);

    expect(result.skillGroups).toEqual([
      { category: 'Frontend', items: ['React'] },
      { category: 'Cloud', items: [] },
    ]);
  });

  it('stringifies certification years and drops nullish values', () => {
    const doc = makeDoc({
      certifications: [
        { name: 'AWS SA', issuer: 'Amazon', year: 2023 },
        { name: 'Scrum', issuer: null, year: null },
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Spanish', proficiency: null },
      ],
    });

    const result = toResumePdfDocument(doc, 'en', copy);

    expect(result.certifications).toEqual([
      { name: 'AWS SA', issuer: 'Amazon', year: '2023' },
      { name: 'Scrum', issuer: undefined, year: undefined },
    ]);
    expect(result.languages).toEqual([
      { name: 'English', proficiency: 'Native' },
      { name: 'Spanish', proficiency: undefined },
    ]);
  });

  it('treats a whitespace-only summary as absent', () => {
    const result = toResumePdfDocument(makeDoc({ summary: '   ' }), 'en', copy);
    expect(result.summary).toBeUndefined();
  });

  it('returns a pure schema object: the viewer receives nothing else', () => {
    const result = toResumePdfDocument(
      makeDoc({
        experience: [
          { company: 'Acme', role: 'Dev', start: '2021-03', end: null },
        ],
        projects: [{ slug: 'a', title: 'Project A', summary: 'A project.' }],
        skillGroups: [{ category: 'frontend', items: ['React'] }],
      }),
      'en',
      copy,
    );

    // The output must already satisfy the viewer contract — re-parsing is
    // a no-op, so no undeclared keys or unnormalized values can leak through.
    expect(resumePdfDocumentSchema.safeParse(result).success).toBe(true);
    expect(resumePdfDocumentSchema.parse(result)).toEqual(result);
  });

  it('is deterministic: identical input produces identical output', () => {
    const doc = makeDoc({
      experience: [
        {
          company: 'Acme',
          role: 'Dev',
          location: 'Remote',
          start: '2021-03',
          end: null,
          present: true,
          bullets: [{ text: 'Did things', skills: ['React'] }],
        },
      ],
      projects: [{ slug: 'a', title: 'Project A', summary: 'Did a thing' }],
      skillGroups: [{ category: 'frontend', items: ['React'] }],
      education: [
        {
          institution: 'MIT',
          degree: 'BSc',
          start: '2018-02',
          end: '2020-12',
        },
      ],
      certifications: [{ name: 'AWS SA', year: 2023 }],
      languages: [{ name: 'English', proficiency: 'Native' }],
    });

    const before = JSON.stringify(doc);
    const first = toResumePdfDocument(doc, 'en', copy);
    const second = toResumePdfDocument(doc, 'en', copy);

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    // The mapper must not mutate the document it reads.
    expect(JSON.stringify(doc)).toBe(before);
  });
});

describe('toPortfolioPdfDocument', () => {
  const PORTFOLIO_CONTENT: PortfolioContent = {
    basics: {
      fullName: 'Cassio Sousa',
      headline: 'Engineer',
      subtitle: '',
      location: 'Remote',
      links: [{ kind: 'github', url: 'https://github.com/cassio' }],
    },
    experience: [{ company: 'Acme', role: 'Dev', start: '2021-03', end: null }],
    skillGroups: [{ category: 'frontend', items: ['React'] }],
    projects: [{ slug: 'a', title: 'Project A', summary: 'Did a thing' }],
  };

  it('maps portfolio sections and leaves resume-only sections empty', () => {
    const result = toPortfolioPdfDocument(PORTFOLIO_CONTENT, 'en', copy);

    expect(result.basics.fullName).toBe('Cassio Sousa');
    expect(result.basics.links).toEqual([
      { label: 'GitHub', url: 'https://github.com/cassio' },
    ]);
    expect(result.experience?.[0]?.period).toBe('Mar 2021 – Present');
    expect(result.skillGroups).toEqual([
      { category: 'Frontend', items: ['React'] },
    ]);
    expect(result.projects?.[0]?.highlights).toEqual(['Did a thing']);
    expect(result.summary).toBeUndefined();
    expect(result.education).toEqual([]);
    expect(result.certifications).toEqual([]);
    expect(result.languages).toEqual([]);
  });

  it('resolves portfolio language labels per locale', () => {
    const content: PortfolioContent = {
      basics: {
        fullName: 'Cassio Sousa',
        headline: 'Engineer',
        subtitle: '',
        location: 'Remote',
        links: [],
      },
      languages: [
        {
          language: 'portuguese',
          proficiency: 'native',
          labels: {
            'pt-BR': { name: 'Português', proficiency: 'Nativo' },
          },
        },
        { language: 'english', proficiency: 'c1' },
      ],
    };

    const pt = toPortfolioPdfDocument(content, 'pt-BR', copy);
    expect(pt.languages).toEqual([
      { name: 'Português', proficiency: 'Nativo' },
      { name: 'English', proficiency: 'C1' },
    ]);

    const en = toPortfolioPdfDocument(content, 'en', copy);
    expect(en.languages?.[0]).toEqual({
      name: 'Portuguese',
      proficiency: 'Native',
    });
  });

  it('returns a pure schema object and is deterministic', () => {
    const first = toPortfolioPdfDocument(PORTFOLIO_CONTENT, 'en', copy);
    const second = toPortfolioPdfDocument(PORTFOLIO_CONTENT, 'en', copy);

    expect(resumePdfDocumentSchema.safeParse(first).success).toBe(true);
    expect(resumePdfDocumentSchema.parse(first)).toEqual(first);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });
});
