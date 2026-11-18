import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TranslationProvider } from '../../i18n/Provider';
import type { Project } from '../../types/project';
import Projects from './Projects';

const projects: Project[] = [
  {
    slug: 'featured-app',
    title: 'Featured App',
    summary: ['one', 'two', 'three', 'four'],
    technologies: ['React', 'TypeScript'],
    stars: 7,
    repo: 'https://github.com/x/featured-app',
    demo: 'https://featured.example.com',
    featured: true,
  },
  {
    slug: 'resume-tool',
    title: 'Resume Tool',
    topics: ['resume'],
  },
  {
    slug: 'plain-lib',
    title: 'Plain Library',
  },
];

jest.mock('../../services/projects/getProjects', () => ({
  getProjects: () => projects,
}));

function renderProjects() {
  render(
    <MemoryRouter>
      <TranslationProvider locale="en" onLocaleChange={() => {}}>
        <Projects />
      </TranslationProvider>
    </MemoryRouter>,
  );
}

describe('Projects', () => {
  it('lists only featured or resume-tagged projects with links and metadata', () => {
    renderProjects();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Projects' }),
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Featured App' })).toHaveAttribute(
      'href',
      '/projects/featured-app',
    );
    expect(screen.getByRole('link', { name: 'Resume Tool' })).toHaveAttribute(
      'href',
      '/projects/resume-tool',
    );
    expect(screen.queryByText('Plain Library')).not.toBeInTheDocument();

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByLabelText('7 stars')).toBeInTheDocument();
    const githubLink = screen.getByRole('link', { name: 'GitHub' });
    const demoLink = screen.getByRole('link', { name: 'Demo' });
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/x/featured-app',
    );
    expect(demoLink).toHaveAttribute('href', 'https://featured.example.com');
  });

  it('renders at most three summary bullets per project', () => {
    renderProjects();

    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('three')).toBeInTheDocument();
    expect(screen.queryByText('four')).not.toBeInTheDocument();
  });
});
