import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import {
  LoadingState,
  QueryErrorAlert,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import {
  useCoverLetter,
  useDeleteCoverLetter,
  useUpsertCoverLetter,
} from '../../services/api/coverLetters';
import type { Application } from '../../services/types/application';
import type { CoverLetter } from '../../services/types/coverLetter';
import { LOCALES } from '../../types/i18n';

export function HubCoverLetter({ application }: { application: Application }) {
  const { messages } = useTranslation();
  const letterQuery = useCoverLetter(application.id);
  const upsertMutation = useUpsertCoverLetter(application.id);
  const deleteMutation = useDeleteCoverLetter(application.id);

  if (letterQuery.isLoading) {
    return <LoadingState label={messages.common.loading} />;
  }
  if (letterQuery.isError) {
    return (
      <QueryErrorAlert
        error={letterQuery.error}
        subject={messages.applicationHub.tabs.coverLetter}
        onRetry={() => {
          void letterQuery.refetch();
        }}
      />
    );
  }

  return (
    <CoverLetterForm
      key={letterQuery.data?.id ?? 'new'}
      initial={letterQuery.data ?? null}
      upsertMutation={upsertMutation}
      deleteMutation={deleteMutation}
    />
  );
}

interface CoverLetterFormProps {
  initial: CoverLetter | null;
  upsertMutation: ReturnType<typeof useUpsertCoverLetter>;
  deleteMutation: ReturnType<typeof useDeleteCoverLetter>;
}

function CoverLetterForm({
  initial,
  upsertMutation,
  deleteMutation,
}: CoverLetterFormProps) {
  const { locale, messages } = useTranslation();
  const [localeDraft, setLocaleDraft] = useState(initial?.locale ?? locale);
  const [subjectDraft, setSubjectDraft] = useState(initial?.subject ?? '');
  const [bodyDraft, setBodyDraft] = useState(initial?.bodyText ?? '');
  const [bodyError, setBodyError] = useState(false);

  const save = () => {
    if (bodyDraft.trim() === '') {
      setBodyError(true);
      return;
    }
    setBodyError(false);
    upsertMutation.mutate({
      locale: localeDraft,
      subject: subjectDraft.trim() === '' ? null : subjectDraft.trim(),
      bodyText: bodyDraft,
    });
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 720 }}>
      {initial === null && (
        <Typography variant="body2" color="text.secondary">
          {messages.applicationHub.coverLetter.empty}
        </Typography>
      )}
      <FormControl size="small" sx={{ maxWidth: 200 }}>
        <InputLabel>{messages.applicationHub.coverLetter.locale}</InputLabel>
        <Select
          label={messages.applicationHub.coverLetter.locale}
          value={localeDraft}
          onChange={(e) => {
            setLocaleDraft(e.target.value);
          }}
        >
          {LOCALES.map((option) => (
            <MenuItem key={option} value={option}>
              {messages.common.locales[option]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        size="small"
        label={messages.applicationHub.coverLetter.subject}
        value={subjectDraft}
        onChange={(e) => {
          setSubjectDraft(e.target.value);
        }}
      />
      <TextField
        multiline
        minRows={10}
        label={messages.applicationHub.coverLetter.body}
        value={bodyDraft}
        onChange={(e) => {
          setBodyDraft(e.target.value);
        }}
        error={bodyError}
        helperText={
          bodyError ? messages.applicationHub.coverLetter.bodyRequired : ''
        }
      />
      <Stack direction="row" sx={{ gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          disabled={upsertMutation.isPending}
          onClick={save}
        >
          {messages.applicationHub.coverLetter.save}
        </Button>
        {initial !== null && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            disabled={deleteMutation.isPending}
            onClick={() => {
              deleteMutation.mutate();
            }}
          >
            {messages.applicationHub.coverLetter.delete}
          </Button>
        )}
      </Stack>
      {upsertMutation.isSuccess && (
        <Alert severity="success">{messages.common.saved}</Alert>
      )}
      {upsertMutation.isError && (
        <Alert severity="error">{messages.common.error}</Alert>
      )}
    </Stack>
  );
}
