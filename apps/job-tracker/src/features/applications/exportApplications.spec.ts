import type { Application } from '../../services/types/application';
import { makeApplication } from '../../test/fixtures';
import {
  exportApplicationsCsv,
  exportApplicationsJson,
} from './exportApplications';

const makeApp = makeApplication;

function blobText(blob: Blob | undefined): Promise<string> {
  return new Promise((resolve, reject) => {
    if (blob === undefined) {
      reject(new Error('expected captured blob'));
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    });
    reader.addEventListener('error', () => {
      reject(
        reader.error instanceof Error
          ? reader.error
          : new Error('Failed to read blob'),
      );
    });
    reader.readAsText(blob);
  });
}

let capturedBlob: Blob | undefined;
let downloadedName: string | undefined;

beforeEach(() => {
  capturedBlob = undefined;
  downloadedName = undefined;
  Object.defineProperty(URL, 'createObjectURL', {
    value: jest.fn((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    }),
    configurable: true,
    writable: true,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: jest.fn(),
    configurable: true,
    writable: true,
  });
  jest
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(function click(this: HTMLAnchorElement) {
      downloadedName = this.download;
    });
});

afterEach(() => {
  jest.restoreAllMocks();
  Reflect.deleteProperty(URL, 'createObjectURL');
  Reflect.deleteProperty(URL, 'revokeObjectURL');
});

describe('exportApplicationsCsv', () => {
  it('writes a header row and one row per application', async () => {
    exportApplicationsCsv(
      [makeApp(), makeApp({ id: 2, jobId: 20 })],
      new Map([
        [10, 'Frontend Dev'],
        [20, 'Backend Dev'],
      ]),
    );
    expect(downloadedName).toMatch(/^applications-\d{4}-\d{2}-\d{2}\.csv$/);
    const text = await blobText(capturedBlob);
    const lines = text.trim().split('\n');
    expect(lines[0]).toBe(
      'id,jobId,title,status,appliedAt,statusChangedAt,createdAt,notes',
    );
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('Frontend Dev');
  });

  it('escapes commas, quotes, and newlines in cells', async () => {
    exportApplicationsCsv(
      [
        makeApp({
          notes: 'line one\nsay "hi", ok',
          appliedAt: null,
        }),
      ],
      new Map(),
    );
    const text = await blobText(capturedBlob);
    expect(text).toContain('"line one\nsay ""hi"", ok"');
  });

  it('falls back to an empty title for unknown job ids', async () => {
    exportApplicationsCsv([makeApp({ jobId: 999 })], new Map());
    const text = await blobText(capturedBlob);
    const dataRow = text.trim().split('\n')[1] ?? '';
    expect(dataRow.startsWith('1,999,,applied,')).toBe(true);
  });
});

describe('exportApplicationsJson', () => {
  it('serializes the applications as JSON', async () => {
    exportApplicationsJson([makeApp({ notes: 'hello' })]);
    expect(downloadedName).toMatch(/^applications-.*\.json$/);
    const text = await blobText(capturedBlob);
    const parsed: unknown = JSON.parse(text);
    expect(Array.isArray(parsed)).toBe(true);
    expect((parsed as Application[])[0]?.notes).toBe('hello');
  });
});
