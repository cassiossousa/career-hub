import {
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useId } from 'react';
import { useTranslation } from '../../i18n/Provider';
import { JOB_AREAS, JOB_LEVELS } from '../../services/jobOptions';
import { useFilterStore } from '../../store/filterStore';

const ageOptions = [
  { value: 1, key: 'oneDay' },
  { value: 7, key: 'sevenDays' },
  { value: 30, key: 'thirtyDays' },
  { value: 90, key: 'ninetyDays' },
] as const;

interface EnumSelectProps<T extends string> {
  label: string;
  allLabel: string;
  value: T | '';
  onChange: (value: T | undefined) => void;
  options: readonly T[];
  renderOption: (option: T) => string;
}

function EnumSelect<T extends string>({
  label,
  allLabel,
  value,
  onChange,
  options,
  renderOption,
}: EnumSelectProps<T>) {
  const labelId = useId();

  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={value}
        label={label}
        onChange={(e) => {
          onChange(e.target.value === '' ? undefined : (e.target.value as T));
        }}
      >
        <MenuItem value="">{allLabel}</MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {renderOption(option)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

interface NullableNumberSelectProps {
  label: string;
  allLabel: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  options: readonly { value: number; label: string }[];
  minWidth: number;
}

function NullableNumberSelect({
  label,
  allLabel,
  value,
  onChange,
  options,
  minWidth,
}: NullableNumberSelectProps) {
  const labelId = useId();

  return (
    <FormControl size="small" sx={{ minWidth }}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select<string | number>
        labelId={labelId}
        value={value ?? ''}
        label={label}
        onChange={(e) => {
          onChange(e.target.value === '' ? undefined : Number(e.target.value));
        }}
      >
        <MenuItem value="">{allLabel}</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export function FilterBar() {
  const { messages } = useTranslation();
  const {
    level,
    location,
    area,
    remoteOnly,
    maxAgeDays,
    preset,
    setLevel,
    setLocation,
    setArea,
    setRemoteOnly,
    setMaxAgeDays,
    setPreset,
    resetFilters,
  } = useFilterStore();

  const filterBar = messages.dashboard.filterBar;

  const ageLabels = {
    oneDay: filterBar.ageOptions.oneDay,
    sevenDays: filterBar.ageOptions.sevenDays,
    thirtyDays: filterBar.ageOptions.thirtyDays,
    ninetyDays: filterBar.ageOptions.ninetyDays,
  } as const;

  return (
    <Stack
      direction="row"
      sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'center' }}
    >
      <EnumSelect
        label={filterBar.level}
        allLabel={filterBar.allOption}
        value={level ?? ''}
        onChange={setLevel}
        options={JOB_LEVELS}
        renderOption={(l) => messages.jobs.levels[l]}
      />

      <EnumSelect
        label={filterBar.area}
        allLabel={filterBar.allOption}
        value={area ?? ''}
        onChange={setArea}
        options={JOB_AREAS}
        renderOption={(a) => messages.jobs.areas[a]}
      />

      <TextField
        size="small"
        label={filterBar.location}
        value={location || ''}
        onChange={(e) => {
          setLocation(e.target.value || undefined);
        }}
        sx={{ minWidth: 170 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={remoteOnly}
            onChange={(e) => {
              setRemoteOnly(e.target.checked);
            }}
          />
        }
        label={filterBar.remoteOnly}
      />

      <NullableNumberSelect
        label={filterBar.maxAgeDays}
        allLabel={filterBar.allOption}
        value={maxAgeDays}
        onChange={setMaxAgeDays}
        minWidth={160}
        options={ageOptions.map((opt) => ({
          value: opt.value,
          label: ageLabels[opt.key],
        }))}
      />

      <FormControlLabel
        control={
          <Switch
            checked={preset === 'profile'}
            onChange={(e) => {
              setPreset(e.target.checked ? 'profile' : null);
            }}
          />
        }
        label={filterBar.useProfileFilters}
      />

      <Button
        onClick={resetFilters}
        variant="text"
        size="small"
        sx={{ ml: { sm: 'auto' } }}
      >
        {filterBar.reset}
      </Button>
    </Stack>
  );
}
