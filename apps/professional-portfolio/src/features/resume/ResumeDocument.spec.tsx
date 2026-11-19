import { render, screen } from '@testing-library/react';
import { getDictionary } from '../../i18n/dictionaries';
import { TranslationProvider } from '../../i18n/Provider';
import type { Project } from '../../types/project';
import ResumeDocument from './ResumeDocument';

describe('ResumeDocument', () => {
  it('renders resume sections, experience, and selected projects as React content', () => {
    const messages = getDictionary('en');
    const roles = [
      {
        company: 'Example Inc.',
        title: 'Frontend Engineer',
        location: 'Remote',
        period: 'Jan 2022 - Present',
        bullets: [{ line: 'Built accessible interfaces', skills: [] }],
      },
    ];
    const projects: Project[] = [
      {
        slug: 'portfolio',
        title: 'Portfolio application',
        repo: 'https://github.com/example/portfolio',
        technologies: ['React', 'TypeScript'],
        summary: ['Built a feature-oriented React application'],
      },
    ];

    render(
      <TranslationProvider>
        <ResumeDocument roles={roles} projects={projects} />
      </TranslationProvider>,
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: messages.home.name,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(messages.resume.summary)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Example Inc.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Built accessible interfaces')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: messages.projects.title }),
    ).toBeInTheDocument();
    expect(screen.getByText('Portfolio application')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/example/portfolio',
    );
    expect(
      screen.getByText(messages.resume.languages.portuguese),
    ).toBeInTheDocument();
  });
});
