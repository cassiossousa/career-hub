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
import { useId, useState } from 'react';
import { useTranslation } from '../../i18n/Provider';
import { isApiError } from '../../services/api/client';
import { useCreateJob, useJobs } from '../../services/api/jobs';
import {
  JOB_AREAS,
  JOB_LEVELS,
  JOB_SOURCES,
  type JobArea,
  type JobLevel,
  type JobSource,
} from '../../services/types/job';
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
  const jobsQuery = useJobs();
  const areaLabelId = useId();
  const levelLabelId = useId();
  const sourceLabelId = useId();

  const salaryMin = formData.salaryMin ? Number(formData.salaryMin) : null;
  const salaryMax = formData.salaryMax ? Number(formData.salaryMax) : null;
  const salaryInvalid =
    salaryMin !== null && salaryMax !== null && salaryMin > salaryMax;

  const normalizedTitle = formData.title.trim().toLowerCase();
  const normalizedCompany = formData.company.trim().toLowerCase();
  const hasDuplicate =
    normalizedTitle !== '' &&
    normalizedCompany !== '' &&
    (jobsQuery.data?.jobs ?? []).some(
      (job) =>
        job.title.trim().toLowerCase() === normalizedTitle &&
        job.company.trim().toLowerCase() === normalizedCompany,
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (salaryInvalid) return;
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
            {hasDuplicate && (
              <Alert severity="warning">
                {messages.manualJobForm.duplicateWarning}
              </Alert>
            )}
            <TextField
              label={messages.manualJobForm.url}
              type="url"
              autoComplete="url"
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
              autoComplete="organization-title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
              }}
              required
              fullWidth
            />
            <TextField
              label={messages.manualJobForm.company}
              autoComplete="organization"
              value={formData.company}
              onChange={(e) => {
                setFormData({ ...formData, company: e.target.value });
              }}
              required
              fullWidth
            />
            <TextField
              label={messages.manualJobForm.location}
              autoComplete="address-level2"
              value={formData.location}
              onChange={(e) => {
                setFormData({ ...formData, location: e.target.value });
              }}
              required
              fullWidth
            />
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id={areaLabelId}>
                  {messages.dashboard.filterBar.area}
                </InputLabel>
                <Select
                  labelId={areaLabelId}
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
                <InputLabel id={levelLabelId}>
                  {messages.dashboard.filterBar.level}
                </InputLabel>
                <Select
                  labelId={levelLabelId}
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
              <InputLabel id={sourceLabelId}>
                {messages.manualJobForm.source}
              </InputLabel>
              <Select
                labelId={sourceLabelId}
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
                slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label={messages.manualJobForm.salaryMax}
                type="number"
                value={formData.salaryMax}
                onChange={(e) => {
                  setFormData({ ...formData, salaryMax: e.target.value });
                }}
                error={salaryInvalid}
                helperText={
                  salaryInvalid ? messages.manualJobForm.salaryOrder : undefined
                }
                slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }}
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
          disabled={isPending || salaryInvalid}
        >
          {isPending
            ? messages.manualJobForm.submitting
            : messages.manualJobForm.submit}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
