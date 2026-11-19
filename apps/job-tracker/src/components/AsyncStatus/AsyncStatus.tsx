import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { useTranslation } from '../../i18n/Provider';

export function LoadingState({ label }: { label?: string }) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{ display: 'flex', justifyContent: 'center', p: 3 }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <CircularProgress size={20} />
        {label && (
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ message, onRetry, retryLabel }: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : undefined
      }
    >
      {message}
    </Alert>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      {action !== undefined && action !== null ? (
        <Box sx={{ mt: 2 }}>{action}</Box>
      ) : null}
    </Box>
  );
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

interface QueryLike<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

interface QueryGateProps<T> {
  query: QueryLike<T>;
  isEmpty?: (data: T) => boolean;
  empty: ReactNode;
  children: (data: T) => ReactNode;
}

export function QueryGate<T>({
  query,
  isEmpty,
  empty,
  children,
}: QueryGateProps<T>) {
  const { messages } = useTranslation();

  if (query.isLoading) {
    return <LoadingState label={messages.common.loading} />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message={errorMessage(query.error)}
        retryLabel={messages.common.retry}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const data = query.data;
  if (data === undefined || isEmpty?.(data)) {
    return <>{empty}</>;
  }

  return <>{children(data)}</>;
}
