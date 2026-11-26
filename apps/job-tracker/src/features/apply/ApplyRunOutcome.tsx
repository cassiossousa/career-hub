import { Typography } from '@mui/material';
import { useTranslation } from '../../i18n/Provider';
import type { ApplyRun } from '../../services/types/applyRun';

export function ApplyRunOutcome({ run }: { run: ApplyRun }) {
  const { locale, messages } = useTranslation();
  if (run.submittedAt === null && run.result === null) return null;
  return (
    <>
      {run.submittedAt !== null && (
        <Typography variant="body2" color="text.secondary">
          {messages.apply.review.submittedAt}:{' '}
          {new Date(run.submittedAt).toLocaleString(locale)}
        </Typography>
      )}
      {run.result !== null && (
        <Typography variant="body2" color="text.secondary">
          {messages.apply.review.result}: {JSON.stringify(run.result)}
        </Typography>
      )}
    </>
  );
}
