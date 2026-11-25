import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { useTranslation } from '../../i18n/Provider';
import { isApiError, isUnreachableError } from '../../services/api/client';
import type { Translation } from '../../types/i18n';

export function LoadingState({ label }: { label?: string }) {
  const { messages } = useTranslation();

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{ display: 'flex', justifyContent: 'center', p: 3 }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <CircularProgress
          size={20}
          aria-label={label ?? messages.common.loading}
        />
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
  subject?: string | undefined;
  detail?: string | undefined;
  onRetry?: (() => void) | undefined;
  retryLabel?: string | undefined;
}

export function ErrorState({
  message,
  subject,
  detail,
  onRetry,
  retryLabel,
}: ErrorStateProps) {
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
      <Stack spacing={0.5}>
        {subject !== undefined && (
          <Typography variant="subtitle2" component="div">
            {subject}
          </Typography>
        )}
        <Typography variant="body2" component="div">
          {message}
        </Typography>
        {detail !== undefined && detail !== message && (
          <Typography
            variant="caption"
            component="div"
            sx={{ opacity: 0.8, overflowWrap: 'anywhere' }}
          >
            {detail}
          </Typography>
        )}
      </Stack>
    </Alert>
  );
}

interface SkeletonGridProps {
  count?: number;
  variant?: 'card' | 'row';
}

export function SkeletonGrid({
  count = 4,
  variant = 'card',
}: SkeletonGridProps) {
  const { messages } = useTranslation();
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <Box
      role="status"
      aria-label={messages.common.loading}
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns:
          variant === 'card'
            ? { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }
            : '1fr',
      }}
    >
      {items.map((i) =>
        variant === 'card' ? (
          <Box key={i} sx={{ p: 2 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="80%" />
          </Box>
        ) : (
          <Stack
            key={i}
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', p: 1 }}
          >
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" width="30%" />
            </Box>
          </Stack>
        ),
      )}
    </Box>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
      {icon !== undefined && icon !== null && (
        <Box sx={{ color: 'text.secondary', mb: 1 }}>{icon}</Box>
      )}
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

function describeQueryError(
  error: unknown,
  messages: Translation,
): { message: string; detail?: string } {
  const detail = errorMessage(error);
  if (isApiError(error) && error.code.toLowerCase() === 'unauthorized') {
    return { message: messages.common.errors.unauthorized, detail };
  }
  if (isUnreachableError(error)) {
    return { message: messages.common.errors.unreachable, detail };
  }
  return { message: detail };
}

interface QueryErrorAlertProps {
  error: unknown;
  subject?: string | undefined;
  onRetry?: (() => void) | undefined;
}

export function QueryErrorAlert({
  error,
  subject,
  onRetry,
}: QueryErrorAlertProps) {
  const { messages } = useTranslation();
  const { message, detail } = describeQueryError(error, messages);

  return (
    <ErrorState
      subject={subject}
      message={message}
      detail={detail}
      retryLabel={messages.common.retry}
      onRetry={onRetry}
    />
  );
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
  subject?: string;
  isEmpty?: (data: T) => boolean;
  empty: ReactNode;
  loading?: ReactNode;
  children: (data: T) => ReactNode;
}

export function QueryGate<T>({
  query,
  subject,
  isEmpty,
  empty,
  loading,
  children,
}: QueryGateProps<T>) {
  const { messages } = useTranslation();

  if (query.isLoading) {
    return <>{loading ?? <LoadingState label={messages.common.loading} />}</>;
  }

  if (query.isError) {
    return (
      <QueryErrorAlert
        error={query.error}
        subject={subject}
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
