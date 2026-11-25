import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {
  Alert,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  type SxProps,
  type Theme,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import {
  LoadingState,
  QueryErrorAlert,
} from '../../components/AsyncStatus/AsyncStatus';
import { useTranslation } from '../../i18n/Provider';

interface QueryLike<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

interface PanelGateProps<T> {
  query: QueryLike<T>;
  subject?: string | undefined;
  children: (data: T) => ReactNode;
}

/** Loading/error gate for hub panels; `data` may legitimately be `null`. */
export function PanelGate<T>({ query, subject, children }: PanelGateProps<T>) {
  const { messages } = useTranslation();

  if (query.isLoading) {
    return <LoadingState label={messages.common.loading} />;
  }
  if (query.isError) {
    return (
      <QueryErrorAlert
        error={query.error}
        subject={subject}
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }
  if (query.data === undefined) {
    return null;
  }
  return <>{children(query.data)}</>;
}

interface QueryErrorLike {
  error: unknown;
  refetch: () => unknown;
}

/** Error alert that retries the failed query — shared by hub panels and editors. */
export function QueryErrorState({
  query,
  subject,
}: {
  query: QueryErrorLike;
  subject?: string | undefined;
}) {
  return (
    <QueryErrorAlert
      error={query.error}
      subject={subject}
      onRetry={() => {
        void query.refetch();
      }}
    />
  );
}

/** Bordered card used for interviews, contacts, and offers rows. */
export function ItemCard({ children }: { children: ReactNode }) {
  return (
    <Stack
      spacing={0.5}
      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5 }}
    >
      {children}
    </Stack>
  );
}

/** Title row for item cards; trailing content (chips, delete) goes in children. */
export function ItemHeader({
  title,
  children,
}: {
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <Typography variant="subtitle2">{title}</Typography>
      {children}
    </Stack>
  );
}

interface ItemDeleteButtonProps {
  label: string;
  pending: boolean;
  onClick: () => void;
}

export function ItemDeleteButton({
  label,
  pending,
  onClick,
}: ItemDeleteButtonProps) {
  return (
    <IconButton
      size="small"
      aria-label={label}
      sx={{ ml: 'auto' }}
      disabled={pending}
      onClick={onClick}
    >
      <DeleteOutlinedIcon fontSize="small" />
    </IconButton>
  );
}

/** Secondary metadata line joined with `·`. */
export function joinedMeta(parts: (string | null | undefined)[]): string {
  return parts
    .filter(
      (part): part is string =>
        part !== null && part !== undefined && part !== '',
    )
    .join(' · ');
}

export function MetaText({ text }: { text: string }) {
  return (
    <Typography variant="body2" color="text.secondary">
      {text}
    </Typography>
  );
}

/** Outlined button that reveals a create form. */
export function AddItemButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outlined"
      size="small"
      sx={{ alignSelf: 'flex-start' }}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

interface EnumSelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  optionLabel: (option: T) => string;
  onChange: (value: T) => void;
  sx?: SxProps<Theme> | undefined;
}

/** Small labelled select over a fixed string enum. */
export function EnumSelectField<T extends string>({
  label,
  value,
  options,
  optionLabel,
  onChange,
  sx,
}: EnumSelectFieldProps<T>) {
  return (
    <FormControl size="small" sx={sx ?? { flex: 1 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(event) => {
          const next = options.find((option) => option === event.target.value);
          if (next !== undefined) onChange(next);
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {optionLabel(option)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

/** Responsive row wrapper for form fields. */
export function FieldRow({ children }: { children: ReactNode }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5 }}>
      {children}
    </Stack>
  );
}

interface FormActionsProps {
  submitLabel: string;
  pending: boolean;
  disabled?: boolean | undefined;
  onSubmit: () => void;
  onCancel: () => void;
  error?: boolean | undefined;
}

export function FormActions({
  submitLabel,
  pending,
  disabled = false,
  onSubmit,
  onCancel,
  error = false,
}: FormActionsProps) {
  const { messages } = useTranslation();
  return (
    <Stack spacing={1}>
      <Stack direction="row" sx={{ gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          disabled={disabled || pending}
          onClick={onSubmit}
        >
          {submitLabel}
        </Button>
        <Button size="small" onClick={onCancel}>
          {messages.common.cancel}
        </Button>
      </Stack>
      {error && <Alert severity="error">{messages.common.error}</Alert>}
    </Stack>
  );
}

interface MutationFormActionsProps {
  mutation: { isPending: boolean; isError: boolean };
  submitLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
  disabled?: boolean | undefined;
}

/** `FormActions` pre-wired to a react-query mutation's pending/error state. */
export function MutationFormActions({
  mutation,
  submitLabel,
  onSubmit,
  onCancel,
  disabled,
}: MutationFormActionsProps) {
  return (
    <FormActions
      submitLabel={submitLabel}
      pending={mutation.isPending}
      disabled={disabled}
      onSubmit={onSubmit}
      onCancel={onCancel}
      error={mutation.isError}
    />
  );
}
