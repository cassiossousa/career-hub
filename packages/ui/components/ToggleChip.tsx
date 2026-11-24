import { Chip } from '@mui/material';

export interface ToggleChipProps {
  label: string;
  active: boolean;
  onToggle: () => void;
}

export function ToggleChip({ label, active, onToggle }: ToggleChipProps) {
  return (
    <Chip
      label={label}
      size="small"
      variant={active ? 'filled' : 'outlined'}
      color={active ? 'primary' : 'default'}
      clickable
      aria-pressed={active}
      onClick={onToggle}
    />
  );
}
