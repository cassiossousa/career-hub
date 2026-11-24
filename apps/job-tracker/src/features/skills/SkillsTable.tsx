import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useListKeys } from '../../components/EntryEditors/EntryEditors';
import { interpolate } from '../../i18n/interpolate';
import { useTranslation } from '../../i18n/Provider';
import type { SkillRowDraft } from '../../services/skills';
import { SKILL_CATEGORIES } from '../../services/types/portfolio';

interface SkillsTableProps {
  rows: SkillRowDraft[];
  onChange: (rows: SkillRowDraft[]) => void;
  disabled?: boolean | undefined;
}

export function SkillsTable({ rows, onChange, disabled }: SkillsTableProps) {
  const { messages } = useTranslation();
  const t = messages.skills;
  const keys = useListKeys(rows.length);
  const groupLabels = messages.resumes.skillGroups.categories;

  const updateAt = (index: number, patch: Partial<SkillRowDraft>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeAt = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onChange([...rows, { id: null, name: '', group: SKILL_CATEGORIES[0] }]);
  };

  return (
    <Stack spacing={1.5}>
      {rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t.empty}
        </Typography>
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 560 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t.skillColumn}</TableCell>
                <TableCell>{t.groupColumn}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={keys[index]}>
                  <TableCell sx={{ minWidth: 200 }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={row.name}
                      disabled={disabled}
                      slotProps={{
                        htmlInput: {
                          'aria-label': `${t.skillColumn} ${index + 1}`,
                        },
                      }}
                      onChange={(e) => {
                        updateAt(index, { name: e.target.value });
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 180 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>{t.groupColumn}</InputLabel>
                      <Select
                        value={row.group}
                        label={t.groupColumn}
                        disabled={disabled}
                        onChange={(e) => {
                          updateAt(index, { group: e.target.value });
                        }}
                      >
                        {SKILL_CATEGORIES.map((category) => (
                          <MenuItem key={category} value={category}>
                            {groupLabels[category]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label={interpolate(messages.common.deleteItem, {
                        item:
                          row.name.trim() === ''
                            ? `${index + 1}`
                            : row.name.trim(),
                      })}
                      disabled={disabled}
                      onClick={() => {
                        removeAt(index);
                      }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Button
        variant="outlined"
        size="small"
        startIcon={<AddIcon />}
        disabled={disabled}
        onClick={addRow}
        sx={{ alignSelf: 'flex-start' }}
      >
        {t.addSkill}
      </Button>
    </Stack>
  );
}
