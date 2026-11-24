import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { TranslationProvider } from '../../i18n/Provider';
import { getProject } from '../../services/projects/getProjects';
import type { Project } from '../../types/project';
import ProjectDetails from './ProjectDetails';

const project: Project = {
  slug: 'featured-app',
  title: 'Featured App',
  description: 'A description',
  summary: ['Did a thing', 'Did another thing'],
  highlights: ['Scaled to millions', 'Zero downtime'],
  technologies: ['React'],
  repo: 'https://github.com/x/featured-app',
  demo: 'https://featured.example.com',
};

jest.mock('../../services/projects/getProjects', () => ({
  getProject: jest.fn(),
}));

const mockGetProject = getProject as jest.MockedFunction<typeof getProject>;

function renderDetails(entry: string) {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <TranslationProvider>
        <Routes>
          <Route
            path={routePaths.projectDetails}
            element={<ProjectDetails />}
          />
        </Routes>
      </TranslationProvider>
    </MemoryRouter>,
  );
}

describe('ProjectDetails', () => {
  beforeEach(() => {
    mockGetProject.mockReset();
  });

  it('renders the project detail sections and external links', () => {
    mockGetProject.mockReturnValue(project);
    renderDetails('/projects/featured-app');

    expect(mockGetProject).toHaveBeenCalledWith('featured-app', 'en');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Featured App' }),
    ).toBeInTheDocument();
    expect(screen.getByText('A description')).toBeInTheDocument();
    expect(screen.getByText('Did a thing')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Highlights' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Scaled to millions')).toBeInTheDocument();

    const githubLink = screen.getByRole('link', { name: 'GitHub' });
    const demoLink = screen.getByRole('link', { name: 'Live Demo' });
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/x/featured-app',
    );
    expect(demoLink).toHaveAttribute('href', 'https://featured.example.com');
  });

  it('renders the not-found state with a way back to the projects list', () => {
    mockGetProject.mockReturnValue(null);
    renderDetails('/projects/missing');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Project not found' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to projects' }),
    ).toHaveAttribute('href', routePaths.projects);
  });
});
