import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { TranslationProvider } from '../../i18n/Provider';
import Resume from './Resume';

jest.mock(
  'virtual:portfolio-content',
  () => ({
    content: {
      en: { workExperience: [] },
      'pt-BR': { workExperience: [] },
    },
  }),
  { virtual: true },
);

jest.mock('../../services/projects/getProjects', () => ({
  getProjects: () => [],
}));

describe('Resume', () => {
  it('renders the resume in the route and prints the current page', () => {
    const print = jest.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={[routePaths.resume]}>
        <TranslationProvider>
          <Routes>
            <Route path={routePaths.resume} element={<Resume />} />
          </Routes>
        </TranslationProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Cássio dos Santos Sousa',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByTitle('Resume')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /experience/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /projects/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /print \/ save as pdf/i }),
    );

    expect(print).toHaveBeenCalledTimes(1);
    print.mockRestore();
  });
});
