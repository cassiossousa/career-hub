import {
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
import { getDictionary } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/Provider';
import { type LabelEntry, labelEntryKey } from '../../services/skills';
import { LOCALES, type Locale } from '../../types/i18n';

const LABEL_MAX_LENGTH = 100;

const fallbackLabel = (entry: LabelEntry, locale: Locale) => {
  if (entry.kind === 'skill') return entry.name;
  return getDictionary(locale).resumes.skillGroups.categories[entry.group];
};

interface LabelsTableProps {
  rows: LabelEntry[];
  onLabelChange: (key: string, locale: Locale, value: string) => void;
  disabled?: boolean | undefined;
}

export function LabelsTable({
  rows,
  onLabelChange,
  disabled,
}: LabelsTableProps) {
  const { messages } = useTranslation();
  const t = messages.skills;
  const keys = useListKeys(rows.length);
  const categoryNames = messages.resumes.skillGroups.categories;
  const localeNames = messages.common.locales;

  const entityLabel = (entry: LabelEntry) => {
    const kind = entry.kind === 'skill' ? t.kindSkill : t.kindGroup;
    const title =
      entry.kind === 'skill' ? entry.name : categoryNames[entry.group];
    return `${kind}: ${title}`;
  };

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 520 }}>
        <TableHead>
          <TableRow>
            <TableCell>{t.entityColumn}</TableCell>
            {LOCALES.map((locale) => (
              <TableCell key={locale}>{localeNames[locale]}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            const title =
              row.kind === 'skill' ? row.name : categoryNames[row.group];
            const caption =
              row.kind === 'skill' ? categoryNames[row.group] : t.kindGroup;
            return (
              <TableRow key={keys[index]}>
                <TableCell sx={{ minWidth: 200 }}>
                  <Typography variant="body2">{title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.kind === 'skill'
                      ? `${t.kindSkill} · ${caption}`
                      : caption}
                  </Typography>
                </TableCell>
                {LOCALES.map((locale) => (
                  <TableCell key={locale} sx={{ minWidth: 160 }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={row.labels[locale] ?? ''}
                      placeholder={fallbackLabel(row, locale)}
                      disabled={disabled}
                      slotProps={{
                        htmlInput: {
                          'aria-label': `${entityLabel(row)} ${localeNames[locale]}`,
                          maxLength: LABEL_MAX_LENGTH,
                        },
                      }}
                      onChange={(e) => {
                        onLabelChange(
                          labelEntryKey(row),
                          locale,
                          e.target.value,
                        );
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
