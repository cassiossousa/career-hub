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
} from '@mui/material';
import { EditableRowsTable } from '../../components/EditableRowsTable/EditableRowsTable';
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
  const groupLabels = messages.resumes.skillGroups.categories;

  return (
    <EditableRowsTable<SkillRowDraft>
      rows={rows}
      onChange={onChange}
      disabled={disabled}
      minWidth={560}
      emptyText={t.empty}
      addLabel={t.addSkill}
      createRow={() => ({ id: null, name: '', group: SKILL_CATEGORIES[0] })}
      headerCells={
        <>
          <TableCell>{t.skillColumn}</TableCell>
          <TableCell>{t.groupColumn}</TableCell>
          <TableCell />
        </>
      }
      renderRow={(row, index, { disabled: rowDisabled, update, remove }) => (
        <TableRow>
          <TableCell sx={{ minWidth: 200 }}>
            <TextField
              size="small"
              fullWidth
              value={row.name}
              disabled={rowDisabled}
              slotProps={{
                htmlInput: {
                  'aria-label': `${t.skillColumn} ${index + 1}`,
                },
              }}
              onChange={(e) => {
                update({ name: e.target.value });
              }}
            />
          </TableCell>
          <TableCell sx={{ minWidth: 180 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t.groupColumn}</InputLabel>
              <Select
                value={row.group}
                label={t.groupColumn}
                disabled={rowDisabled}
                onChange={(e) => {
                  update({ group: e.target.value });
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
                item: row.name.trim() === '' ? `${index + 1}` : row.name.trim(),
              })}
              disabled={rowDisabled}
              onClick={remove}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </TableRow>
      )}
    />
  );
}
