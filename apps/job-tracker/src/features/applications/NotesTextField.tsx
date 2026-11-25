import { TextField } from '@mui/material';

interface NotesTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minRows?: number | undefined;
}

/** Multiline notes input shared by application cards, overview, and hub forms. */
export function NotesTextField({
  label,
  value,
  onChange,
  minRows = 2,
}: NotesTextFieldProps) {
  return (
    <TextField
      multiline
      minRows={minRows}
      size="small"
      label={label}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      slotProps={{ htmlInput: { maxLength: 2000 } }}
    />
  );
}
