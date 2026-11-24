import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ResumePdfViewer } from './ResumePdfViewer';
import type { ResumePdfDocument, ResumePdfViewerLabels } from './types';

const LABELS: ResumePdfViewerLabels = {
  summary: 'Summary',
  experience: 'Experience',
  projects: 'Projects',
  skillGroups: 'Skills',
  education: 'Education',
  certifications: 'Certifications',
  languages: 'Languages',
  repository: 'Repository',
  demo: 'Demo',
};

const FULL_DOCUMENT: ResumePdfDocument = {
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

describe('ResumePdfViewer', () => {
  it('renders the header with name, title line, location and links', () => {
    render(<ResumePdfViewer document={FULL_DOCUMENT} labels={LABELS} />);

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
    render(<ResumePdfViewer document={FULL_DOCUMENT} labels={LABELS} />);

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
          basics: { fullName: 'Bare Bones', links: [] },
          experience: [],
          languages: [{ name: 'English' }],
        }}
        labels={LABELS}
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
});
