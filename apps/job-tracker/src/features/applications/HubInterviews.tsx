import { Chip, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { EmptyState } from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';
import {
  useCreateInterview,
  useDeleteInterview,
  useInterviews,
} from '../../services/api/interviews';
import type { Application } from '../../services/types/application';
import {
  INTERVIEW_MODES,
  INTERVIEW_OUTCOMES,
  type Interview,
  type InterviewCreate,
  type InterviewMode,
  type InterviewOutcome,
} from '../../services/types/interview';
import {
  AddItemButton,
  EnumSelectField,
  FieldRow,
  ItemCard,
  ItemDeleteButton,
  ItemHeader,
  joinedMeta,
  MetaText,
  MutationFormActions,
  PanelGate,
} from './HubUi';
import { NotesTextField } from './NotesTextField';

export function HubInterviews({ application }: { application: Application }) {
  const { messages } = useTranslation();
  const interviewsQuery = useInterviews(application.id);
  const createMutation = useCreateInterview(application.id);
  const [showForm, setShowForm] = useState(false);

  return (
    <PanelGate
      query={interviewsQuery}
      subject={messages.applicationHub.tabs.interviews}
    >
      {(page) => {
        const interviews = page.interviews.toSorted(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime(),
        );
        return (
          <Stack spacing={2} sx={{ maxWidth: 720 }}>
            {interviews.length === 0 && !showForm && (
              <EmptyState title={messages.applicationHub.interviews.empty} />
            )}
            {interviews.map((interview) => (
              <InterviewRow
                key={interview.id}
                interview={interview}
                applicationId={application.id}
              />
            ))}
            {showForm ? (
              <InterviewForm
                createMutation={createMutation}
                onDone={() => {
                  setShowForm(false);
                }}
              />
            ) : (
              <AddItemButton
                label={messages.applicationHub.interviews.add}
                onClick={() => {
                  setShowForm(true);
                }}
              />
            )}
          </Stack>
        );
      }}
    </PanelGate>
  );
}

function InterviewRow({
  interview,
  applicationId,
}: {
  interview: Interview;
  applicationId: number;
}) {
  const { locale, messages } = useTranslation();
  const t = messages.applicationHub.interviews;
  const deleteMutation = useDeleteInterview(applicationId);

  return (
    <ItemCard>
      <ItemHeader
        title={new Date(interview.scheduledAt).toLocaleString(locale)}
      >
        <Chip size="small" label={t.modes[interview.mode]} />
        <Chip
          size="small"
          color={interview.outcome === 'completed' ? 'success' : 'default'}
          label={t.outcomes[interview.outcome]}
        />
        <ItemDeleteButton
          label={t.delete}
          pending={deleteMutation.isPending}
          onClick={() => {
            deleteMutation.mutate(interview.id);
          }}
        />
      </ItemHeader>
      <MetaText
        text={joinedMeta([
          interview.roundLabel,
          interview.location,
          interview.durationMinutes === null
            ? null
            : `${interview.durationMinutes} ${t.minutes}`,
        ])}
      />
      {interview.notes !== null && interview.notes !== '' && (
        <Typography variant="body2">{interview.notes}</Typography>
      )}
    </ItemCard>
  );
}

interface InterviewFormProps {
  createMutation: ReturnType<typeof useCreateInterview>;
  onDone: () => void;
}

function InterviewForm({ createMutation, onDone }: InterviewFormProps) {
  const { messages } = useTranslation();
  const t = messages.applicationHub.interviews;
  const [scheduledAt, setScheduledAt] = useState('');
  const [mode, setMode] = useState<InterviewMode>('video');
  const [outcome, setOutcome] = useState<InterviewOutcome>('pending');
  const [roundLabel, setRoundLabel] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const durationMs = duration === '' ? null : Number.parseInt(duration, 10);
  const valid =
    scheduledAt !== '' &&
    (durationMs === null || (Number.isInteger(durationMs) && durationMs > 0));

  const submit = () => {
    if (!valid) return;
    const data: InterviewCreate = {
      scheduledAt: new Date(scheduledAt).toISOString(),
      mode,
      outcome,
    };
    if (durationMs !== null) data.durationMinutes = durationMs;
    if (roundLabel.trim() !== '') data.roundLabel = roundLabel.trim();
    if (location.trim() !== '') data.location = location.trim();
    if (notes.trim() !== '') data.notes = notes.trim();
    createMutation.mutate(data, { onSuccess: onDone });
  };

  return (
    <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
      <FieldRow>
        <TextField
          size="small"
          type="datetime-local"
          label={t.scheduledAt}
          value={scheduledAt}
          onChange={(e) => {
            setScheduledAt(e.target.value);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: 1 }}
        />
        <TextField
          size="small"
          type="number"
          label={`${t.duration} (${t.minutes})`}
          value={duration}
          onChange={(e) => {
            setDuration(e.target.value);
          }}
          sx={{ width: 160 }}
        />
      </FieldRow>
      <FieldRow>
        <EnumSelectField
          label={t.mode}
          value={mode}
          options={INTERVIEW_MODES}
          optionLabel={(option) => t.modes[option]}
          onChange={setMode}
        />
        <EnumSelectField
          label={t.outcome}
          value={outcome}
          options={INTERVIEW_OUTCOMES}
          optionLabel={(option) => t.outcomes[option]}
          onChange={setOutcome}
        />
      </FieldRow>
      <FieldRow>
        <TextField
          size="small"
          label={t.roundLabel}
          value={roundLabel}
          onChange={(e) => {
            setRoundLabel(e.target.value);
          }}
          sx={{ flex: 1 }}
        />
        <TextField
          size="small"
          label={t.location}
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
          }}
          sx={{ flex: 1 }}
        />
      </FieldRow>
      <NotesTextField label={t.notes} value={notes} onChange={setNotes} />
      <MutationFormActions
        mutation={createMutation}
        submitLabel={t.add}
        disabled={!valid}
        onSubmit={submit}
        onCancel={onDone}
      />
    </Stack>
  );
}
