import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const auditScript = path.resolve('scripts/audit-react-bloat.mjs');

function runAudit(source: string, extension = '.tsx') {
  const directory = mkdtempSync(path.join(tmpdir(), 'react-bloat-audit-'));
  const file = path.join(directory, `Fixture${extension}`);

  try {
    writeFileSync(file, source);
    return spawnSync(process.execPath, [auditScript, file], {
      encoding: 'utf8',
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe('React bloat audit', () => {
  it('rejects prop explosion and accepts bounded prop interfaces', () => {
    const tooManyProps = runAudit(`
      interface ExcessiveProps {
        one: string;
        two: string;
        three: string;
        four: string;
        five: string;
        six: string;
        seven: string;
      }
    `);
    expect(tooManyProps.status).toBe(1);
    expect(tooManyProps.stderr).toContain('ExcessiveProps has 7 props');

    const boundedProps = runAudit(`
      interface BoundedProps {
        one: string;
        two: string;
        three: boolean;
        four: boolean;
        five: string;
        six: string;
      }
    `);
    expect(boundedProps.status).toBe(0);
  });

  it('rejects TSX files over the size limit', () => {
    const oversizedFile = runAudit(`${'const line = 1;\n'.repeat(181)}`);
    expect(oversizedFile.status).toBe(1);
    expect(oversizedFile.stderr).toContain('TSX file has 181 lines');
  });
});
