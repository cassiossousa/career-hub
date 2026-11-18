import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getAllEntries, getEntry, getSlugs } from './content';

// Type for gray-matter result
interface GrayMatterResult {
  content: string;
  data: Record<string, unknown>;
  orig: string;
  language: string;
  matter: string;
  stringify: jest.MockedFunction<() => string>;
  excerpt: string;
  isEmpty: boolean;
}

// Mock modules
jest.mock('node:fs');
jest.mock('node:path');
jest.mock('gray-matter');

const mockFs = fs as jest.Mocked<typeof fs> & {
  readdirSync: jest.MockedFunction<
    (path: string, encoding?: 'utf8') => string[]
  >;
};
const mockPath = path as jest.Mocked<typeof path>;
const mockMatter = matter as jest.MockedFunction<typeof matter>;

const defaultFrontmatter = {
  title: 'Test Job',
  company: 'Test Company',
  role: 'Test Role',
  location: 'Test Location',
  start: 'Jan 2023',
  end: 'Dec 2023',
};

function matterResult(
  data: Record<string, unknown> = defaultFrontmatter,
  content = '# Test Content',
): GrayMatterResult {
  return {
    content,
    data,
    orig: content,
    language: 'md',
    matter: '',
    stringify: jest.fn(),
    excerpt: '',
    isEmpty: false,
  };
}

function setupEntryMocks(
  existsSyncImpl: (filePath: unknown) => boolean = () => true,
) {
  mockFs.existsSync.mockImplementation(existsSyncImpl);
  mockFs.readFileSync.mockReturnValue('---\ntitle: Test\n---\n# Test Content');
}

function expectStandardEntry(
  result: ReturnType<typeof getEntry>,
  data: Record<string, unknown> = defaultFrontmatter,
) {
  expect(result).toEqual({
    slug: 'test-job',
    type: 'work-experience',
    frontmatter: { ...data, date: undefined },
    content: '# Test Content',
    readingTime: 1,
  });
}

function entryWithWordCount(words: number) {
  setupEntryMocks();
  const content = Array.from({ length: words }, (_, i) => `w${i}`).join(' ');
  mockMatter.mockReturnValue(matterResult(defaultFrontmatter, content));
  return getEntry('work-experience', 'test-job', 'en');
}

function setupWorkFiles(files: string[]) {
  mockFs.readdirSync.mockReturnValue(files);
  mockFs.existsSync.mockReturnValue(true);
  mockFs.readFileSync.mockReturnValue('---\ntitle: T\n---\n# C');
  mockMatter.mockReturnValue(matterResult({ title: 'T' }));
}

describe('content.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup simple path mocks
    mockPath.join.mockImplementation((...args) => args.join('/'));

    // Setup default matter mock
    mockMatter.mockReturnValue(matterResult());
  });

  describe('getSlugs', () => {
    it('should return empty array for work content type', () => {
      // Arrange
      const mockFiles = [
        'job1.mdx',
        'job2.mdx',
        'job3.pt-BR.mdx',
        'not-mdx-file.txt',
        'job4.mdx',
      ];

      mockFs.readdirSync.mockReturnValue(mockFiles);

      // Act
      const result = getSlugs('work-experience');

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle empty directory', () => {
      // Arrange
      mockFs.readdirSync.mockReturnValue([]);

      // Act
      const result = getSlugs('work-experience');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getEntry', () => {
    it('should return content entry for English locale', () => {
      setupEntryMocks();
      mockMatter.mockReturnValue(matterResult());

      const result = getEntry('work-experience', 'test-job', 'en');

      expectStandardEntry(result);
    });

    it('should return content entry for non-English locale with localized file', () => {
      setupEntryMocks((filePath) => String(filePath).includes('.pt-BR.mdx'));
      mockMatter.mockReturnValue(matterResult());

      const result = getEntry('work-experience', 'test-job', 'pt-BR');

      expectStandardEntry(result);
    });

    it('should fallback to base file for non-English locale when localized file does not exist', () => {
      setupEntryMocks(
        (filePath) =>
          !String(filePath).includes('.pt-BR.mdx') &&
          String(filePath).includes('.mdx'),
      );
      mockMatter.mockReturnValue(matterResult());

      const result = getEntry('work-experience', 'test-job', 'pt-BR');

      expectStandardEntry(result);
    });

    it('should handle minimal frontmatter', () => {
      const minimalData = { title: 'Minimal' };
      setupEntryMocks();
      mockMatter.mockReturnValue(
        matterResult(minimalData, '# Minimal Content'),
      );

      const result = getEntry('work-experience', 'test-job', 'en');

      expect(result.frontmatter).toEqual({
        ...minimalData,
        date: undefined,
      });
      expect(result.readingTime).toBe(1);
    });
  });

  describe('getAllEntries', () => {
    it('should return all entries for a content type and locale', () => {
      // Arrange
      const mockFiles = ['job1.mdx', 'job2.mdx', 'job3.mdx'];
      mockFs.readdirSync.mockReturnValue(mockFiles);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(
        Buffer.from('---\ntitle: Test\n---\n# Content', 'utf8'),
      );
      mockMatter.mockReturnValue(matterResult({ title: 'Test' }));

      // Act
      const result = getAllEntries('work-experience', 'en');

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].slug).toBe('job1');
      expect(result[1].slug).toBe('job2');
      expect(result[2].slug).toBe('job3');
    });

    it('should return empty array when no slugs exist', () => {
      // Arrange
      mockFs.readdirSync.mockReturnValue([]);

      // Act
      const result = getAllEntries('work-experience', 'en');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('should throw error when no file exists', () => {
      // Arrange
      mockFs.existsSync.mockReturnValue(false);

      // Act & Assert
      expect(() => getEntry('work-experience', 'test-job', 'en')).toThrow(
        'Content not found: test-job',
      );
    });

    it('should handle file system errors', () => {
      // Arrange
      const error = new Error('File system error');
      mockFs.existsSync.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => getEntry('work-experience', 'test-job', 'en')).toThrow(
        'File system error',
      );
    });

    it('should handle read file errors', () => {
      // Arrange
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Read error');
      });

      // Act & Assert
      expect(() => getEntry('work-experience', 'test-job', 'en')).toThrow(
        'Read error',
      );
    });

    it('should handle matter parsing errors', () => {
      // Arrange
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid frontmatter');
      mockMatter.mockImplementation(() => {
        throw new Error('Parse error');
      });

      // Act & Assert
      expect(() => getEntry('work-experience', 'test-job', 'en')).toThrow(
        'Parse error',
      );
    });

    it('should return empty array for work content type regardless of directory errors', () => {
      // Arrange
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Directory read error');
      });

      // Act & Assert
      expect(() => getSlugs('work-experience')).not.toThrow();
      expect(getSlugs('work-experience')).toEqual([]);
    });
  });

  describe('getSlugs for projects', () => {
    it('returns base .mdx slugs and excludes localized or non-mdx files', () => {
      mockFs.readdirSync.mockReturnValue([
        'alpha.mdx',
        'beta.mdx',
        'gamma.pt-BR.mdx',
        'notes.txt',
        'delta.en.mdx',
      ]);

      expect(getSlugs('projects')).toEqual(['alpha', 'beta']);
    });

    it('returns an empty array for an empty projects directory', () => {
      mockFs.readdirSync.mockReturnValue([]);

      expect(getSlugs('projects')).toEqual([]);
    });
  });

  describe('getEntry frontmatter normalization', () => {
    it('converts Date frontmatter values to ISO strings', () => {
      const date = new Date('2024-01-15T00:00:00.000Z');
      setupEntryMocks();
      mockMatter.mockReturnValue(matterResult({ ...defaultFrontmatter, date }));

      const result = getEntry('work-experience', 'test-job', 'en');

      expect(result.frontmatter.date).toBe('2024-01-15T00:00:00.000Z');
    });

    it('keeps string frontmatter dates unchanged', () => {
      setupEntryMocks();
      mockMatter.mockReturnValue(
        matterResult({ ...defaultFrontmatter, date: 'Jan 2023' }),
      );

      const result = getEntry('work-experience', 'test-job', 'en');

      expect(result.frontmatter.date).toBe('Jan 2023');
    });

    it('drops non-string non-Date frontmatter dates', () => {
      setupEntryMocks();
      mockMatter.mockReturnValue(
        matterResult({ ...defaultFrontmatter, date: 20230115 }),
      );

      const result = getEntry('work-experience', 'test-job', 'en');

      expect(result.frontmatter.date).toBeUndefined();
    });
  });

  describe('calculateReadingTime via getEntry', () => {
    it('returns 1 for short content', () => {
      expect(entryWithWordCount(10).readingTime).toBe(1);
    });

    it('returns 1 for exactly 200 words', () => {
      expect(entryWithWordCount(200).readingTime).toBe(1);
    });

    it('returns 2 for 201 words', () => {
      expect(entryWithWordCount(201).readingTime).toBe(2);
    });

    it('returns 2 for 400 words', () => {
      expect(entryWithWordCount(400).readingTime).toBe(2);
    });

    it('returns 1 for empty content', () => {
      expect(entryWithWordCount(0).readingTime).toBe(1);
    });
  });

  describe('getAllEntries locale filtering for work-experience', () => {
    it('includes base and current-locale files, excludes other locales, and dedupes slugs', () => {
      setupWorkFiles([
        'alpha.mdx',
        'alpha.pt-BR.mdx',
        'beta.pt-BR.mdx',
        'gamma.fr.mdx',
        'delta.mdx',
      ]);

      const result = getAllEntries('work-experience', 'pt-BR');

      expect(result.map((entry) => entry.slug).toSorted()).toEqual([
        'alpha',
        'beta',
        'delta',
      ]);
    });

    it('uses only base files for the English locale', () => {
      setupWorkFiles(['alpha.mdx', 'alpha.pt-BR.mdx', 'beta.mdx']);

      const result = getAllEntries('work-experience', 'en');

      expect(result.map((entry) => entry.slug).toSorted()).toEqual([
        'alpha',
        'beta',
      ]);
    });

    it('does not filter files for non-work content types', () => {
      setupWorkFiles(['one.pt-BR.mdx', 'two.fr.mdx', 'three.mdx']);

      const result = getAllEntries('projects', 'en');

      expect(result).toHaveLength(3);
    });
  });
});
