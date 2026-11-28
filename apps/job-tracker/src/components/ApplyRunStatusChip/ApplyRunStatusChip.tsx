import { Chip } from '@mui/material';
import { useTranslation } from '../../i18n/Provider';
import type { ApplyRunStatus } from '../../services/types/applyRun';

const APPLY_STATUS_COLORS: Record<
  ApplyRunStatus,
  'default' | 'info' | 'primary' | 'warning' | 'success' | 'error'
> = {
  queued: 'default',
  inspecting: 'info',
  ready_for_review: 'primary',
  approved: 'primary',
  submitted: 'success',
  failed: 'error',
  skipped: 'default',
  needs_human: 'warning',
};

export function ApplyRunStatusChip({ status }: { status: ApplyRunStatus }) {
  const { messages } = useTranslation();
  return (
    <Chip
      label={messages.apply.status[status]}
      color={APPLY_STATUS_COLORS[status]}
      size="small"
      variant="outlined"
    />
  );
}
