import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from '../../i18n/Provider';
import type {
  ApplyFormField,
  ProposedAnswer,
} from '../../services/types/applyRun';

interface ApplyAnswerFieldProps {
  field: ApplyFormField;
  value: string;
  proposed: ProposedAnswer | undefined;
  disabled: boolean;
  onChange: (key: string, value: string) => void;
  onRedraft: ((key: string) => void) | undefined;
}

export function ApplyAnswerField({
  field,
  value,
  proposed,
  disabled,
  onChange,
  onRedraft,
}: ApplyAnswerFieldProps) {
  const { messages } = useTranslation();
  const label = `${field.label}${field.required ? ` (${messages.apply.review.required})` : ` (${messages.apply.review.optional})`}`;

  return (
    <Stack spacing={0.5}>
      {field.kind === 'file' ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Chip
            size="small"
            variant="outlined"
            label={value === '' ? '—' : value}
            disabled={disabled}
          />
        </Stack>
      ) : field.kind === 'select' && field.options.length > 0 ? (
        <TextField
          select
          size="small"
          label={label}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(field.key, e.target.value);
          }}
        >
          <MenuItem value="">
            <em>{messages.apply.sources.none}</em>
          </MenuItem>
          {field.options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <TextField
          size="small"
          label={label}
          value={value}
          disabled={disabled}
          multiline={field.kind === 'textarea'}
          minRows={field.kind === 'textarea' ? 3 : undefined}
          onChange={(e) => {
            onChange(field.key, e.target.value);
          }}
        />
      )}
      {proposed !== undefined && proposed.source !== 'manual' && (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ flexGrow: 1 }}
          >
            {messages.apply.sources[proposed.source]} ·{' '}
            {Math.round(proposed.confidence * 100)}%
          </Typography>
          {proposed.source === 'ai' && onRedraft !== undefined && (
            <IconButton
              size="small"
              aria-label={`${messages.apply.review.redraftField}: ${field.label}`}
              title={messages.apply.review.redraftField}
              disabled={disabled}
              onClick={() => {
                onRedraft(field.key);
              }}
              sx={{ p: 0.25 }}
            >
              <RefreshIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Stack>
      )}
    </Stack>
  );
}
