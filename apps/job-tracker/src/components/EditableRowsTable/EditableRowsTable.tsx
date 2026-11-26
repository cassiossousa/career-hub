import AddIcon from '@mui/icons-material/Add';
import {
  Button,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Fragment, type ReactNode } from 'react';
import { useListKeys } from '../EntryEditors/EntryEditors';

interface EditableRowControls<T> {
  disabled?: boolean | undefined;
  update: (patch: Partial<T>) => void;
  remove: () => void;
}

interface EditableRowsTableProps<T extends object> {
  rows: T[];
  onChange: (rows: T[]) => void;
  disabled?: boolean | undefined;
  minWidth: number;
  emptyText: string;
  addLabel: string;
  createRow: () => T;
  /** Header cells, including any trailing action column. */
  headerCells: ReactNode;
  renderRow: (
    row: T,
    index: number,
    controls: EditableRowControls<T>,
  ) => ReactNode;
}

/**
 * Editable rows table shell shared by the row-editor features (skills,
 * facts): empty state, keyed rows, patch/remove helpers, add button.
 */
export function EditableRowsTable<T extends object>({
  rows,
  onChange,
  disabled,
  minWidth,
  emptyText,
  addLabel,
  createRow,
  headerCells,
  renderRow,
}: EditableRowsTableProps<T>) {
  const keys = useListKeys(rows.length);

  const updateAt = (index: number, patch: Partial<T>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeAt = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <Stack spacing={1.5}>
      {rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {emptyText}
        </Typography>
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth }}>
            <TableHead>
              <TableRow>{headerCells}</TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <Fragment key={keys[index]}>
                  {renderRow(row, index, {
                    disabled,
                    update: (patch) => {
                      updateAt(index, patch);
                    },
                    remove: () => {
                      removeAt(index);
                    },
                  })}
                </Fragment>
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
        onClick={() => {
          onChange([...rows, createRow()]);
        }}
        sx={{ alignSelf: 'flex-start' }}
      >
        {addLabel}
      </Button>
    </Stack>
  );
}
