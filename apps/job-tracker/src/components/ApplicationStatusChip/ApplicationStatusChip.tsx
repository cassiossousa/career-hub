import { Chip } from '@mui/material';
import { useTranslation } from '../../i18n/Provider';
import type { ApplicationStatus } from '../../services/types/application';

const APPLICATION_STATUS_COLORS: Record<
  ApplicationStatus,
  'default' | 'info' | 'primary' | 'warning' | 'success' | 'error'
> = {
  saved: 'default',
  applied: 'info',
  screening: 'primary',
  interview: 'warning',
  offer: 'success',
  rejected: 'error',
  withdrawn: 'default',
};

export function ApplicationStatusChip({
  status,
}: {
  status: ApplicationStatus;
}) {
  const { messages } = useTranslation();
  return (
    <Chip
      label={messages.applications.status[status]}
      color={APPLICATION_STATUS_COLORS[status]}
      size="small"
    />
  );
}
