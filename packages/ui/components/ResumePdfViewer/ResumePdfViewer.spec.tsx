import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { resumePdfDocumentSchema } from '../../pdf/schema';
import { ResumePdfViewer } from './ResumePdfViewer';
import { RESUME_PDF_SPEC_LABELS } from './specFixtures';
import type { ResumePdfDocument } from './types';

const FULL_DOCUMENT: ResumePdfDocument = {
  schemaVersion: 1,
  basics: {
    fullName: 'Ada Lovelace',
    headline: 'Engineer',
    subtitle: 'Polymath',
    location: 'London',
    links: [{ label: 'Site', url: 'https://example.com' }],
  },
  summary: 'First programmer.',
  experience: [
    {
      company: 'Analytical Engines',
      role: 'Chief Mathematician',
      location: 'London',
      period: '1843–1852',
      bullets: ['Wrote the first algorithm', 'Coined the term'],
    },
  ],
  projects: [
    {
      title: 'Notes on the Engine',
      technologies: ['Notes G', 'Punch cards'],
      repoUrl: 'https://example.com/repo',
      demoUrl: 'https://example.com/demo',
      highlights: ['Translated Menabrea'],
    },
    {
      title: 'Private project',
      highlights: ['No links'],
    },
  ],
  skillGroups: [{ category: 'Languages', items: ['English', 'French'] }],
  education: [
    {
      institution: 'Self-taught',
      degree: 'Mathematics',
      fieldOfStudy: 'Computing',
      period: '1830s',
      details: 'Correspondence course',
    },
  ],
  certifications: [{ name: 'Fellow', issuer: 'Royal Society', year: '1835' }],
  languages: [{ name: 'English', proficiency: 'Native' }, { name: 'French' }],
};

function renderDocumentTwice(options: {
  printLabel?: string;
  paged?: boolean;
}) {
  const first = render(
    <ResumePdfViewer
      document={FULL_DOCUMENT}
      labels={RESUME_PDF_SPEC_LABELS}
      {...options}
    />,
  );
  const firstHtml = first.container.innerHTML;
  first.unmount();

  const second = render(
    <ResumePdfViewer
      document={FULL_DOCUMENT}
      labels={{ ...RESUME_PDF_SPEC_LABELS }}
      {...options}
    />,
  );

  return { firstHtml, secondHtml: second.container.innerHTML };
}

describe('ResumePdfViewer', () => {
  it('renders the header with name, title line, location and links', () => {
    render(
      <ResumePdfViewer
        document={FULL_DOCUMENT}
        labels={RESUME_PDF_SPEC_LABELS}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Ada Lovelace' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Engineer • Polymath')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Site' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
  });

  it('renders every populated section with its entries', () => {
    render(
      <ResumePdfViewer
        document={FULL_DOCUMENT}
        labels={RESUME_PDF_SPEC_LABELS}
      />,
    );

    expect(screen.getByText('First programmer.')).toBeInTheDocument();
    expect(screen.getByText('Chief Mathematician')).toBeInTheDocument();
    expect(screen.getByText('Analytical Engines')).toBeInTheDocument();
    expect(screen.getByText('London | 1843–1852')).toBeInTheDocument();
    expect(screen.getByText('Wrote the first algorithm')).toBeInTheDocument();

    expect(screen.getByText('Notes on the Engine')).toBeInTheDocument();
    expect(screen.getByText('Notes G, Punch cards')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Repository' })).toHaveAttribute(
      'href',
      'https://example.com/repo',
    );
    expect(screen.getByRole('link', { name: 'Demo' })).toHaveAttribute(
      'href',
      'https://example.com/demo',
    );
    expect(screen.getByText('Translated Menabrea')).toBeInTheDocument();

    expect(screen.getByText('Languages: English, French')).toBeInTheDocument();
    expect(screen.getByText('Mathematics — Computing')).toBeInTheDocument();
    expect(screen.getByText('Correspondence course')).toBeInTheDocument();
    expect(screen.getByText('Fellow')).toBeInTheDocument();
    expect(screen.getByText('Royal Society')).toBeInTheDocument();
    expect(screen.getByText('1835')).toBeInTheDocument();
    expect(screen.getByText('English — Native')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
  });

  it('omits sections whose data is missing or empty', () => {
    render(
      <ResumePdfViewer
        document={{
          schemaVersion: 1,
          basics: { fullName: 'Bare Bones', links: [] },
          experience: [],
          languages: [{ name: 'English' }],
        }}
        labels={RESUME_PDF_SPEC_LABELS}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Bare Bones' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Summary')).not.toBeInTheDocument();
    expect(screen.queryByText('Experience')).not.toBeInTheDocument();
    expect(screen.queryByText('Projects')).not.toBeInTheDocument();
    expect(screen.queryByText('Education')).not.toBeInTheDocument();
    expect(screen.queryByText('Certifications')).not.toBeInTheDocument();
    expect(screen.getByText('Languages')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('renders no print button without a printLabel', () => {
    render(
      <ResumePdfViewer
        document={FULL_DOCUMENT}
        labels={RESUME_PDF_SPEC_LABELS}
      />,
    );
    expect(
      screen.queryByRole('button', { name: /pdf/i }),
    ).not.toBeInTheDocument();
  });

  it('renders fixed A4 pages when paged', () => {
    render(
      <ResumePdfViewer
        document={FULL_DOCUMENT}
        labels={RESUME_PDF_SPEC_LABELS}
        paged
        printLabel="Download PDF"
      />,
    );

    const pages = document.querySelectorAll('.resume-print-page');
    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(pages[0]?.textContent).toContain('Ada Lovelace');
    expect(pages[0]?.textContent).toContain('Analytical Engines');
  });

  it('prints only the resume page in an isolated iframe when clicked', async () => {
    const user = userEvent.setup();
    render(
      <ResumePdfViewer
        document={FULL_DOCUMENT}
        labels={RESUME_PDF_SPEC_LABELS}
        printLabel="Download PDF"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Download PDF' }));

    const iframe = document.querySelector<HTMLIFrameElement>(
      'iframe[title="Print"]',
    );
    expect(iframe).toBeInTheDocument();
    const printDocument = iframe?.contentDocument;
    expect(printDocument?.body.textContent).toContain('Ada Lovelace');
    expect(printDocument?.body.textContent).toContain('Analytical Engines');
    // The clone lives in the iframe's document — a different realm, so
    // assert on the node rather than jest-dom's in-the-document matcher.
    expect(printDocument?.querySelector('.resume-print-page')).not.toBeNull();
    iframe?.remove();
  });

  it('renders only the schema-declared fields of the document it receives', () => {
    // The viewer contract is `z.infer<resumePdfDocumentSchema>`: anything
    // outside the schema is stripped at parse time and can never render.
    const document = resumePdfDocumentSchema.parse({
      ...FULL_DOCUMENT,
      injectedField: 'INJECTED-CONTENT',
      basics: { ...FULL_DOCUMENT.basics, injectedField: 'INJECTED-BASICS' },
    });

    render(
      <ResumePdfViewer document={document} labels={RESUME_PDF_SPEC_LABELS} />,
    );

    expect(screen.queryByText(/INJECTED/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Ada Lovelace' }),
    ).toBeInTheDocument();
  });

  it('renders byte-identical markup every time for the same document', () => {
    const { firstHtml, secondHtml } = renderDocumentTwice({
      printLabel: 'Download PDF',
    });

    expect(secondHtml).toBe(firstHtml);
  });

  it('renders byte-identical paged markup every time for the same document', () => {
    const { firstHtml, secondHtml } = renderDocumentTwice({ paged: true });

    expect(secondHtml).toBe(firstHtml);
  });

  it('produces identical print markup on repeated exports', async () => {
    const user = userEvent.setup();
    render(
      <ResumePdfViewer
        document={FULL_DOCUMENT}
        labels={RESUME_PDF_SPEC_LABELS}
        printLabel="Download PDF"
      />,
    );

    const printOnce = async () => {
      await user.click(screen.getByRole('button', { name: 'Download PDF' }));
      const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe[title="Print"]',
      );
      const html = iframe?.contentDocument?.body.innerHTML;
      iframe?.remove();
      return html;
    };

    const firstPrint = await printOnce();
    const secondPrint = await printOnce();

    expect(firstPrint).toBeTruthy();
    expect(secondPrint).toBe(firstPrint);
  });
});
