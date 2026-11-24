import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  expectErrorWithRetry,
  mockApiJson,
  renderWithProviders,
} from '../../test/TestUtils';
import { SkillsEditor } from './SkillsEditor';

const skillInputs = () => screen.getAllByLabelText(/^Skill \d+$/);

const lastSkillInput = () => {
  const inputs = skillInputs();
  const last = inputs[inputs.length - 1];
  if (!last) throw new Error('expected new skill input');
  return last;
};

const addSkillRow = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /add skill/i }));
  return lastSkillInput();
};

const saveAndWait = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /save skills/i }));
  await waitFor(() => {
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });
};

describe('SkillsEditor', () => {
  it('renders the seeded skills table', async () => {
    renderWithProviders(<SkillsEditor />);
    expect(
      await screen.findByRole('columnheader', { name: 'Skill' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Group' }),
    ).toBeInTheDocument();
    expect(skillInputs().length).toBeGreaterThan(0);
  });

  it('adds a row and saves a new skill', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SkillsEditor />);
    await screen.findAllByLabelText(/^Skill \d+$/);

    await user.type(await addSkillRow(user), 'Rust');
    await saveAndWait(user);

    expect(screen.getByDisplayValue('Rust')).toBeInTheDocument();
  }, 30000);

  it('deletes a skill row and saves', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SkillsEditor />);
    const firstInput = await screen.findByLabelText('Skill 1');
    const deletedName = (firstInput as HTMLInputElement).value;
    const initialCount = skillInputs().length;

    const deleteButtons = screen.getAllByRole('button', {
      name: /delete/i,
    });
    await user.click(deleteButtons[0] as HTMLElement);

    await saveAndWait(user);

    expect(skillInputs().length).toBe(initialCount - 1);
    expect(screen.queryByDisplayValue(deletedName)).not.toBeInTheDocument();
  }, 30000);

  it('shows a validation error when an existing skill name is cleared', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SkillsEditor />);
    await user.clear(await screen.findByLabelText('Skill 1'));
    await user.click(screen.getByRole('button', { name: /save skills/i }));
    expect(
      await screen.findByText(/every saved skill needs a name/i),
    ).toBeInTheDocument();
  }, 30000);

  it('shows a duplicate-name error before calling the API', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SkillsEditor />);
    await screen.findByLabelText('Skill 1');
    await user.type(await addSkillRow(user), 'react');
    await user.click(screen.getByRole('button', { name: /save skills/i }));
    expect(
      await screen.findByText(/skill names must be unique/i),
    ).toBeInTheDocument();
  }, 30000);

  it('surfaces a save error when the API fails', async () => {
    mockApiJson(
      'post',
      '/api/skills',
      { error: { code: 'UPSTREAM', message: 'Save failed' } },
      500,
    );
    const user = userEvent.setup();
    renderWithProviders(<SkillsEditor />);
    await screen.findByLabelText('Skill 1');
    await user.type(await addSkillRow(user), 'Rust');
    await user.click(screen.getByRole('button', { name: /save skills/i }));
    expect(await screen.findByText('Save failed')).toBeInTheDocument();
  }, 30000);

  it('edits skill and group labels and saves them', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SkillsEditor />);
    await screen.findByLabelText('Skill: React English');

    await user.clear(screen.getByLabelText('Skill: React English'));
    await user.type(screen.getByLabelText('Skill: React English'), 'React.js');
    const groupLabel = screen.getByLabelText('Group: Frontend English');
    await user.clear(groupLabel);
    await user.type(groupLabel, 'Frontend');

    await user.click(screen.getByRole('button', { name: /save labels/i }));
    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
    // Values survive the post-save refetch, proving they round-tripped.
    expect(screen.getByLabelText('Skill: React English')).toHaveValue(
      'React.js',
    );
    expect(screen.getByLabelText('Group: Frontend English')).toHaveValue(
      'Frontend',
    );
  }, 30000);

  it('shows an error state when loading fails', async () => {
    mockApiJson(
      'get',
      '/api/skills',
      { error: { code: 'UPSTREAM', message: 'Skills unavailable' } },
      500,
    );
    renderWithProviders(<SkillsEditor />);
    await expectErrorWithRetry('Skills unavailable');
  });
});
