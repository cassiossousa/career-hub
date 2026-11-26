import DeleteIcon from '@mui/icons-material/Delete';
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { interpolate } from '../../i18n/interpolate';
import { useTranslation } from '../../i18n/Provider';
import {
  FACT_KEY_MAX_LENGTH,
  FACT_VALUE_MAX_LENGTH,
  type FactRowDraft,
} from '../../services/facts';
import {
  FACT_CATEGORIES,
  FACT_SENSITIVITIES,
} from '../../services/types/facts';

interface FactRowProps {
  row: FactRowDraft;
  index: number;
  disabled?: boolean | undefined;
  onChange: (patch: Partial<FactRowDraft>) => void;
  onRemove: () => void;
}

export function FactRow({
  row,
  index,
  disabled,
  onChange,
  onRemove,
}: FactRowProps) {
  const { messages } = useTranslation();
  const t = messages.facts;

  return (
    <TableRow>
      <TableCell sx={{ minWidth: 160 }}>
        {row.isNew ? (
          <TextField
            size="small"
            fullWidth
            value={row.key}
            disabled={disabled}
            placeholder="work_authorization"
            slotProps={{
              htmlInput: {
                'aria-label': `${t.keyColumn} ${index + 1}`,
                maxLength: FACT_KEY_MAX_LENGTH,
              },
            }}
            onChange={(e) => {
              onChange({ key: e.target.value });
            }}
          />
        ) : (
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {row.key}
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ minWidth: 160 }}>
        <FormControl size="small" fullWidth>
          <InputLabel>{t.categoryColumn}</InputLabel>
          <Select
            value={row.category}
            label={t.categoryColumn}
            disabled={disabled}
            onChange={(e) => {
              onChange({ category: e.target.value });
            }}
          >
            {FACT_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {t.categories[category]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell sx={{ minWidth: 220 }}>
        <TextField
          size="small"
          fullWidth
          value={row.value}
          disabled={disabled}
          slotProps={{
            htmlInput: {
              'aria-label': `${t.valueColumn} ${index + 1}`,
              maxLength: FACT_VALUE_MAX_LENGTH,
            },
          }}
          onChange={(e) => {
            onChange({ value: e.target.value });
          }}
        />
      </TableCell>
      <TableCell sx={{ minWidth: 140 }}>
        <FormControl size="small" fullWidth>
          <InputLabel>{t.sensitivityColumn}</InputLabel>
          <Select
            value={row.sensitivity}
            label={t.sensitivityColumn}
            disabled={disabled}
            onChange={(e) => {
              onChange({ sensitivity: e.target.value });
            }}
          >
            {FACT_SENSITIVITIES.map((sensitivity) => (
              <MenuItem key={sensitivity} value={sensitivity}>
                {t.sensitivities[sensitivity]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell align="right">
        <IconButton
          aria-label={interpolate(messages.common.deleteItem, {
            item: row.key.trim() === '' ? `${index + 1}` : row.key.trim(),
          })}
          disabled={disabled}
          onClick={onRemove}
          size="small"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
