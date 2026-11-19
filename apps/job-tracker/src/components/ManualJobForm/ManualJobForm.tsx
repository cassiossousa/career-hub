import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from '../../i18n/Provider';
import { isApiError } from '../../services/api/client';
import { useCreateJob } from '../../services/api/jobs';
import { JOB_AREAS, JOB_LEVELS, JOB_SOURCES } from '../../services/jobOptions';
import type { JobArea, JobLevel, JobSource } from '../../services/types/job';
import { useUIStore } from '../../store/uiStore';

const INITIAL_FORM = {
  url: '',
  title: '',
  company: '',
  location: '',
  area: 'frontend' as JobArea,
  level: 'mid' as JobLevel,
  description: '',
  source: 'manual' as JobSource,
  remote: false,
  salaryMin: '',
  salaryMax: '',
};

const FORM_ID = 'manual-job-form';

export function ManualJobForm() {
  const { messages } = useTranslation();
  const { isManualJobFormOpen, closeManualJobForm } = useUIStore();
  const { mutate: createJob, isPending } = useCreateJob();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    createJob(
      {
        source: formData.source,
        url: formData.url,
        title: formData.title,
        company: formData.company,
        location: formData.location,
        area: formData.area,
        level: formData.level,
        description: formData.description,
        remote: formData.remote,
        salaryMin: formData.salaryMin
          ? parseInt(formData.salaryMin, 10)
          : undefined,
        salaryMax: formData.salaryMax
          ? parseInt(formData.salaryMax, 10)
          : undefined,
      },
      {
        onSuccess: () => {
          closeManualJobForm();
          setFormData(INITIAL_FORM);
        },
        onError: (error) => {
          setSubmitError(
            isApiError(error) ? error.message : messages.common.error,
          );
        },
      },
    );
  };

  return (
    <Dialog
      open={isManualJobFormOpen}
      onClose={closeManualJobForm}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{messages.manualJobForm.title}</DialogTitle>
      <DialogContent>
        <form id={FORM_ID} onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField
              label={messages.manualJobForm.url}
              type="url"
              value={formData.url}
              onChange={(e) => {
                setFormData({ ...formData, url: e.target.value });
              }}
              required
              fullWidth
              helperText={messages.manualJobForm.urlHint}
            />
            <TextField
              label={messages.manualJobForm.jobTitle}
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
              }}
              required
              fullWidth
            />
            <TextField
              label={messages.manualJobForm.company}
              value={formData.company}
              onChange={(e) => {
                setFormData({ ...formData, company: e.target.value });
              }}
              required
              fullWidth
            />
            <TextField
              label={messages.manualJobForm.location}
              value={formData.location}
              onChange={(e) => {
                setFormData({ ...formData, location: e.target.value });
              }}
              required
              fullWidth
            />
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>{messages.dashboard.filterBar.area}</InputLabel>
                <Select
                  value={formData.area}
                  label={messages.dashboard.filterBar.area}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      area: e.target.value,
                    });
                  }}
                >
                  {JOB_AREAS.map((a) => (
                    <MenuItem key={a} value={a}>
                      {messages.jobs.areas[a]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>{messages.dashboard.filterBar.level}</InputLabel>
                <Select
                  value={formData.level}
                  label={messages.dashboard.filterBar.level}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      level: e.target.value,
                    });
                  }}
                >
                  {JOB_LEVELS.map((l) => (
                    <MenuItem key={l} value={l}>
                      {messages.jobs.levels[l]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>{messages.manualJobForm.source}</InputLabel>
              <Select
                value={formData.source}
                label={messages.manualJobForm.source}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    source: e.target.value,
                  });
                }}
              >
                {JOB_SOURCES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {messages.jobs.sources[s]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={messages.manualJobForm.description}
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
              }}
              required
              fullWidth
              multiline
              rows={4}
            />
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
              <TextField
                label={messages.manualJobForm.salaryMin}
                type="number"
                value={formData.salaryMin}
                onChange={(e) => {
                  setFormData({ ...formData, salaryMin: e.target.value });
                }}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label={messages.manualJobForm.salaryMax}
                type="number"
                value={formData.salaryMax}
                onChange={(e) => {
                  setFormData({ ...formData, salaryMax: e.target.value });
                }}
                sx={{ minWidth: 150 }}
              />
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.remote}
                  onChange={(e) => {
                    setFormData({ ...formData, remote: e.target.checked });
                  }}
                />
              }
              label={messages.manualJobForm.remote}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeManualJobForm}>{messages.common.cancel}</Button>
        <Button
          type="submit"
          form={FORM_ID}
          variant="contained"
          disabled={isPending}
        >
          {isPending
            ? messages.manualJobForm.submitting
            : messages.manualJobForm.submit}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
