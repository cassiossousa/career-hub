import { OptionGroup } from '@career-hub/ui/components';
import {
  Alert,
  Button,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { saveFeedbackOptions } from '../../app/saveFeedback';
import type { FormFeedback } from '../../app/useDocumentDraft';
import { useUnsavedChangesGuard } from '../../app/useUnsavedChangesGuard';
import { FormCard } from '../../components/FormCard/FormCard';
import { UnsavedChangesDialog } from '../../components/UnsavedChangesDialog/UnsavedChangesDialog';
import { useTranslation } from '../../i18n/Provider';
import { useUpsertPortfolio } from '../../services/api/portfolio';
import { JOB_AREAS, JOB_LEVELS } from '../../services/jobOptions';
import type {
  PortfolioContent,
  PortfolioFilters,
} from '../../services/types/portfolio';

interface FiltersFormProps {
  locale: string;
  content: PortfolioContent;
  filters: PortfolioFilters;
}

function parseLocations(text: string): string[] {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function FiltersForm({ locale, content, filters }: FiltersFormProps) {
  const { messages } = useTranslation();
  const { mutate: upsertPortfolio, isPending } = useUpsertPortfolio();
  const [draft, setDraft] = useState<PortfolioFilters>(filters);
  const [locationsText, setLocationsText] = useState(
    filters.locations.join(', '),
  );
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  const locationsDirty = locationsText !== filters.locations.join(', ');
  const dirty =
    JSON.stringify(draft) !== JSON.stringify(filters) || locationsDirty;
  const blocker = useUnsavedChangesGuard(dirty);

  const t = messages.settings;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const next: PortfolioFilters = {
      ...draft,
      locations: parseLocations(locationsText),
    };
    upsertPortfolio(
      { locale, ...content, filters: next },
      saveFeedbackOptions({
        savedText: messages.common.saved,
        setFeedback,
        onSaved: () => {
          setDraft(next);
          setLocationsText(next.locations.join(', '));
        },
      }),
    );
  };

  return (
    <FormCard onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">{t.filtersTitle}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t.filtersDescription}
          </Typography>
        </Stack>
        {feedback && <Alert severity={feedback.type}>{feedback.text}</Alert>}
        <OptionGroup
          label={t.levels}
          options={JOB_LEVELS}
          selected={draft.levels}
          optionLabel={(level) => messages.jobs.levels[level]}
          onChange={(levels) => {
            setDraft({ ...draft, levels });
          }}
        />
        <OptionGroup
          label={t.areas}
          options={JOB_AREAS}
          selected={draft.areas}
          optionLabel={(area) => messages.jobs.areas[area]}
          onChange={(areas) => {
            setDraft({ ...draft, areas });
          }}
        />
        <TextField
          label={t.locations}
          value={locationsText}
          onChange={(e) => {
            setLocationsText(e.target.value);
          }}
          size="small"
          fullWidth
          helperText={t.locationsHint}
        />
        <FormControlLabel
          control={
            <Switch
              checked={draft.remoteOnly}
              onChange={(e) => {
                setDraft({ ...draft, remoteOnly: e.target.checked });
              }}
            />
          }
          label={t.remoteOnly}
        />
        <Button type="submit" variant="contained" disabled={isPending}>
          {isPending ? messages.common.saving : messages.common.save}
        </Button>
      </Stack>
      <UnsavedChangesDialog blocker={blocker} />
    </FormCard>
  );
}
