import { Card, CardContent, Stack, Typography } from '@mui/material';
import { useTranslation } from '../../i18n/Provider';
import {
  groupFieldsBySection,
  missingRequiredFields,
} from '../../services/applyReview';
import type { ApplyRun } from '../../services/types/applyRun';
import { ApplyAnswerField } from './ApplyAnswerField';

export interface ApplyFieldGroupsProps {
  run: ApplyRun;
  draft: Record<string, string>;
  disabled: boolean;
  onChange: (key: string, value: string) => void;
  onRedraftField: ((key: string) => void) | undefined;
}

export function ApplyFieldGroups({
  run,
  draft,
  disabled,
  onChange,
  onRedraftField,
}: ApplyFieldGroupsProps) {
  const { messages } = useTranslation();
  const missing = new Set(missingRequiredFields(run).map((f) => f.key));
  const groups = groupFieldsBySection(run.formFields);

  if (groups.length === 0) {
    return (
      <Typography color="text.secondary">
        {messages.apply.review.noFields}
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {groups.map((group) => (
        <Card key={group.section ?? '__none__'} variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography component="h3" variant="subtitle1">
                {group.section ?? messages.apply.review.uncategorized}
              </Typography>
              {group.fields.map((field) => (
                <Stack key={field.key} spacing={0.25}>
                  <ApplyAnswerField
                    field={field}
                    value={draft[field.key] ?? ''}
                    proposed={run.proposedAnswers[field.key]}
                    disabled={disabled}
                    onChange={onChange}
                    onRedraft={onRedraftField}
                  />
                  {missing.has(field.key) && (
                    <Typography variant="caption" color="warning.main">
                      {messages.apply.review.required}
                    </Typography>
                  )}
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
