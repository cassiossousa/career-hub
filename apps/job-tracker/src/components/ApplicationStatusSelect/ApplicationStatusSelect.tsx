import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SxProps,
  type Theme,
} from '@mui/material';
import { useId } from 'react';
import { useTranslation } from '../../i18n/Provider';
import {
  APPLICATION_STATUS_ORDER,
  type ApplicationStatus,
} from '../../services/types/application';

interface ApplicationStatusSelectProps {
  value: ApplicationStatus;
  onChange: (status: ApplicationStatus) => void;
  disabled?: boolean | undefined;
  sx?: SxProps<Theme> | undefined;
}

export function ApplicationStatusSelect({
  value,
  onChange,
  disabled,
  sx,
}: ApplicationStatusSelectProps) {
  const { messages } = useTranslation();
  const labelId = useId();
  return (
    <FormControl size="small" sx={sx ?? { minWidth: 140 }}>
      <InputLabel id={labelId}>{messages.applications.statusLabel}</InputLabel>
      <Select
        labelId={labelId}
        label={messages.applications.statusLabel}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      >
        {APPLICATION_STATUS_ORDER.map((status) => (
          <MenuItem key={status} value={status}>
            {messages.applications.status[status]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
