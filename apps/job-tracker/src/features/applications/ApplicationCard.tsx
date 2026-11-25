import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplicationStatusChip } from '../../components/ApplicationStatusChip/ApplicationStatusChip';
import { ApplicationStatusSelect } from '../../components/ApplicationStatusSelect/ApplicationStatusSelect';
import { interpolate } from '../../i18n/interpolate';
import { useTranslation } from '../../i18n/Provider';
import { useUpdateApplication } from '../../services/api/applications';
import {
  daysInCurrentStatus,
  isQuietApplication,
} from '../../services/applicationStaleness';
import {
  type Application,
  type ApplicationStatus,
  NEXT_APPLICATION_STATUS,
  TERMINAL_APPLICATION_STATUSES,
} from '../../services/types/application';
import { applicationDetailPath, JobDetailLink } from './EntityLinks';
import { NotesTextField } from './NotesTextField';

const renderedAtMs = Date.now();

interface ApplicationCardProps {
  application: Application;
  title: string;
  company: string | null;
  selected: boolean;
  onToggleSelect: (id: number) => void;
  onRequestAdvance: (
    application: Application,
    target: ApplicationStatus,
  ) => void;
}

export function ApplicationCard({
  application,
  title,
  company,
  selected,
  onToggleSelect,
  onRequestAdvance,
}: ApplicationCardProps) {
  const { messages, locale } = useTranslation();
  const navigate = useNavigate();
  const updateMutation = useUpdateApplication();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(application.notes ?? '');

  const nextStatus = NEXT_APPLICATION_STATUS[application.status];

  const saveNotes = () => {
    const trimmed = notesDraft.trim();
    updateMutation.mutate({
      id: application.id,
      data: { notes: trimmed === '' ? null : trimmed },
    });
    setEditingNotes(false);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1 }}>
            <Checkbox
              checked={selected}
              onChange={() => {
                onToggleSelect(application.id);
              }}
              slotProps={{
                input: { 'aria-label': `Select ${title}` },
              }}
              sx={{ p: 0, mt: -0.5 }}
            />
            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
              <Typography component="h3" variant="h6" noWrap>
                {title}
              </Typography>
              {company !== null && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  <JobDetailLink
                    jobId={application.jobId}
                    variant="body2"
                    color="text.secondary"
                  >
                    {company}
                  </JobDetailLink>
                </Typography>
              )}
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <ApplicationStatusChip status={application.status} />
                {application.appliedAt && (
                  <Typography variant="caption" color="text.secondary">
                    {messages.applications.appliedAt}:{' '}
                    {new Date(application.appliedAt).toLocaleDateString(locale)}
                  </Typography>
                )}
                {application.followUpAt != null && (
                  <Typography
                    variant="caption"
                    color={
                      new Date(application.followUpAt).getTime() <=
                        renderedAtMs &&
                      !TERMINAL_APPLICATION_STATUSES.has(application.status)
                        ? 'warning.main'
                        : 'text.secondary'
                    }
                  >
                    {messages.applications.followUp}:{' '}
                    {new Date(application.followUpAt).toLocaleDateString(
                      locale,
                    )}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {messages.applications.statusChangedAt}:{' '}
                  {new Date(application.statusChangedAt).toLocaleDateString(
                    locale,
                  )}
                </Typography>
                {isQuietApplication(application) && (
                  <Typography variant="caption" color="warning.main">
                    {interpolate(messages.applications.quietDays, {
                      days: String(daysInCurrentStatus(application)),
                    })}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Stack>

          {editingNotes ? (
            <Stack spacing={1}>
              <NotesTextField
                minRows={2}
                label={messages.applications.notes}
                value={notesDraft}
                onChange={setNotesDraft}
              />
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" onClick={saveNotes}>
                  {messages.common.save}
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setNotesDraft(application.notes ?? '');
                    setEditingNotes(false);
                  }}
                >
                  {messages.common.cancel}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <>
              {application.notes && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: 'pre-wrap' }}
                >
                  {application.notes}
                </Typography>
              )}
              <Button
                size="small"
                sx={{ alignSelf: 'flex-start', px: 0, minWidth: 0 }}
                onClick={() => {
                  setNotesDraft(application.notes ?? '');
                  setEditingNotes(true);
                }}
              >
                {application.notes ? messages.common.edit : messages.common.add}
              </Button>
            </>
          )}

          <Stack
            direction="row"
            sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
          >
            <ApplicationStatusSelect
              value={application.status}
              onChange={(status) => {
                onRequestAdvance(application, status);
              }}
            />
            {nextStatus && (
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  onRequestAdvance(application, nextStatus);
                }}
              >
                → {messages.applications.status[nextStatus]}
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              sx={{ marginInlineStart: 'auto' }}
              onClick={() => {
                void navigate(applicationDetailPath(application.id));
              }}
            >
              {messages.applications.viewApplication}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
