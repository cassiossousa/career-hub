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
});
