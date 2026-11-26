import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/TestUtils';
import { ApplyArtifactPreview } from './ApplyArtifactPreview';

function renderPreview(
  overrides: Partial<Parameters<typeof ApplyArtifactPreview>[0]> = {},
) {
  return renderWithProviders(
    <ApplyArtifactPreview
      runId={1}
      name="resume.txt"
      open
      onClose={() => {}}
      {...overrides}
    />,
  );
}

describe('ApplyArtifactPreview', () => {
  it('shows the artifact text in a dialog', async () => {
    renderPreview();
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(
      await screen.findByText(/Senior Frontend Engineer/),
    ).toBeInTheDocument();
  });

  it('shows an error alert when the artifact is missing', async () => {
    renderPreview({ name: 'missing.txt' });
    expect(
      await screen.findByRole('button', { name: /retry/i }),
    ).toBeInTheDocument();
  });

  it('calls onClose from the close button', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    renderPreview({ onClose });
    await screen.findByText(/Senior Frontend Engineer/);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
