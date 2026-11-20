import { TextField } from '@mui/material';
import { useState } from 'react';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { interpolate } from '../../i18n/interpolate';
import { useTranslation } from '../../i18n/Provider';
import {
  type ApplicationStatus,
  TERMINAL_APPLICATION_STATUSES,
} from '../../services/types/application';

interface AdvanceApplicationDialogProps {
  open: boolean;
  title: string;
  target: ApplicationStatus;
  onConfirm: (reason: string | undefined) => void;
  onCancel: () => void;
}

export function AdvanceApplicationDialog({
  open,
  title,
  target,
  onConfirm,
  onCancel,
}: AdvanceApplicationDialogProps) {
  const { messages } = useTranslation();
  const [reason, setReason] = useState('');
  const needsReason = TERMINAL_APPLICATION_STATUSES.has(target);
  const statusLabel = messages.applications.status[target];

  return (
    <ConfirmDialog
      open={open}
      title={messages.applications.advanceConfirmTitle}
      body={interpolate(messages.applications.advanceConfirmBody, {
        title,
        status: statusLabel,
      })}
      confirmLabel={messages.common.next}
      cancelLabel={messages.common.cancel}
      danger={needsReason}
      onConfirm={() => {
        onConfirm(reason.trim() === '' ? undefined : reason.trim());
        setReason('');
      }}
      onCancel={() => {
        setReason('');
        onCancel();
      }}
    >
      {needsReason && (
        <TextField
          fullWidth
          size="small"
          label={messages.applications.reasonLabel}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
          }}
          sx={{ mt: 2 }}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />
      )}
    </ConfirmDialog>
  );
}
