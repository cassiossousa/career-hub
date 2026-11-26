import { TableCell } from '@mui/material';
import { EditableRowsTable } from '../../components/EditableRowsTable/EditableRowsTable';
import { useTranslation } from '../../i18n/Provider';
import type { FactRowDraft } from '../../services/facts';
import { FactRow } from './FactRow';

interface FactsTableProps {
  rows: FactRowDraft[];
  onChange: (rows: FactRowDraft[]) => void;
  disabled?: boolean | undefined;
}

export function FactsTable({ rows, onChange, disabled }: FactsTableProps) {
  const { messages } = useTranslation();
  const t = messages.facts;

  return (
    <EditableRowsTable<FactRowDraft>
      rows={rows}
      onChange={onChange}
      disabled={disabled}
      minWidth={720}
      emptyText={t.empty}
      addLabel={t.addFact}
      createRow={() => ({
        key: '',
        category: 'identity',
        value: '',
        sensitivity: 'normal',
        isNew: true,
      })}
      headerCells={
        <>
          <TableCell>{t.keyColumn}</TableCell>
          <TableCell>{t.categoryColumn}</TableCell>
          <TableCell>{t.valueColumn}</TableCell>
          <TableCell>{t.sensitivityColumn}</TableCell>
          <TableCell />
        </>
      }
      renderRow={(row, index, { disabled: rowDisabled, update, remove }) => (
        <FactRow
          row={row}
          index={index}
          disabled={rowDisabled}
          onChange={update}
          onRemove={remove}
        />
      )}
    />
  );
}
