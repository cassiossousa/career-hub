import { Alert, Button, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import type { FormFeedback } from '../../app/useDocumentDraft';
import type { useUnsavedChangesGuard } from '../../app/useUnsavedChangesGuard';
import { FormCard } from '../../components/FormCard/FormCard';
import { UnsavedChangesDialog } from '../../components/UnsavedChangesDialog/UnsavedChangesDialog';
import { useTranslation } from '../../i18n/Provider';

type NavigationBlocker = ReturnType<typeof useUnsavedChangesGuard>;

interface SkillEditorFormProps {
  title: string;
  description?: string;
  saveLabel: string;
  feedback: FormFeedback | null;
  dirty: boolean;
  isSaving: boolean;
  blocker: NavigationBlocker;
  onSubmit: (event: React.FormEvent) => void;
  children: ReactNode;
}

export function SkillEditorForm({
  title,
  description,
  saveLabel,
  feedback,
  dirty,
  isSaving,
  blocker,
  onSubmit,
  children,
}: SkillEditorFormProps) {
  const { messages } = useTranslation();
  return (
    <FormCard onSubmit={onSubmit}>
      <Stack spacing={1}>
        <Typography variant="subtitle1">{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        {feedback && <Alert severity={feedback.type}>{feedback.text}</Alert>}
        {children}
        <Button
          type="submit"
          variant="contained"
          disabled={isSaving || !dirty}
          sx={{ alignSelf: 'flex-start' }}
        >
          {isSaving ? messages.common.saving : saveLabel}
        </Button>
        <UnsavedChangesDialog blocker={blocker} />
      </Stack>
    </FormCard>
  );
}
