import { Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
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
}

export function ApplyAnswerField({
  field,
  value,
  proposed,
  disabled,
  onChange,
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
        <Typography variant="caption" color="text.secondary">
          {messages.apply.sources[proposed.source]} ·{' '}
          {Math.round(proposed.confidence * 100)}%
        </Typography>
      )}
    </Stack>
  );
}
