import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '../../mocks/server';
import { useUIStore } from '../../store/uiStore';
import { renderWithProviders } from '../../test/TestUtils';
import { ManualJobForm } from './ManualJobForm';

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/job url/i), {
    target: { value: 'https://jobs.example.com/1' },
  });
  fireEvent.change(screen.getByLabelText(/job title/i), {
    target: { value: 'Manual QA Engineer' },
  });
  fireEvent.change(screen.getByLabelText(/company/i), {
    target: { value: 'Acme' },
  });
  fireEvent.change(screen.getByLabelText(/location/i), {
    target: { value: 'Remote' },
  });
  fireEvent.change(screen.getByLabelText(/description/i), {
    target: { value: 'Test description' },
  });
}

function submitForm() {
  // The submit button uses the HTML `form` attribute, which jsdom does not
  // associate — dispatch the submit event on the form directly. The dialog
  // renders in a portal, so query the document rather than the container.
  const form = document.getElementById('manual-job-form');
  if (!form) throw new Error('expected manual job form element');
  fireEvent.submit(form);
}

function at<T>(items: T[], index: number): T {
  const item = items[index];
  if (item === undefined) throw new Error(`missing element at index ${index}`);
  return item;
}

describe('ManualJobForm', () => {
  beforeEach(() => {
    useUIStore.setState({ isManualJobFormOpen: false });
  });

  it('is closed by default', () => {
    renderWithProviders(<ManualJobForm />);
    expect(screen.queryByText('Add Job Manually')).not.toBeInTheDocument();
  });

  it('submits a new job and closes the dialog', async () => {
    useUIStore.getState().openManualJobForm();
    renderWithProviders(<ManualJobForm />);
    fillRequiredFields();
    submitForm();

    await waitFor(
      () => {
        expect(screen.queryByText('Add Job Manually')).not.toBeInTheDocument();
      },
      { timeout: 10000 },
    );
    expect(useUIStore.getState().isManualJobFormOpen).toBe(false);
  }, 20000);

  it('updates selects, salary fields and the remote switch', async () => {
    const user = userEvent.setup();
    useUIStore.getState().openManualJobForm();
    renderWithProviders(<ManualJobForm />);

    const comboboxes = screen.getAllByRole('combobox');
    // area, level, source selects (in render order)
    await user.click(at(comboboxes, 0));
    await user.click(at(screen.getAllByRole('option'), 1));
    await user.click(at(comboboxes, 1));
    await user.click(at(screen.getAllByRole('option'), 1));
    await user.click(at(comboboxes, 2));
    await user.click(at(screen.getAllByRole('option'), 1));

    fireEvent.change(screen.getByLabelText(/salary min/i), {
      target: { value: '5000' },
    });
    fireEvent.change(screen.getByLabelText(/salary max/i), {
      target: { value: '8000' },
    });
    await user.click(screen.getByRole('switch', { name: /remote/i }));
  });

  it('shows an error alert when creation fails', async () => {
    server.use(
      http.post('/api/jobs', () =>
        HttpResponse.json(
          { error: { code: 'UPSTREAM', message: 'Creation failed' } },
          { status: 500 },
        ),
      ),
    );
    useUIStore.getState().openManualJobForm();
    renderWithProviders(<ManualJobForm />);
    fillRequiredFields();
    submitForm();

    expect(await screen.findByText('Creation failed')).toBeInTheDocument();
    expect(useUIStore.getState().isManualJobFormOpen).toBe(true);
  }, 20000);
});
