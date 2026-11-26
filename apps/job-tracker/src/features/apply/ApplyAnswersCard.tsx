import { Card, CardContent, Stack, Typography } from '@mui/material';
import { useTranslation } from '../../i18n/Provider';
import type { ApplyRun } from '../../services/types/applyRun';
import { ApplyFieldGroups } from './ApplyFieldGroups';

interface ApplyAnswersCardProps {
  run: ApplyRun;
  draft: Record<string, string>;
  disabled: boolean;
  onChange: (key: string, value: string) => void;
}

export function ApplyAnswersCard({
  run,
  draft,
  disabled,
  onChange,
}: ApplyAnswersCardProps) {
  const { messages } = useTranslation();
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            {messages.apply.review.answersTitle}
          </Typography>
          <ApplyFieldGroups
            run={run}
            draft={draft}
            disabled={disabled}
            onChange={onChange}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
