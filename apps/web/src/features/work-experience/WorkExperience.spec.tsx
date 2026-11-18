import { render, screen } from '@testing-library/react';
import { TranslationProvider } from '../../i18n/Provider';
import WorkExperience from './WorkExperience';

jest.mock(
  'virtual:portfolio-content',
  () => ({
    content: {
      en: {
        projects: [],
        workExperience: [
          {
            slug: 'older-role',
            type: 'work-experience',
            frontmatter: {
              company: 'Older Corp',
              role: 'Developer',
              start: '2018-01-01',
              end: '2020-01-01',
            },
            content: 'Older bullet',
          },
          {
            slug: 'newer-role',
            type: 'work-experience',
            frontmatter: {
              company: 'Newer Corp',
              role: 'Senior Developer',
              location: 'Remote',
              start: '2022-01-01',
            },
            content: 'Newer bullet one\nNewer bullet two',
          },
        ],
      },
      'pt-BR': { projects: [], workExperience: [] },
    },
  }),
  { virtual: true },
);

describe('WorkExperience', () => {
  it('renders roles newest first with company, title, and bullets', () => {
    render(
      <TranslationProvider>
        <WorkExperience />
      </TranslationProvider>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Work Experience' }),
    ).toBeInTheDocument();

    const older = screen.getByText('Older Corp');
    const newer = screen.getByText('Newer Corp');
    expect(
      newer.compareDocumentPosition(older) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText(/Remote \|/)).toBeInTheDocument();
    expect(screen.getByText('Newer bullet one')).toBeInTheDocument();
    expect(screen.getByText('Newer bullet two')).toBeInTheDocument();
    expect(screen.getByText('Older bullet')).toBeInTheDocument();
  });
});
