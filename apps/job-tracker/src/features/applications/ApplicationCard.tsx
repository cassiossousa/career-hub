import {
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '../../app/routePaths';
import { ApplicationStatusChip } from '../../components/ApplicationStatusChip/ApplicationStatusChip';
import { useTranslation } from '../../i18n/Provider';
import { useUpdateApplication } from '../../services/api/applications';
import {
  APPLICATION_STATUS_ORDER,
  type Application,
  type ApplicationStatus,
  NEXT_APPLICATION_STATUS,
} from '../../services/types/application';

interface ApplicationCardProps {
  application: Application;
  title: string;
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
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <ApplicationStatusChip status={application.status} />
                {application.appliedAt && (
                  <Typography variant="caption" color="text.secondary">
                    {messages.applications.appliedAt}:{' '}
                    {new Date(application.appliedAt).toLocaleDateString(locale)}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {messages.applications.statusChangedAt}:{' '}
                  {new Date(application.statusChangedAt).toLocaleDateString(
                    locale,
                  )}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {editingNotes ? (
            <Stack spacing={1}>
              <TextField
                multiline
                minRows={2}
                size="small"
                label={messages.applications.notes}
                value={notesDraft}
                onChange={(e) => {
                  setNotesDraft(e.target.value);
                }}
                slotProps={{ htmlInput: { maxLength: 2000 } }}
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
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>{messages.applications.statusLabel}</InputLabel>
              <Select
                label={messages.applications.statusLabel}
                value={application.status}
                onChange={(e) => {
                  onRequestAdvance(application, e.target.value);
                }}
              >
                {APPLICATION_STATUS_ORDER.map((status) => (
                  <MenuItem key={status} value={status}>
                    {messages.applications.status[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
                void navigate(
                  routePaths.applicationDetail(application.id.toString()),
                );
              }}
            >
              {messages.applications.resume}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
