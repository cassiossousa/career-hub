import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  expectErrorWithRetry,
  mockApiJson,
  renderWithProviders,
} from '../../test/TestUtils';
import { FactsEditor } from './FactsEditor';

const valueInputs = () =>
  screen.getAllByLabelText<HTMLInputElement>(/^Answer \d+$/);

const lastValueInput = () => {
  const inputs = valueInputs();
  const last = inputs[inputs.length - 1];
  if (!last) throw new Error('expected answer input');
  return last;
};

const addFactRow = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /add fact/i }));
  return screen.getAllByLabelText(/^Key \d+$/).at(-1) as HTMLElement;
};

const setupEditor = async () => {
  const user = userEvent.setup();
  renderWithProviders(<FactsEditor />);
  await screen.findAllByLabelText(/^Answer \d+$/);
  return user;
};

const addFactWithValues = async (
  user: ReturnType<typeof userEvent.setup>,
  key: string,
  value: string,
) => {
  const keyInput = await addFactRow(user);
  await user.type(keyInput, key);
  await user.type(lastValueInput(), value);
};

const deleteFirstRow = async (user: ReturnType<typeof userEvent.setup>) => {
  const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
  await user.click(deleteButtons[0] as HTMLElement);
};

const saveAndWait = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /save facts/i }));
  await waitFor(() => {
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });
};

describe('FactsEditor', () => {
  it('renders the seeded facts table', async () => {
    renderWithProviders(<FactsEditor />);
    expect(
      await screen.findByRole('columnheader', { name: 'Key' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Category' }),
    ).toBeInTheDocument();
    expect(screen.getByText('work_authorization')).toBeInTheDocument();
    expect(valueInputs().length).toBeGreaterThan(0);
  });

  it('adds a row and saves a new fact', async () => {
    const user = await setupEditor();

    await addFactWithValues(user, 'notice_period', '30 days');
    await saveAndWait(user);

    expect(screen.getByDisplayValue('30 days')).toBeInTheDocument();
  }, 30000);

  it('deletes a fact row and saves', async () => {
    const user = await setupEditor();
    const initialCount = valueInputs().length;

    await deleteFirstRow(user);
    await saveAndWait(user);

    expect(valueInputs().length).toBe(initialCount - 1);
  }, 30000);

  it('shows a validation error when a new row has a value but no key', async () => {
    const user = await setupEditor();

    await addFactRow(user);
    await user.type(lastValueInput(), 'orphan value');
    await user.click(screen.getByRole('button', { name: /save facts/i }));

    expect(
      await screen.findByText(/every fact needs a key/i),
    ).toBeInTheDocument();
  }, 30000);

  it('shows a duplicate-key error before calling the API', async () => {
    const user = await setupEditor();

    await addFactWithValues(user, 'EMAIL', 'dup@example.com');
    await user.click(screen.getByRole('button', { name: /save facts/i }));

    expect(
      await screen.findByText(/fact keys must be unique/i),
    ).toBeInTheDocument();
  }, 30000);

  it('surfaces a save error when the API fails', async () => {
    mockApiJson(
      'put',
      '/api/facts/:key',
      { error: { code: 'UPSTREAM', message: 'Save failed' } },
      500,
    );
    const user = await setupEditor();

    await addFactWithValues(user, 'notice_period', '30 days');
    await user.click(screen.getByRole('button', { name: /save facts/i }));

    expect(await screen.findByText('Save failed')).toBeInTheDocument();
  }, 30000);

  it('shows an error state when loading fails', async () => {
    mockApiJson(
      'get',
      '/api/facts',
      { error: { code: 'UPSTREAM', message: 'Facts unavailable' } },
      500,
    );
    renderWithProviders(<FactsEditor />);
    await expectErrorWithRetry('Facts unavailable');
  });
});
