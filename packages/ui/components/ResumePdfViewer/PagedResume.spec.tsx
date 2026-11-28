import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { PagedResume } from './PagedResume';
import { RESUME_PDF_SPEC_LABELS } from './specFixtures';
import type { ResumePdfDocument } from './types';

function experienceEntry(company: string) {
  return {
    company,
    role: 'Engineer',
    period: '2020 - Present',
    bullets: ['Did things'],
  };
}

const DOCUMENT: ResumePdfDocument = {
  schemaVersion: 1,
  basics: { fullName: 'Paged Person', links: [] },
  summary: 'Summary text.',
  experience: [
    experienceEntry('Alpha'),
    experienceEntry('Beta'),
    experienceEntry('Gamma'),
    experienceEntry('Delta'),
  ],
  languages: [{ name: 'English' }],
};

function renderPaged(document: ResumePdfDocument = DOCUMENT) {
  render(<PagedResume document={document} labels={RESUME_PDF_SPEC_LABELS} />);
}

describe('PagedResume', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('measures the document and renders it inside A4 page papers', () => {
    renderPaged();

    const pages = document.querySelectorAll('.resume-print-page');
    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(pages[0]?.textContent).toContain('Paged Person');
    expect(pages[0]?.textContent).toContain('Alpha');
  });

  it('splits long sections across pages without repeating titles', () => {
    // jsdom reports 0 for every offsetHeight; stub deterministic heights so
    // the packer must break the experience section mid-list.
    jest
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockImplementation(function (this: HTMLElement) {
        if (this.hasAttribute('data-pdf-probe')) return 2000;
        if (this.tagName === 'SECTION') return 1200;
        if (this.tagName === 'ARTICLE') return 600;
        if (this.hasAttribute('data-pdf-block')) return 400;
        return 100;
      });

    renderPaged();

    const pages = document.querySelectorAll('.resume-print-page');
    expect(pages.length).toBeGreaterThan(1);
    // The section title renders once — continuations use the bare variant.
    expect(document.body.textContent.match(/Experience/g) ?? []).toHaveLength(
      1,
    );
    // Every entry still lands on some page.
    for (const company of ['Alpha', 'Beta', 'Gamma', 'Delta']) {
      expect(document.body.textContent).toContain(company);
    }
  });

  it('re-measures when the document changes', () => {
    const { rerender } = render(
      <PagedResume document={DOCUMENT} labels={RESUME_PDF_SPEC_LABELS} />,
    );
    expect(document.body.textContent).toContain('Paged Person');

    rerender(
      <PagedResume
        document={{
          ...DOCUMENT,
          basics: { fullName: 'New Person', links: [] },
        }}
        labels={RESUME_PDF_SPEC_LABELS}
      />,
    );

    expect(document.body.textContent).toContain('New Person');
    expect(document.body.textContent).not.toContain('Paged Person');
  });
});
