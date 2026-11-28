import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { IconButton, Stack, Typography } from '@mui/material';
import { useClipboard } from '../../app/useClipboard';
import { useTranslation } from '../../i18n/Provider';
import type {
  ApplyFormField,
  ProposedAnswer,
} from '../../services/types/applyRun';

interface ApplyAnswerActionsProps {
  field: ApplyFormField;
  value: string;
  proposed: ProposedAnswer;
  disabled: boolean;
  onRedraft: ((key: string) => void) | undefined;
}

/** Source/confidence caption plus copy and AI-regenerate actions. */
export function ApplyAnswerActions({
  field,
  value,
  proposed,
  disabled,
  onRedraft,
}: ApplyAnswerActionsProps) {
  const { messages } = useTranslation();
  const { copy, copied } = useClipboard();

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
        {messages.apply.sources[proposed.source]} ·{' '}
        {Math.round(proposed.confidence * 100)}%
      </Typography>
      {value.trim() !== '' && field.kind !== 'file' && (
        <IconButton
          size="small"
          aria-label={`${messages.apply.review.copy}: ${field.label}`}
          title={messages.apply.review.copy}
          onClick={() => {
            copy(value);
          }}
          sx={{ p: 0.25 }}
        >
          {copied ? (
            <CheckIcon sx={{ fontSize: 14 }} />
          ) : (
            <ContentCopyIcon sx={{ fontSize: 14 }} />
          )}
        </IconButton>
      )}
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
  );
}
