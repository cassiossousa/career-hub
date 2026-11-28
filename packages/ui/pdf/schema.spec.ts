import { resumePdfDocumentSchema } from './schema';

const RAW_DOCUMENT = {
  basics: {
    fullName: 'Ada Lovelace',
    headline: 'Engineer',
    links: [{ label: 'Site', url: 'https://example.com' }],
  },
  summary: 'First programmer.',
  experience: [
    {
      company: 'Analytical Engines',
      role: 'Chief Mathematician',
      period: '1843–1852',
      bullets: ['Wrote the first algorithm', '   ', 'Coined the term'],
    },
  ],
  skillGroups: [{ category: 'Languages', items: ['English', '  ', 'French'] }],
};

describe('resumePdfDocumentSchema', () => {
  it('parses a full document into the viewer contract', () => {
    const parsed = resumePdfDocumentSchema.parse(RAW_DOCUMENT);

    expect(parsed.basics.fullName).toBe('Ada Lovelace');
    expect(parsed.experience?.[0]?.bullets).toEqual([
      'Wrote the first algorithm',
      'Coined the term',
    ]);
  });

  it('strips keys the viewer contract does not declare', () => {
    const parsed = resumePdfDocumentSchema.parse({
      ...RAW_DOCUMENT,
      internalId: 42,
      basics: { ...RAW_DOCUMENT.basics, secretToken: 'nope' },
    });

    expect(parsed).not.toHaveProperty('internalId');
    expect(parsed.basics).not.toHaveProperty('secretToken');
    expect(Object.keys(parsed).toSorted()).toEqual(
      [
        'schemaVersion',
        'basics',
        'summary',
        'experience',
        'skillGroups',
      ].toSorted(),
    );
  });

  it('defaults schemaVersion to 1 for pre-versioning documents', () => {
    const parsed = resumePdfDocumentSchema.parse(RAW_DOCUMENT);

    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.meta).toBeUndefined();
  });

  it('preserves an explicit schemaVersion and meta provenance', () => {
    const parsed = resumePdfDocumentSchema.parse({
      ...RAW_DOCUMENT,
      schemaVersion: 3,
      meta: {
        locale: 'en',
        source: 'llm_tailored',
        applicationId: 42,
        jobId: 7,
        generatedAt: '2026-01-01T00:00:00Z',
      },
    });

    expect(parsed.schemaVersion).toBe(3);
    expect(parsed.meta?.applicationId).toBe(42);
    expect(parsed.meta?.source).toBe('llm_tailored');
  });

  it('rejects a document without basics.fullName', () => {
    expect(
      resumePdfDocumentSchema.safeParse({ basics: { links: [] } }).success,
    ).toBe(false);
  });

  it('is a fixed point: parsing its own output changes nothing', () => {
    const once = resumePdfDocumentSchema.parse(RAW_DOCUMENT);
    const twice = resumePdfDocumentSchema.parse(once);

    expect(twice).toEqual(once);
    expect(JSON.stringify(twice)).toBe(JSON.stringify(once));
  });

  it('does not mutate its input', () => {
    const before = JSON.stringify(RAW_DOCUMENT);
    resumePdfDocumentSchema.parse(RAW_DOCUMENT);

    expect(JSON.stringify(RAW_DOCUMENT)).toBe(before);
  });

  it('is deterministic: identical input yields byte-identical output', () => {
    const first = resumePdfDocumentSchema.parse(RAW_DOCUMENT);
    const second = resumePdfDocumentSchema.parse(RAW_DOCUMENT);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it('is deterministic regardless of input key order', () => {
    const reordered = {
      skillGroups: RAW_DOCUMENT.skillGroups,
      experience: RAW_DOCUMENT.experience,
      summary: RAW_DOCUMENT.summary,
      basics: {
        links: RAW_DOCUMENT.basics.links,
        headline: RAW_DOCUMENT.basics.headline,
        fullName: RAW_DOCUMENT.basics.fullName,
      },
    };

    const first = resumePdfDocumentSchema.parse(RAW_DOCUMENT);
    const second = resumePdfDocumentSchema.parse(reordered);

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });
});
