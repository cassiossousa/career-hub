import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { apiClient } from '../../services/api/client';
import {
  expectErrorWithRetry,
  mockApiJson,
  renderWithProviders,
} from '../../test/TestUtils';
import { ResumeEditor } from './ResumeEditor';

function renderEditor(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/applications/:id" element={<ResumeEditor />} />
    </Routes>,
    { route },
  );
}

const ALL_SECTIONS = [
  'Summary',
  'Experience',
  'Projects',
  'Skill groups',
  'Education',
  'Certifications',
  'Languages',
];

async function expandSections(
  user: ReturnType<typeof userEvent.setup>,
  names: string[],
) {
  for (const name of names) {
    await user.click(screen.getByRole('button', { name }));
  }
}

describe('ResumeEditor', () => {
  it('seeds a new resume from the portfolio for a saved application', async () => {
    const user = userEvent.setup();
    renderEditor(routePaths.applicationDetail('3'));
    expect(await screen.findByText('Tailored Resume')).toBeInTheDocument();
    expect(
      screen.getByText(/pre-filled from your portfolio/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Junior Frontend Developer')).toBeInTheDocument();

    await expandSections(user, ['Summary']);
    const summaryFields = await screen.findAllByLabelText(/summary/i);
    expect(summaryFields[0]).toHaveValue('Senior Frontend Engineer');
  });

  it('shows a live PDF preview of the resume document', async () => {
    renderEditor(routePaths.applicationDetail('3'));
    const preview = await screen.findByRole('complementary', {
      name: 'Preview',
    });
    expect(
      within(preview).getByRole('heading', { name: 'Cassio Sousa' }),
    ).toBeInTheDocument();
    expect(
      within(preview).getByRole('heading', { name: 'Experience' }),
    ).toBeInTheDocument();
    expect(
      within(preview).getByText(/React · TypeScript · Design systems/),
    ).toBeInTheDocument();
    expect(
      within(preview).getByText(/Led migration to React/),
    ).toBeInTheDocument();
  });

  it('updates the preview as the document is edited', async () => {
    const user = userEvent.setup();
    renderEditor(routePaths.applicationDetail('3'));
    const preview = await screen.findByRole('complementary', {
      name: 'Preview',
    });
    await user.click(screen.getByRole('button', { name: 'Summary' }));
    const summaryFields = await screen.findAllByLabelText(/summary/i);
    const docSummary = summaryFields[0];
    if (!docSummary) throw new Error('expected summary field');
    fireEvent.change(docSummary, { target: { value: 'Brand new summary' } });
    expect(within(preview).getByText('Brand new summary')).toBeInTheDocument();
  });

  it('saves the seeded resume', async () => {
    const user = userEvent.setup();
    renderEditor(routePaths.applicationDetail('3'));
    await screen.findByText('Tailored Resume');
    await expandSections(user, ALL_SECTIONS);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Edited Name' },
    });
    const summaryFields = screen.getAllByLabelText(/summary/i);
    const docSummary = summaryFields[0];
    if (!docSummary) throw new Error('expected summary field');
    fireEvent.change(docSummary, { target: { value: 'Edited summary' } });
    fireEvent.change(screen.getByLabelText(/company/i), {
      target: { value: 'Edited Corp' },
    });
    fireEvent.change(screen.getByLabelText(/slug/i), {
      target: { value: 'edited-slug' },
    });
    fireEvent.change(screen.getByLabelText(/^title/i), {
      target: { value: 'Edited Project' },
    });

    const listInputs = screen.getAllByLabelText('Add item');
    const skillGroupItems = listInputs[5];
    if (!skillGroupItems) throw new Error('expected skill group items input');
    fireEvent.change(skillGroupItems, { target: { value: 'Vue' } });
    fireEvent.keyDown(skillGroupItems, { key: 'Enter' });

    await user.click(screen.getByRole('button', { name: /add education/i }));
    fireEvent.change(screen.getByLabelText(/institution/i), {
      target: { value: 'MIT' },
    });
    fireEvent.change(screen.getByLabelText(/degree/i), {
      target: { value: 'BSc' },
    });
    await user.click(
      screen.getByRole('button', { name: /add certification/i }),
    );
    fireEvent.change(screen.getByLabelText(/^name/i), {
      target: { value: 'AWS SA' },
    });
    await user.click(screen.getByRole('button', { name: /add language/i }));
    fireEvent.change(screen.getByLabelText(/^language/i), {
      target: { value: 'Spanish' },
    });

    const saveButton = await screen.findByRole('button', { name: 'Save' });
    await user.click(saveButton);
    expect(await screen.findByText('Saved')).toBeInTheDocument();
  }, 60000);

  it('shows the locked state for a submitted application resume', async () => {
    renderEditor(routePaths.applicationDetail('1'));
    expect(
      await screen.findByText(/already been submitted/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('shows the locked error when saving a now-locked resume', async () => {
    const user = userEvent.setup();
    renderEditor(routePaths.applicationDetail('3'));
    const saveButton = await screen.findByRole('button', { name: 'Save' });
    await apiClient.patch('/api/applications/3', { status: 'applied' });
    await user.click(saveButton);
    expect(
      await screen.findByText(/can no longer be edited/i),
    ).toBeInTheDocument();
  });

  it('falls back to empty basics when the portfolio has no documents', async () => {
    mockApiJson(
      'get',
      '/api/portfolio',
      {
        id: 1,
        filters: { levels: [], areas: [], locations: [], remoteOnly: false },
        documents: {},
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      200,
    );
    renderEditor(routePaths.applicationDetail('3'));
    expect(await screen.findByText('Tailored Resume')).toBeInTheDocument();
    const user = userEvent.setup();
    await expandSections(user, ['Summary']);
    const summaryFields = await screen.findAllByLabelText(/summary/i);
    expect(summaryFields[0]).toHaveValue('');
  });

  it('shows not-found for an invalid id', () => {
    renderEditor(routePaths.applicationDetail('abc'));
    expect(screen.getByText('Page not found.')).toBeInTheDocument();
  });

  it('shows an error state when loading fails', async () => {
    mockApiJson(
      'get',
      '/api/applications/3',
      { error: { code: 'UPSTREAM', message: 'Application unavailable' } },
      500,
    );
    renderEditor(routePaths.applicationDetail('3'));
    await expectErrorWithRetry('Application unavailable');
  });
});
