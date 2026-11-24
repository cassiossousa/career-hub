import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
} from '@mui/material';

export interface OptionGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  selected: T[];
  optionLabel: (option: T) => string;
  onChange: (next: T[]) => void;
}

export function OptionGroup<T extends string>({
  label,
  options,
  selected,
  optionLabel,
  onChange,
}: OptionGroupProps<T>) {
  const toggle = (option: T) => {
    onChange(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
    );
  };

  return (
    <FormControl component="fieldset" variant="standard">
      <FormLabel component="legend" sx={{ mb: 0.5 }}>
        {label}
      </FormLabel>
      <FormGroup row sx={{ flexWrap: 'wrap' }}>
        {options.map((option) => (
          <FormControlLabel
            key={option}
            control={
              <Checkbox
                size="small"
                checked={selected.includes(option)}
                onChange={() => {
                  toggle(option);
                }}
              />
            }
            label={optionLabel(option)}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
}
