import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { renderWithProviders } from '../../test/TestUtils';
import { ApplicationHub } from './ApplicationHub';

function renderHub(applicationId: string, tab?: string) {
  const route =
    tab === undefined
      ? routePaths.applicationDetail(applicationId)
      : `${routePaths.applicationDetail(applicationId)}?tab=${tab}`;
  return renderWithProviders(
    <Routes>
      <Route
        path={routePaths.applicationDetail(':id')}
        element={<ApplicationHub />}
      />
    </Routes>,
    { route },
  );
}

describe('ApplicationHub', () => {
  it('renders the overview tab with job link, status, and notes', async () => {
    renderHub('1');
    expect(
      await screen.findByRole('link', { name: 'Frontend Developer' }),
    ).toHaveAttribute('href', routePaths.jobDetail('1'));
    expect(
      screen.getAllByText('Applied', { selector: '.MuiChip-label' }),
    ).not.toHaveLength(0);
    expect(
      screen.getByDisplayValue(
        'Strong React match, tailor resume before interview.',
      ),
    ).toBeInTheDocument();
  });

  it('shows the not-found state for a non-numeric id', () => {
    renderHub('abc');
    expect(screen.getByText('Page not found.')).toBeInTheDocument();
  });

  it('lists seeded interviews on the interviews tab', async () => {
    renderHub('1', 'interviews');
    expect(await screen.findByText(/Screening/)).toBeInTheDocument();
    expect(screen.getByText('Video call')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows the empty state on the interviews tab when none exist', async () => {
    renderHub('2', 'interviews');
    expect(
      await screen.findByText('No interviews scheduled yet.'),
    ).toBeInTheDocument();
  });

  it('lists linked contacts with the primary marker', async () => {
    renderHub('1', 'contacts');
    expect(await screen.findByText('Marina Alves')).toBeInTheDocument();
    expect(screen.getByText('Beatriz Lima')).toBeInTheDocument();
    expect(screen.getAllByText('Primary')).toHaveLength(1);
  });

  it('lists offers with status and salary range', async () => {
    renderHub('9', 'offers');
    expect(await screen.findByText('Negotiating')).toBeInTheDocument();
    expect(screen.getAllByText(/BRL/).length).toBeGreaterThan(0);
    expect(screen.getByText(/22,000/)).toBeInTheDocument();
  });

  it('shows the cover letter body for applications that have one', async () => {
    renderHub('1', 'coverLetter');
    expect(
      await screen.findByDisplayValue(/Frontend Developer — Cassio Sousa/),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(/I am excited to apply/),
    ).toBeInTheDocument();
  });

  it('renders the activity timeline newest first', async () => {
    renderHub('1', 'activity');
    expect(await screen.findAllByText('Application created')).not.toHaveLength(
      0,
    );
    expect(screen.getAllByText('Status changed').length).toBeGreaterThan(0);
  });

  it('saves edited notes through the update mutation', async () => {
    const user = userEvent.setup();
    renderHub('2');
    const notes = await screen.findByLabelText('Notes');
    await user.clear(notes);
    await user.type(notes, 'Called the recruiter.');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
  });

  it('requires a reason before marking an application as no response', async () => {
    const user = userEvent.setup();
    renderHub('1');
    const statusSelect = await screen.findByRole('combobox');
    await user.click(statusSelect);
    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByText('No response'));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Next' }));
    expect(
      await screen.findByText('No response', { selector: '.MuiChip-label' }),
    ).toBeInTheDocument();
  });

  it('validates, creates, and deletes an offer', async () => {
    const user = userEvent.setup();
    renderHub('9', 'offers');
    await screen.findByText('Negotiating');

    await user.click(screen.getByRole('button', { name: 'Add offer' }));
    await user.type(screen.getByLabelText('Currency'), 'US');
    await user.click(screen.getByRole('button', { name: 'Add offer' }));
    expect(await screen.findByText(/3-letter code/)).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Currency'));
    await user.type(screen.getByLabelText('Currency'), 'usd');
    await user.type(screen.getByLabelText('Salary min'), '90000');
    await user.type(screen.getByLabelText('Salary max'), '120000');
    await user.type(screen.getByLabelText('Equity'), '0.1%');
    await user.click(screen.getByRole('button', { name: 'Add offer' }));

    await waitFor(() => {
      expect(screen.queryByLabelText('Currency')).not.toBeInTheDocument();
    });
    expect(await screen.findByText('USD')).toBeInTheDocument();

    const deletes = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deletes[deletes.length - 1] as HTMLElement);
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(1);
    });
  });

  it('schedules and deletes an interview', async () => {
    const user = userEvent.setup();
    renderHub('2', 'interviews');
    await screen.findByText('No interviews scheduled yet.');

    await user.click(
      screen.getByRole('button', { name: 'Schedule interview' }),
    );
    const submit = screen.getByRole('button', {
      name: 'Schedule interview',
    });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Date & time'), {
      target: { value: '2030-01-01T10:00' },
    });
    await user.type(screen.getByLabelText('Duration (min)'), '45');
    await user.type(screen.getByLabelText('Round'), 'Technical');
    await user.click(
      screen.getByRole('button', { name: 'Schedule interview' }),
    );

    expect(await screen.findByText(/Technical · 45 min/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => {
      expect(
        screen.getByText('No interviews scheduled yet.'),
      ).toBeInTheDocument();
    });
  });

  it('creates a contact and links it as primary', async () => {
    const user = userEvent.setup();
    renderHub('3', 'contacts');
    await screen.findByText('No contacts linked to this application yet.');

    await user.click(screen.getByRole('button', { name: 'New contact' }));
    await user.click(screen.getByRole('button', { name: 'Save contact' }));
    expect(
      await screen.findByText('Contact name is required.'),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText('Name'), 'New Person');
    await user.type(screen.getByLabelText('Role'), 'Recruiter');
    await user.click(screen.getByRole('button', { name: 'Save contact' }));

    expect(await screen.findByText('New Person')).toBeInTheDocument();
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('links an existing contact and unlinks it again', async () => {
    const user = userEvent.setup();
    renderHub('3', 'contacts');
    await screen.findByText('No contacts linked to this application yet.');

    await user.click(
      screen.getByRole('button', { name: 'Link existing contact' }),
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(
      await screen.findByRole('option', { name: /Rafael Nunes/ }),
    );
    await user.click(screen.getByRole('button', { name: 'Link' }));
    expect(await screen.findByText('Rafael Nunes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Unlink' }));
    await waitFor(() => {
      expect(screen.queryByText('Rafael Nunes')).not.toBeInTheDocument();
    });
  });

  it('validates, saves, and deletes a cover letter', async () => {
    const user = userEvent.setup();
    renderHub('2', 'coverLetter');
    await screen.findByText('No cover letter yet — write one below.');

    await user.click(screen.getByRole('button', { name: 'Save cover letter' }));
    expect(
      await screen.findByText('Cover letter body cannot be empty.'),
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText('Body'),
      'I am excited to apply for this role.',
    );
    await user.click(screen.getByRole('button', { name: 'Save cover letter' }));
    expect(await screen.findByText('Saved')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => {
      expect(
        screen.getByText('No cover letter yet — write one below.'),
      ).toBeInTheDocument();
    });
  });
});
