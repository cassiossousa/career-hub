import { render, screen } from '@testing-library/react';
import { getDictionary } from '../../i18n/dictionaries';
import type { Project } from '../../types/project';
import ResumeDocument, { type ResumeDocumentData } from './ResumeDocument';

describe('ResumeDocument', () => {
  it('renders resume sections, experience, and selected projects as React content', () => {
    const messages = getDictionary('en');
    const data: ResumeDocumentData = {
      name: 'Cássio Sousa',
      title: 'Senior Software Engineer | Frontend Architecture',
      username: 'cassiossousa',
      summary: 'Builds reliable web applications.',
      roles: [
        {
          company: 'Example Inc.',
          title: 'Frontend Engineer',
          location: 'Remote',
          period: 'Jan 2022 - Present',
          bullets: ['Built accessible interfaces'],
        },
      ],
      languages: ['Portuguese - Native', 'English - Fluent'],
    };
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
      <ResumeDocument data={data} projects={projects} messages={messages} />,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: data.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(data.summary)).toBeInTheDocument();
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
    expect(screen.getByText('Portuguese - Native')).toBeInTheDocument();
  });
});
