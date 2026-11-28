import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { renderWithProviders } from '../../test/TestUtils';
import { ApplyRunReview } from './ApplyRunReview';

function renderReview(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/apply/:id" element={<ApplyRunReview />} />
    </Routes>,
    { route },
  );
}

type User = ReturnType<typeof userEvent.setup>;

async function replaceEmail(user: User, value: string): Promise<void> {
  const emailInput = await screen.findByDisplayValue('cassio@example.com');
  await user.clear(emailInput);
  await user.type(emailInput, value);
}

async function expectMotivationRegenerated(): Promise<void> {
  await waitFor(() => {
    expect(
      screen.queryByDisplayValue(/Waymark's focus/),
    ).not.toBeInTheDocument();
  });
  expect(
    await screen.findByDisplayValue(
      /excited about this opportunity|aligns closely|strong fit/i,
    ),
  ).toBeInTheDocument();
}

describe('ApplyRunReview', () => {
  it('renders the extracted form fields with proposed answers', async () => {
    renderReview(routePaths.applyRun('1'));
    expect(
      await screen.findByRole('heading', { name: 'Apply run review' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Personal information')).toBeInTheDocument();
    expect(screen.getByText('Eligibility')).toBeInTheDocument();
    expect(screen.getByDisplayValue('cassio@example.com')).toBeInTheDocument();
    expect(screen.getAllByText('Fact · 100%').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /^approve$/i })).toBeEnabled();
  });

  it('shows tailoring suggestions from the match score', async () => {
    renderReview(routePaths.applyRun('1'));
    expect(
      await screen.findByRole('heading', { name: 'Tailoring suggestions' }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Match score: \d+%/)).toBeInTheDocument();
  });

  it('hides tailoring suggestions on terminal runs', async () => {
    renderReview(routePaths.applyRun('2'));
    await screen.findByRole('heading', { name: 'Apply run review' });
    expect(
      screen.queryByRole('heading', { name: 'Tailoring suggestions' }),
    ).not.toBeInTheDocument();
  });

  it('shows artifact previews', async () => {
    renderReview(routePaths.applyRun('1'));
    expect(
      await screen.findByRole('button', { name: 'resume.txt' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'cover_letter.txt' }),
    ).toBeInTheDocument();
  });

  it('edits an answer then approves', async () => {
    const user = userEvent.setup();
    renderReview(routePaths.applyRun('1'));
    await replaceEmail(user, 'new@example.com');

    await user.click(screen.getByRole('button', { name: /save answers/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /save answers/i }),
      ).toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: /^approve$/i }));
    // Approving parks the run — submission stays manual.
    await waitFor(() => {
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /mark as submitted/i }),
    ).toBeEnabled();
    expect(
      screen.getByRole('link', { name: /fill manually/i }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /mark as submitted/i }),
    );
    await waitFor(() => {
      expect(screen.getByText('Submitted')).toBeInTheDocument();
    });
  }, 30000);

  it('regenerates AI-drafted answers', async () => {
    const user = userEvent.setup();
    renderReview(routePaths.applyRun('1'));
    expect(
      await screen.findByDisplayValue(/Waymark's focus/),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /regenerate ai drafts/i }),
    );

    await expectMotivationRegenerated();
  });

  it('regenerates a single AI answer without losing unsaved edits', async () => {
    const user = userEvent.setup();
    renderReview(routePaths.applyRun('1'));
    await replaceEmail(user, 'draft@example.com');

    await user.click(
      screen.getByRole('button', { name: /regenerate this answer/i }),
    );

    await expectMotivationRegenerated();
    expect(screen.getByDisplayValue('draft@example.com')).toBeInTheDocument();
  });

  it('rejects a run', async () => {
    const user = userEvent.setup();
    renderReview(routePaths.applyRun('1'));
    await screen.findByDisplayValue('cassio@example.com');

    await user.click(screen.getByRole('button', { name: /^reject$/i }));
    await waitFor(() => {
      expect(screen.getByText('Skipped')).toBeInTheDocument();
    });
  });

  it('offers retry and manual fill for needs_human runs', async () => {
    renderReview(routePaths.applyRun('3'));
    expect(await screen.findByText(/captcha required/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: /fill manually/i }),
    ).toBeInTheDocument();
  });

  it('shows not-found for an invalid id', () => {
    renderReview('/apply/abc');
    expect(screen.getByText('Apply run not found.')).toBeInTheDocument();
  });
});
